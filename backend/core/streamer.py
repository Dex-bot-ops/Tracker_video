"""
Module orchestrant le flux vidéo et l'IA.
Sert de pont de communication en temps réel entre le frontend (React) et les services backend via WebSocket.
"""

import asyncio
import json
from fastapi import WebSocket, WebSocketDisconnect

from core.camera import CameraService
from core.ai import AIEngine
from core.tracker import LineTracker
from core.hardware import HardwareMonitor


class VideoStreamer:
    """
    Orchestrateur asynchrone pour la réception d'images, le traitement IA et l'envoi de résultats.
    """

    def __init__(self):
        self.cam_service = CameraService()
        self.ai_engine = AIEngine()
        self.tracker = LineTracker()
        self.hw_monitor = HardwareMonitor()
        self.app_state = "IDLE"
        self.stream_width = 640  # Largeur cible pour alléger le flux réseau

    async def handle_connection(self, websocket: WebSocket):
        await websocket.accept()
        listener_task = asyncio.create_task(self._listen_to_frontend(websocket))

        try:
            while not listener_task.done():
                if self.app_state == "IDLE":
                    await websocket.send_json(
                        {
                            "state": "IDLE",
                            "image": None,
                            "detections": [],
                            "stats": self.tracker.get_stats(),
                            "hardware": self.hw_monitor.get_stats(),
                            "cameras": self.cam_service.available_cameras,
                        }
                    )
                    await asyncio.sleep(0.1)
                    continue

                frame = self.cam_service.get_frame()
                if frame is None:
                    await asyncio.sleep(0.1)
                    continue

                try:
                    if self.app_state == "CONFIG":
                        frame_base64 = self.cam_service.encode_frame(
                            frame, target_width=self.stream_width
                        )
                        await websocket.send_json(
                            {
                                "state": "CONFIG",
                                "image": frame_base64,
                                "detections": [],
                                "stats": self.tracker.get_stats(),
                                "hardware": self.hw_monitor.get_stats(),
                                "cameras": self.cam_service.available_cameras,
                            }
                        )

                    elif self.app_state == "AI_MODE":
                        # 1. Traitement IA sur la haute résolution
                        detections = await asyncio.to_thread(
                            self.ai_engine.process_frame, frame
                        )
                        self.tracker.update(detections)

                        # 2. Encodage allégé de l'image
                        frame_base64 = self.cam_service.encode_frame(
                            frame, target_width=self.stream_width
                        )

                        # 3. Mise à l'échelle des coordonnées pour le Canvas React
                        h, w = frame.shape[:2]
                        ratio = self.stream_width / float(w)
                        display_detections = []

                        for d in detections:
                            scaled_box = [int(coord * ratio) for coord in d["bbox"]]
                            display_detections.append(
                                {"id": d["id"], "bbox": scaled_box}
                            )

                        wait_time = (
                            0.03 if isinstance(self.cam_service.source, int) else 0.02
                        )
                        await asyncio.sleep(wait_time)

                        await websocket.send_json(
                            {
                                "state": "AI_MODE",
                                "image": frame_base64,
                                "detections": display_detections,  # Envoi des coordonnées réduites
                                "stats": self.tracker.get_stats(),
                                "hardware": self.hw_monitor.get_stats(),
                                "cameras": self.cam_service.available_cameras,
                            }
                        )
                except RuntimeError:
                    print("Erreur d'exécution vidéo (RuntimeError)")
                    break

                await asyncio.sleep(0.03)

        except WebSocketDisconnect:
            print("Client déconnecté")
        finally:
            listener_task.cancel()
            self.cam_service.stop()
            self.app_state = "IDLE"

    async def _listen_to_frontend(self, websocket: WebSocket):
        try:
            while True:
                data = await websocket.receive_text()
                message = json.loads(data)
                action = message.get("action")
                params = message.get("params", {})

                if action == "SELECT_SOURCE":
                    video_source = params.get("source")
                    self.cam_service.start(source=video_source)
                    self.app_state = "CONFIG" if video_source is not None else "IDLE"

                elif action == "START_AI":
                    print("Démarrage IA avec config:", params)
                    video_width, _ = (
                        self.cam_service.get_resolution()
                    )  # On ajoute self.stream_width ici !
                    self.tracker.set_config(params, video_width, self.stream_width)
                    self.ai_engine.set_confidence(params.get("confidence", 50))
                    self.app_state = "AI_MODE"

                elif action == "STOP_AI":
                    print("Arrêt IA")
                    self.app_state = "CONFIG"

                elif action == "RESET_STATS":
                    print("Réinitialisation des compteurs")
                    self.tracker.reset()

        except WebSocketDisconnect:
            pass

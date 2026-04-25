"""
Module en charge de la gestion des sources vidéo.
Fournit une interface pour interagir avec des caméras physiques ou des fichiers vidéos.
"""

import cv2
import base64
import numpy as np
import time
import sys
import threading


class CameraService:
    """
    Service responsable de la capture, de la lecture et de l'encodage des flux vidéo.
    """

    def __init__(self):
        self.cap = None
        self.default_width = 1280
        self.default_height = 720
        self.source = None

        self.current_frame = None
        self.frame_ready = False
        self.is_running = False
        self.thread = None

        print("Recherche des caméras disponibles...")
        self.available_cameras = self._scan_cameras()
        print(f"Caméras trouvées : {self.available_cameras}")

    def _scan_cameras(self, max_tests: int = 3) -> list:
        cameras = []
        video_backend = cv2.CAP_DSHOW if sys.platform.startswith("win") else cv2.CAP_ANY

        for i in range(max_tests):
            cap = cv2.VideoCapture(i, video_backend)
            if cap is not None and cap.isOpened():
                cameras.append({"id": i, "name": f"Webcam Intégrée/USB ({i})"})
                cap.release()
        return cameras

    def start(self, source="KEEP_CURRENT"):
        if source != "KEEP_CURRENT":
            self.source = source

        self.stop()

        if self.source is None:
            return

        if isinstance(self.source, int):
            video_backend = (
                cv2.CAP_DSHOW if sys.platform.startswith("win") else cv2.CAP_ANY
            )
            self.cap = cv2.VideoCapture(self.source, video_backend)
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, self.default_width)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, self.default_height)
        elif isinstance(self.source, str):
            self.cap = cv2.VideoCapture(self.source)

        if self.cap and self.cap.isOpened():
            self.is_running = True
            self.thread = threading.Thread(target=self._update_frame, daemon=True)
            self.thread.start()

    def _update_frame(self):
        while self.is_running and self.cap and self.cap.isOpened():
            success, frame = self.cap.read()
            if success:
                self.current_frame = frame
                self.frame_ready = True
            else:
                if isinstance(self.source, str):
                    self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                else:
                    self.frame_ready = False
                    time.sleep(0.1)
            time.sleep(0.005)

    def get_resolution(self) -> tuple:
        if self.cap and self.cap.isOpened():
            w = self.cap.get(cv2.CAP_PROP_FRAME_WIDTH)
            h = self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT)
            return int(w) if w > 0 else self.default_width, int(
                h
            ) if h > 0 else self.default_height
        return self.default_width, self.default_height

    def get_frame(self):
        if self.source is None:
            return None

        if self.frame_ready and self.current_frame is not None:
            return self.current_frame.copy()

        if self.is_running:
            return np.zeros(
                (self.default_height, self.default_width, 3), dtype=np.uint8
            )

        fallback_frame = np.zeros(
            (self.default_height, self.default_width, 3), dtype=np.uint8
        )
        cv2.putText(
            fallback_frame,
            "ERREUR CAMERA - HORS LIGNE",
            (self.default_width // 2 - 250, self.default_height // 2),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 0, 255),
            2,
        )
        return fallback_frame

    def encode_frame(self, frame, target_width: int = 640) -> str:
        """
        Redimensionne et encode une image OpenCV en base64 pour transmission.
        Le redimensionnement allège drastiquement la charge réseau et React.

        Args:
            frame: L'image originale (ex: 1280x720).
            target_width: Largeur cible pour le frontend.

        Returns:
            str: Chaîne de caractères base64.
        """
        # 1. Calcul du ratio pour garder les proportions (aspect ratio)
        h, w = frame.shape[:2]
        ratio = target_width / float(w)
        target_height = int(h * ratio)

        # 2. Redimensionnement (INTER_LINEAR est le compromis parfait Vitesse/Qualité)
        resized_frame = cv2.resize(
            frame, (target_width, target_height), interpolation=cv2.INTER_LINEAR
        )

        # 3. Encodage JPEG avec une qualité de 75-80% (suffisant pour de la supervision)
        _, buffer = cv2.imencode(".jpg", resized_frame, [cv2.IMWRITE_JPEG_QUALITY, 80])

        return base64.b64encode(buffer).decode("utf-8")

    def stop(self):
        self.is_running = False

        if self.thread is not None:
            self.thread.join(timeout=1.0)

        if self.cap is not None:
            self.cap.release()
            self.cap = None

        self.frame_ready = False

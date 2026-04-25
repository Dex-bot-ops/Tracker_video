"""
Module de gestion du moteur d'Intelligence Artificielle.
Intègre le modèle YOLO pour la détection et le tracking de personnes.
"""

import torch  # 1. AJOUT : Import de PyTorch pour la détection matérielle
from ultralytics import YOLO


class AIEngine:
    """
    Gestionnaire du modèle IA pour le traitement des images vidéo.
    """

    def __init__(self, model_path: str = None):
        """
        Initialise le modèle YOLO avec le chemin spécifié.

        Args:
            model_path (str): Le chemin vers le fichier du modèle YOLO.
        """
        if model_path is None:
            import os

            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            model_path = os.path.join(base_dir, "models", "yolov8s.torchscript")
        print("Initialisation du modèle IA...")

        # 2. AJOUT : Logique de détection matérielle (Résiliente)
        if torch.cuda.is_available():
            self.device = 0  # Utilise le premier GPU Nvidia disponible
            print("Moteur IA : GPU Nvidia (CUDA) activé.")
        elif torch.backends.mps.is_available():
            self.device = (
                "mps"  # Accélération matérielle pour puces Apple Silicon (M1/M2/M3...)
            )
            print("Moteur IA : Puce Apple Silicon (MPS) activée.")
        else:
            self.device = "cpu"  # Mode de secours universel
            print("Moteur IA : Aucun GPU compatible. Repli sur le CPU.")

        self.model = YOLO(model_path, task="detect")
        self.confidence = 0.50

    def set_confidence(self, conf_percentage: float):
        # ... Ce code reste inchangé ...
        self.confidence = float(conf_percentage) / 100.0
        print(f"Seuil de confiance IA mis à jour : {self.confidence}")

    def process_frame(self, frame) -> list[dict]:
        """
        Analyse une image pour détecter et suivre les personnes présentes.
        ...
        """
        results = self.model.track(
            source=frame,
            persist=True,
            tracker="bytetrack.yaml",
            classes=[0],
            conf=self.confidence,
            verbose=False,
            device=self.device,  # 3. MODIFICATION : Au lieu du "0" en dur, on met la variable dynamique
        )

        detections = []
        if results and results[0].boxes.id is not None:
            boxes = results[0].boxes.xyxy.int().cpu().tolist()
            ids = results[0].boxes.id.int().cpu().tolist()
            for box, track_id in zip(boxes, ids):
                detections.append({"id": track_id, "bbox": box})

        return detections

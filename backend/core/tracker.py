"""
Module de gestion du suivi (Tracking) et de vérification des franchissements de ligne.
"""

import math


class LineTracker:
    """
    Classe permettant de compter les entrées/sorties via le franchissement d'une ligne virtuelle.
    """

    def __init__(self):
        self.entries = 0
        self.exits = 0
        self.track_states = {}
        self.line_config = None
        self.a = 0
        self.b = 0
        self.c = 0
        self.tolerance = 0

    def set_config(
        self, config: dict, video_width: int = 1280, stream_width: int = 640
    ):
        """
        Configure les paramètres de la ligne de détection en adaptant les coordonnées
        du frontend (basse résolution) vers l'espace vidéo (haute résolution).
        """
        self.line_config = config

        ratio = video_width / stream_width

        cy = config.get("cy", 360 / ratio) * ratio
        offset_x = config.get("offsetX", 0) * ratio
        self.tolerance = config.get("tolerance", 30) * ratio

        angle_deg = config.get("angle", 0)
        angle_rad = math.radians(angle_deg)
        self.a = -math.sin(angle_rad)
        self.b = math.cos(angle_rad)

        cx = (video_width / 2) + offset_x
        self.c = -(self.a * cx + self.b * cy)

    def evaluate_position(self, x: float, y: float) -> int:
        distance = self.a * x + self.b * y + self.c

        if distance > self.tolerance:
            return 1
        elif distance < -self.tolerance:
            return -1
        else:
            return 0

    def update(self, detections: list):
        if not self.line_config:
            return

        current_ids = set()

        for det in detections:
            track_id = det["id"]
            current_ids.add(track_id)

            x1, y1, x2, y2 = det["bbox"]
            px = x1 + (x2 - x1) / 2
            py = y2

            current_side = self.evaluate_position(px, py)

            if track_id in self.track_states:
                previous_side = self.track_states[track_id]

                if current_side != 0 and current_side != previous_side:
                    if previous_side == -1 and current_side == 1:
                        self.entries += 1
                    elif previous_side == 1 and current_side == -1:
                        self.exits += 1

                    self.track_states[track_id] = current_side
            else:
                if current_side != 0:
                    self.track_states[track_id] = current_side

        lost_ids = [tid for tid in self.track_states.keys() if tid not in current_ids]
        for tid in lost_ids:
            del self.track_states[tid]

    def get_stats(self) -> dict:
        return {"entries": self.entries, "exits": self.exits}

    def reset(self):
        self.entries = 0
        self.exits = 0
        self.track_states.clear()

# Fichier : backend/tests/test_tracker.py
from backend.core.tracker import LineTracker


def test_line_tracker_evaluation():
    """
    Vérifie que la fonction mathématique positionne bien un point par rapport à une ligne.
    """
    tracker = LineTracker()

    # Configuration d'une ligne verticale parfaite au centre (x=640) d'une vidéo 1280x720
    # ratio 1:1 pour simplifier (video_width=1280, stream_width=1280)
    config = {
        "cy": 360,
        "offsetX": 0,
        "tolerance": 10,
        "angle": 90,  # Ligne droite verticale
    }
    tracker.set_config(config, video_width=1280, stream_width=1280)

    # Test : Point exactement sur la ligne (doit être 0 car dans la tolérance de 10)
    assert tracker.evaluate_position(640, 360) == 0

    # Test : Point loin à droite de la ligne
    assert (
        tracker.evaluate_position(800, 360) == -1
    )  # Ou 1 selon l'orientation de ta formule

    # Test : Point loin à gauche de la ligne
    assert tracker.evaluate_position(400, 360) == 1  # Ou -1 inversement


def test_line_tracker_crossing():
    """
    Simule une boîte englobante (bbox) qui traverse la ligne de haut en bas
    pour vérifier que le compteur d'entrées/sorties s'incrémente.
    """
    tracker = LineTracker()
    # Configuration : Ligne horizontale parfaite (angle=0) placée à y=360
    tracker.set_config(
        {"cy": 360, "offsetX": 0, "tolerance": 0, "angle": 0}, 1280, 1280
    )

    # Frame 1: L'objet est AU-DESSUS de la ligne
    # Bbox : [x1, y1, x2, y2]. Ici y2 = 340 (plus haut que la ligne à 360)
    tracker.update([{"id": 1, "bbox": [600, 300, 640, 340]}])
    assert tracker.get_stats() == {"entries": 0, "exits": 0}

    # Frame 2: L'objet avance et se retrouve EN-DESSOUS de la ligne
    # Ici y2 = 380 (plus bas que la ligne à 360)
    tracker.update([{"id": 1, "bbox": [600, 340, 640, 380]}])

    # Vérification : le franchissement (de y=340 à y=380) doit avoir déclenché un compteur
    stats = tracker.get_stats()
    assert stats["entries"] == 1 or stats["exits"] == 1

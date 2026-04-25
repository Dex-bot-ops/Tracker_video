# Fichier : backend/tests/test_hardware.py
from unittest import mock
from backend.core.hardware import HardwareMonitor


@mock.patch("psutil.virtual_memory")
def test_ram_stats(mock_virtual_memory):
    """
    Vérifie le calcul de la RAM en simulant (mockant) les valeurs retournées par l'OS.
    """
    # On simule un PC avec 16 Go de RAM, dont 8 Go disponibles
    mock_mem = mock.Mock()
    mock_mem.total = 16 * (1024**3)
    mock_mem.available = 8 * (1024**3)
    mock_virtual_memory.return_value = mock_mem

    monitor = HardwareMonitor()
    stats = monitor.get_ram_stats()

    assert stats["total"] == 16.0
    assert stats["used"] == 8.0
    assert stats["percentage"] == 50.0


def test_gpu_stats_fallback():
    """
    Vérifie que si aucun GPU n'est détecté, le système ne crashe pas
    et renvoie bien des valeurs nulles.
    """
    # Le serveur CI Ubuntu-latest n'a pas de GPU, donc pynvml va échouer silencieusement
    monitor = HardwareMonitor()
    stats = monitor.get_gpu_stats()

    assert stats["used"] == 0.0
    assert stats["total"] == 0.0
    assert stats["percentage"] == 0.0

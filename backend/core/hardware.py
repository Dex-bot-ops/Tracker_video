"""
Module de surveillance du matériel.
Récupère les statistiques d'utilisation de la RAM et du GPU.
"""

import psutil


class HardwareMonitor:
    """
    Moniteur matériel universel pour la charge système (RAM et GPU Nvidia si disponible).
    """

    def __init__(self):
        """
        Initialise le moniteur matériel et tente de détecter un GPU Nvidia activé.
        """
        try:
            from pynvml import nvmlInit, nvmlDeviceGetHandleByIndex

            nvmlInit()
            self.nvidia_device_handle = nvmlDeviceGetHandleByIndex(0)
            self.pynvml = True
            print("Moniteur matériel : GPU Nvidia détecté (pynvml activé).")
        except Exception:
            self.nvidia_device_handle = None
            self.pynvml = False
            print("Moniteur matériel : Non-Nvidia ou pas de GPU. Repli universel.")

    def get_ram_stats(self) -> dict:
        """
        Calcule l'utilisation de la RAM physique de manière précise.

        Returns:
            dict: Statistiques RAM avec valeurs utilisées, totales et en pourcentage.
        """
        mem = psutil.virtual_memory()

        total_gb = round(mem.total / (1024**3), 2)
        available_gb = round(mem.available / (1024**3), 2)

        used_gb = round(total_gb - available_gb, 2)
        percentage = round((used_gb / total_gb) * 100, 1)

        return {"used": used_gb, "total": total_gb, "percentage": percentage}

    def get_gpu_stats(self) -> dict:
        """
        Récupère l'utilisation du processeur de calcul GPU (Compute).
        Fonctionne uniquement si un GPU NVIDIA compatible et pynvml sont activés.

        Returns:
            dict: Statistiques GPU. Retourne des entiers nuls si le GPU est indisponible.
        """
        if self.pynvml and self.nvidia_device_handle:
            try:
                from pynvml import nvmlDeviceGetUtilizationRates

                utilization = nvmlDeviceGetUtilizationRates(self.nvidia_device_handle)

                return {"used": 0.0, "total": 0.0, "percentage": utilization.gpu}
            except Exception:
                pass

        return {"used": 0.0, "total": 0.0, "percentage": 0.0}

    def get_stats(self) -> dict:
        """
        Regroupe les statistiques générales détectées (RAM, GPU).

        Returns:
            dict: Les informations d'usage formatées pour le front-end.
        """
        return {"ram": self.get_ram_stats(), "gpu": self.get_gpu_stats()}

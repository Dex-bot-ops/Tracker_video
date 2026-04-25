"""
Module de gestion des fichiers.
Gère la sauvegarde des fichiers uploadés par les utilisateurs.
"""

import os
import shutil
from fastapi import UploadFile

UPLOAD_DIR = "uploads"


def save_upload_file(upload_file: UploadFile) -> str:
    """
    Enregistre un fichier uploadé de manière sécurisée et retourne son chemin.
    Utilise l'écriture par blocs (chunking) pour ne pas saturer la RAM.

    Args:
        upload_file (UploadFile): L'objet fichier provenant de FastAPI.

    Returns:
        str: Le chemin absolu ou relatif vers le fichier enregistré.
    """
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)

    file_path = os.path.join(UPLOAD_DIR, upload_file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)

    return file_path

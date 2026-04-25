"""
Point d'entrée principal de l'API FastAPI pour l'application Tracker Video.
Initialise la configuration du serveur HTTP, des WebSockets et du middleware CORS.
"""

import warnings
import os
import sys

# Ensure backend directory is in sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, WebSocket, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from core.file_manager import save_upload_file
from core.streamer import VideoStreamer

warnings.filterwarnings("ignore", message=".*pynvml package is deprecated.*")
os.environ["OPENCV_LOG_LEVEL"] = "FATAL"

app = FastAPI(
    title="Tracker Video API",
    description="API backend pour le traitement vidéo et l'IA du Tracker Video",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

streamer = VideoStreamer()


@app.post("/upload")
async def upload_video(file: UploadFile = File(...)):
    """
    Route HTTP pour uploader et sauvegarder un fichier vidéo.

    Args:
        file (UploadFile): Le fichier vidéo envoyé par le client.

    Returns:
        dict: Statut de l'opération et chemin du fichier en cas de succès.
    """
    try:
        file_path = save_upload_file(file)
        return {"status": "success", "file_path": file_path}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    Route WebSocket gérant la communication temps réel (vidéo, IA, statistiques).
    Délègue l'intégralité de la logique de connexion à la classe VideoStreamer.

    Args:
        websocket (WebSocket): L'instance de connexion WebSocket entrante.
    """
    await streamer.handle_connection(websocket)


@app.post("/shutdown")
async def shutdown():
    """
    Route pour éteindre le serveur proprement.
    """
    import signal
    import os

    # Kill the current process
    os.kill(os.getpid(), signal.SIGTERM)
    return {"status": "success", "message": "Server shutting down"}


static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
if os.path.exists(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")

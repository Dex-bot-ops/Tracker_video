@echo off
cd /d "%~dp0"
echo Lancement manuel du serveur Tracker Video...
start "" python\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
timeout /t 3 /nobreak >nul
start http://127.0.0.1:8000

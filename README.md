# 🎯 Tracker Video - Système de Comptage IA en Temps Réel

![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)
![YOLOv8](https://img.shields.io/badge/AI-YOLOv8-FF003C)
![Python](https://img.shields.io/badge/Python-3.9+-3776AB?logo=python&logoColor=white)

## 📝 Description

Ce projet est une application web full-stack de vision par ordinateur
conçue pour détecter, suivre et compter des personnes traversant une ligne
virtuelle en temps réel. Développé dans le cadre du BTS CIEL, il met en
œuvre une architecture moderne séparant strictement la logique métier
(IA/Vidéo) de l'interface utilisateur.

## ✨ Fonctionnalités Principales

- **Détection & Suivi (Tracking) :** Utilisation de YOLOv8 et ByteTrack pour
  identifier et maintenir un identifiant unique par personne.
- **Comptage Bidirectionnel :** Ligne de franchissement entièrement
  paramétrable (Hauteur, Inclinaison, Position Latérale) avec gestion de la
  tolérance (hystérésis).
- **Supervision en Temps Réel :** Flux vidéo et statistiques transmis en direct
  via WebSocket (à ~30 FPS).
- **Monitoring Matériel :** Suivi universel de la charge système (RAM Système
  et Processeur de calcul GPU / VRAM) pour garantir l'optimisation.
- **Architecture SOC (Separation of Concerns) :** Backend modulaire
  (`streamer.py`, `ai.py`, `hardware.py`) et Frontend optimisé (gestion des
  re-rendus avec `React.memo`).

---

## 🏗️ Architecture du Projet

Le projet est divisé en deux parties distinctes communiquant via WebSocket :

### 1. Backend (Python / FastAPI)

- **`main.py`** : Routeur API et gestionnaire des connexions réseau (HTTP &
  WebSockets).
- **`core/streamer.py`** : Orchestrateur centralisant la caméra, l'IA et l'envoi
  des données.
- **`core/ai.py`** : Moteur d'inférence (YOLOv8).
- **`core/tracker.py`** : Logique mathématique de franchissement de ligne.
- **`core/hardware.py`** : Sonde de performances (CPU/RAM/GPU).

### 2. Frontend (React / Vite / TypeScript)

- Interface industrielle de contrôle.
- Communication asynchrone et décodage du flux vidéo Base64.
- Composants isolés pour des performances d'affichage maximales.

---

## 🚀 Installation & Démarrage

### Prérequis

- Node.js (v18+)
- Python 3.9+
- Un environnement virtuel Python (recommandé)

### Installation du Backend

1. Naviguer dans le dossier du backend (ou à la racine selon votre structure) :

   ```bash
   cd backend
   ```

2. Créer et activer un environnement virtuel :

   ```bash
   python -m venv venv
   source venv/bin/activate  # Sur Windows : venv\Scripts\activate
   ```

3. Installer les dépendances :

   ```bash
   pip install fastapi uvicorn ultralytics opencv-python psutil websockets pynvml
   ```

4. Démarrer le serveur :

  ```bash
   uvicorn main:app --reload --port 8000
   ```

### Installation du Frontend

1. Ouvrir un nouveau terminal et naviguer à la racine du frontend :

   ```bash
   npm install
   ```

2. Démarrer le serveur de développement :

   ```bash
   npm run dev
   ```

3. Ouvrir l'URL affichée dans le terminal (généralement `http://localhost:5173`).

---

## ⚙️ Configuration & Utilisation

1. **Source Vidéo :** Sélectionnez une webcam (0, 1) ou une vidéo MP4 via le
   menu déroulant.
2. **Géométrie :** Ajustez la ligne verte pour qu'elle corresponde au point de
   passage souhaité (utilisez l'inclinaison pour simuler la perspective).
3. **Moteur IA :** Réglez la confiance (baissez le seuil en cas de mauvaise
   luminosité) et la tolérance de franchissement.
4. **Action :** Cliquez sur "Démarrer l'analyse". Les boîtes rouges et les IDs
   de tracking apparaîtront en direct.

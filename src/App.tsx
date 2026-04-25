// src/App.tsx

import { useState, useEffect, useCallback } from 'react';
import { useWebsocket } from './hooks/useWebsocket';
import { VideoCanvas } from './components/VideoCanvas';
import { Dashboard } from './components/Dashboard';
import { ConfigPanel } from './components/ConfigPanel';

import { LogViewer } from './components/LogViewer';
import { HardwarePanel } from './components/HardwarePanel';
import type { LineConfig } from './types';
import './index.css';

function App() {
  const wsUrl = `ws://${window.location.host}/ws`;
  const { data, isConnected, sendMessage } = useWebsocket(wsUrl);
  const [isAiRunning, setIsAiRunning] = useState(false);
  const [lineConfig, setLineConfig] = useState<LineConfig>({
    cy: 360,
    offsetX: 0,
    angle: 0,
    tolerance: 30,
    confidence: 50,
  });

  useEffect(() => {
    if (isAiRunning) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      setLineConfig((prev) => {
        if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return prev;
        e.preventDefault();
        let newCy = prev.cy;
        let newAngle = prev.angle;
        if (e.key === 'ArrowUp') newCy -= 10;
        if (e.key === 'ArrowDown') newCy += 10;
        if (e.key === 'ArrowLeft') newAngle -= 5;
        if (e.key === 'ArrowRight') newAngle += 5;
        return { ...prev, cy: newCy, angle: newAngle };
      });
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAiRunning]);

  const toggleEngine = useCallback(() => {
    if (isAiRunning) {
      sendMessage('STOP_AI');
      setIsAiRunning(false);
    } else {
      sendMessage('START_AI', lineConfig);
      setIsAiRunning(true);
    }
  }, [isAiRunning, sendMessage, lineConfig]);

  const handleSelectSource = useCallback(
    (source: number | string | null) => {
      sendMessage('SELECT_SOURCE', { source });
    },
    [sendMessage],
  );

  return (
    <>
      {/* 1. AJOUT : Bannière d'alerte globale en cas de perte de connexion */}
      {!isConnected && (
        <div
          style={{
            backgroundColor: '#e9730c', // Orange SAP Fiori pour un avertissement
            color: 'white',
            textAlign: 'center',
            padding: '8px',
            fontWeight: 'bold',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            zIndex: 1000,
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        >
          ⚠️ Connexion au serveur perdue. Tentative de reconnexion en cours...
        </div>
      )}

      {/* 2. MODIFICATION : Ajout d'un padding-top dynamique pour ne pas cacher le contenu avec la bannière */}
      <div
        className="layout-root"
        style={{ paddingTop: !isConnected ? 'calc(1.5rem + 35px)' : '1.5rem' }}
      >
        {/* COLONNE GAUCHE */}
        <div className="sidebar">
          <div className="panel panel-purple">
            <h2 style={{ margin: 0 }}>Nom app</h2>
          </div>

          <Dashboard
            entries={data?.stats?.entries || 0}
            exits={data?.stats?.exits || 0}
            isConnected={isConnected}
            isAiRunning={isAiRunning}
            onReset={() => sendMessage('RESET_STATS')}
          />

          <HardwarePanel hardware={data?.hardware || null} />
        </div>

        {/* COLONNE DROITE */}
        <div className="main-content">
          {/* HAUT : Vidéo */}
          <div className="video-section">
            <VideoCanvas data={data} lineConfig={lineConfig} />
            {/* Overlay FPS temporaire */}
            <div
              style={{
                position: 'absolute',
                bottom: '10px',
                right: '10px',
                color: 'white',
                fontWeight: 'bold',
              }}
            >
              FPS: --
            </div>
          </div>

          {/* BAS : Contrôles & Logs */}
          <div className="bottom-section">
            <ConfigPanel
              isAiRunning={isAiRunning}
              toggleEngine={toggleEngine}
              cameras={data?.cameras || []}
              onSelectSource={handleSelectSource}
              lineConfig={lineConfig}
              setLineConfig={setLineConfig}
            />
            <LogViewer />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;

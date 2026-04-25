// src/components/ConfigPanel.tsx

import { memo, type ChangeEvent } from 'react';
import { SourceSelector } from './SourceSelector';
import type { Camera, LineConfig } from '../types';

/**
 * Propriétés du composant ConfigPanel.
 * @interface Props
 * @property {boolean} isAiRunning - Indique si l'intelligence artificielle est en cours d'exécution.
 * @property {() => void} toggleEngine - Fonction pour basculer l'état (démarrer/arrêter) de l'IA.
 * @property {Camera[]} cameras - Liste des caméras disponibles pour la sélection.
 * @property {(source: number | string | null) => void} onSelectSource - Fonction de rappel lors de la sélection d'une source.
 * @property {LineConfig} lineConfig - Configuration actuelle de la ligne de détection (géométrie, tolérance, etc.).
 * @property {React.Dispatch<React.SetStateAction<LineConfig>>} setLineConfig - Fonction pour mettre à jour la configuration de la ligne.
 */
interface Props {
  isAiRunning: boolean;
  toggleEngine: () => void;
  cameras: Camera[];
  onSelectSource: (source: number | string | null) => void;
  lineConfig: LineConfig;
  setLineConfig: React.Dispatch<React.SetStateAction<LineConfig>>;
}

// 1. AJOUT : Définition du style pour imiter les touches de clavier physiques
const kbdStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #d9d9d9',
  borderRadius: '3px',
  padding: '2px 5px',
  fontSize: '0.75rem',
  fontFamily: 'monospace',
  boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
  color: '#32363a',
  margin: '0 2px',
};

/**
 * Composant de configuration principal.
 * Permet de sélectionner la source vidéo, d'ajuster la géométrie de la ligne de comptage
 * et de paramétrer le moteur d'inférence (tolérance, confiance).
 */
export const ConfigPanel = memo(
  ({ isAiRunning, toggleEngine, cameras, onSelectSource, lineConfig, setLineConfig }: Props) => {
    const handleSliderChange = (e: ChangeEvent<HTMLInputElement>, key: keyof LineConfig) => {
      setLineConfig((prev) => ({
        ...prev,
        [key]: Number(e.target.value),
      }));
    };

    return (
      <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="panel-title">Paramètres d'Analyse</div>

        <SourceSelector cameras={cameras} onSelectSource={onSelectSource} disabled={isAiRunning} />

        <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: '1.5rem' }}>
          <div
            style={{
              color: '#32363a',
              fontSize: '1rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem',
            }}
          >
            Géométrie de la ligne
          </div>

          {/* 2. AJOUT : Le bloc d'astuce (Tooltip / Hint) pour l'utilisateur */}
          <div
            style={{
              fontSize: '0.8rem',
              color: '#6a6d70',
              marginBottom: '1.5rem',
              backgroundColor: '#f3f4f5',
              padding: '8px 10px',
              borderRadius: '4px',
              borderLeft: '3px solid #0a6ed1',
            }}
          >
            💡 <b>Astuce :</b> Utilisez les touches <kbd style={kbdStyle}>↑</kbd>{' '}
            <kbd style={kbdStyle}>↓</kbd> (Hauteur) et <kbd style={kbdStyle}>←</kbd>{' '}
            <kbd style={kbdStyle}>→</kbd> (Angle) pour un ajustement précis.
          </div>

          {['cy', 'offsetX', 'angle'].map((key) => (
            <div key={key} style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.875rem',
                  color: '#6a6d70',
                  marginBottom: '8px',
                }}
              >
                <span>
                  {key === 'cy'
                    ? 'Hauteur (Y)'
                    : key === 'offsetX'
                      ? 'Position (X)'
                      : 'Inclinaison'}
                </span>
                <span style={{ color: '#0a6ed1', fontWeight: 'bold' }}>
                  {lineConfig[key as keyof LineConfig]}
                  {key === 'angle' ? '°' : ' px'}
                </span>
              </label>
              <input
                type="range"
                min={key === 'angle' ? -90 : key === 'offsetX' ? -500 : 50}
                max={key === 'angle' ? 90 : key === 'offsetX' ? 500 : 700}
                value={lineConfig[key as keyof LineConfig]}
                onChange={(e) => handleSliderChange(e, key as keyof LineConfig)}
                disabled={isAiRunning}
              />
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: '1.5rem' }}>
          <div
            style={{ color: '#32363a', fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem' }}
          >
            Moteur d'Inférence IA
          </div>

          {['tolerance', 'confidence'].map((key) => (
            <div key={key} style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.875rem',
                  color: '#6a6d70',
                  marginBottom: '8px',
                }}
              >
                <span>{key === 'tolerance' ? 'Tolérance' : 'Confiance'}</span>
                <span style={{ color: '#0a6ed1', fontWeight: 'bold' }}>
                  {lineConfig[key as keyof LineConfig]}
                  {key === 'confidence' ? ' %' : ' px'}
                </span>
              </label>
              <input
                type="range"
                min={key === 'confidence' ? 10 : 0}
                max={key === 'confidence' ? 95 : 150}
                value={lineConfig[key as keyof LineConfig]}
                onChange={(e) => handleSliderChange(e, key as keyof LineConfig)}
                disabled={isAiRunning}
              />
            </div>
          ))}
        </div>

        <button
          className={`btn-control ${isAiRunning ? 'btn-danger' : 'btn-primary'}`}
          onClick={toggleEngine}
          style={{ width: '100%', padding: '0.75rem', marginTop: 'auto', fontSize: '1rem' }}
        >
          {isAiRunning ? 'Arrêter le calcul' : "Démarrer l'analyse"}
        </button>
      </div>
    );
  },
);

import { memo } from 'react';

/**
 * Propriétés du composant Dashboard.
 * @interface Props
 * @property {number} entries - Nombre total d'entrées détectées.
 * @property {number} exits - Nombre total de sorties détectées.
 * @property {boolean} isConnected - État de la connexion au backend ou à la source.
 * @property {boolean} isAiRunning - État d'exécution du moteur d'IA (tracking).
 * @property {() => void} onReset - Fonction de rappel pour réinitialiser les compteurs.
 */
interface Props {
  entries: number;
  exits: number;
  isConnected: boolean;
  isAiRunning: boolean;
  onReset: () => void;
}

/**
 * Composant d'affichage du tableau de bord.
 * Montre les compteurs d'entrées/sorties et l'état global du système.
 * Utilise `memo` pour éviter un re-rendu si les valeurs ne changent pas.
 */
export const Dashboard = memo(
  ({ entries, exits, isConnected, isAiRunning, onReset }: Props) => {
    return (
      <div className="panel">
        <div
          className="panel-title"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <span>Statut Système</span>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 'normal',
              color: isConnected ? '#107e3e' : '#e9730c',
              backgroundColor: isConnected ? '#f5fafe' : '#fef7f1',
              padding: '2px 8px',
              borderRadius: '12px',
              border: `1px solid ${isConnected ? '#107e3e' : '#e9730c'}`,
            }}
          >
            {isConnected ? 'Connecté' : 'Hors ligne'}
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2rem',
          }}
        >
          <span style={{ fontSize: '0.875rem', color: '#6a6d70' }}>Moteur IA</span>
          <span
            style={{
              padding: '2px 8px',
              backgroundColor: isAiRunning ? '#f5fafe' : '#fef7f1',
              border: `1px solid ${isAiRunning ? '#107e3e' : '#e9730c'}`,
              color: isAiRunning ? '#107e3e' : '#e9730c',
              borderRadius: '12px',
              fontSize: '0.75rem',
            }}
          >
            {isAiRunning ? 'Actif' : 'En veille'}
          </span>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.875rem', color: '#6a6d70', marginBottom: '4px' }}>
            Entrées totales
          </div>
          <div className="led-display led-green">{entries}</div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.875rem', color: '#6a6d70', marginBottom: '4px' }}>
            Sorties totales
          </div>
          <div className="led-display led-red">{exits}</div>
        </div>

        <button className="btn-control" onClick={onReset} style={{ width: '100%' }}>
          Réinitialiser les compteurs
        </button>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.entries === nextProps.entries &&
      prevProps.exits === nextProps.exits &&
      prevProps.isAiRunning === nextProps.isAiRunning &&
      prevProps.isConnected === nextProps.isConnected
    );
  },
);

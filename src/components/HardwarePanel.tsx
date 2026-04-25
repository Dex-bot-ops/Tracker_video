import { memo } from 'react';
import { HardwareGauge } from './HardwareGauge';

/**
 * Propriétés du composant HardwarePanel.
 * @interface Props
 * @property {Object|null} hardware - Contient les statistiques du matériel (RAM, GPU).
 * @property {Object} hardware.ram - Statistiques de la mémoire (RAM).
 * @property {number} hardware.ram.percentage - Pourcentage d'utilisation de la RAM.
 * @property {Object} hardware.gpu - Statistiques du processeur graphique (GPU).
 * @property {number} hardware.gpu.percentage - Pourcentage d'utilisation du GPU.
 */
interface Props {
  hardware: {
    ram: { percentage: number };
    gpu: { percentage: number };
  } | null;
}

/**
 * Composant responsable de l'affichage des informations matérielles.
 * Rend deux jauges (RAM et GPU) pour indiquer le niveau d'utilisation.
 * Mémorisé pour éviter des rendus inutiles lorsque les données ne changent pas.
 */
export const HardwarePanel = memo(
  ({ hardware }: Props) => {
    return (
      <div
        className="panel"
        style={{
          display: 'flex',
          gap: '20px',
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: '1.25rem',
        }}
      >
        <div style={{ width: '140px' }}>
          <HardwareGauge
            value={hardware?.ram?.percentage || 0}
            title="Utilisation RAM"
            color="#0a6ed1"
          />
        </div>
        <div style={{ width: '140px' }}>
          <HardwareGauge
            value={hardware?.gpu?.percentage || 0}
            title="Calcul GPU"
            color="#0a6ed1"
          />
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.hardware?.ram?.percentage === nextProps.hardware?.ram?.percentage &&
      prevProps.hardware?.gpu?.percentage === nextProps.hardware?.gpu?.percentage
    );
  },
);

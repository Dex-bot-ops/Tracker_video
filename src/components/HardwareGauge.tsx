import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';

/**
 * Propriétés du composant HardwareGauge.
 * @interface Props
 * @property {number} value - La valeur en pourcentage (0 à 100) à afficher sur la jauge.
 * @property {string} title - Le titre ou l'étiquette de la jauge (ex: "Utilisation RAM").
 * @property {string} [color] - Couleur principale de la jauge (optionnel).
 * @property {string} [darkColor] - Couleur de fond de la piste (optionnel).
 */
interface Props {
  value: number;
  title: string;
  color?: string;
  darkColor?: string;
}

/**
 * Composant affichant une jauge circulaire (radial bar chart) pour représenter un pourcentage.
 * Utilise la bibliothèque ApexCharts pour le rendu visuel.
 */
export const HardwareGauge = ({
  value,
  title,
  color = '#0a6ed1', // Bleu par défaut
  darkColor = '#e5e5e5', // Gris très clair pour la piste vide
}: Props) => {
  const options: ApexOptions = {
    chart: {
      type: 'radialBar',
      offsetY: -10,
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        track: {
          background: darkColor,
          strokeWidth: '97%',
          margin: 0,
        },
        dataLabels: {
          name: {
            show: true,
            fontSize: '13px',
            color: '#6a6d70', // Texte gris SAP
            offsetY: 20,
          },
          value: {
            offsetY: -30,
            fontSize: '22px',
            fontWeight: 'bold',
            color: '#32363a', // Chiffres gris très foncé
            formatter: (val) => `${val}%`,
          },
        },
      },
    },
    fill: {
      type: 'solid',
      colors: [color],
    },
    colors: [color],
    labels: [title],
    grid: {
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
    },
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100px' }}>
      <Chart options={options} series={[value]} type="radialBar" height="100%" />
    </div>
  );
};

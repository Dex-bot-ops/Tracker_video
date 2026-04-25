// src/utils/math.ts

import type { LineConfig } from '../types';

const toRadians = (degrees: number) => degrees * (Math.PI / 180);

export const calculateLinePoints = (config: LineConfig, canvasWidth: number) => {
  const radians = toRadians(config.angle);
  const length = canvasWidth * 1.5;

  // NOUVEAU : On décale le centre X selon la configuration choisie
  const cx = canvasWidth / 2 + (config.offsetX || 0);

  // Vecteur directeur
  const dx = Math.cos(radians) * (length / 2);
  const dy = Math.sin(radians) * (length / 2);

  const x1 = cx - dx;
  const y1 = config.cy - dy;
  const x2 = cx + dx;
  const y2 = config.cy + dy;

  // Vecteur normal (pour la flèche de direction)
  const arrowLength = 50;
  const nx = -Math.sin(radians) * arrowLength;
  const ny = Math.cos(radians) * arrowLength;

  return {
    line: { x1, y1, x2, y2 },
    arrow: { startX: cx, startY: config.cy, endX: cx + nx, endY: config.cy + ny },
  };
};

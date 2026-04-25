// src/components/VideoCanvas.tsx

import { useEffect, useRef } from 'react';
import { calculateLinePoints } from '../utils/math';
import type { TrackerData, Detection, LineConfig } from '../types';

interface Props {
  data: TrackerData | null;
  lineConfig: LineConfig;
}

export const VideoCanvas = ({ data, lineConfig }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 1. AJOUT : On crée l'objet Image une seule fois.
  // Ce useRef agit comme une boîte qui gardera l'image en mémoire pour toute la durée de vie du composant.
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!imgRef.current) {
      imgRef.current = new Image();
    }

    if (!data || !data.image || !canvasRef.current) {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isCancelled = false;

    // 2. MODIFICATION : Au lieu de faire "const img = new Image();",
    // on récupère notre image "recyclable" stockée dans la référence.
    const img = imgRef.current;

    img.onload = () => {
      if (isCancelled) return;

      canvas.width = img.width;
      canvas.height = img.height;

      // Dessin du fond vidéo
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const { line, arrow } = calculateLinePoints(lineConfig, canvas.width);

      if (lineConfig.tolerance > 0) {
        ctx.strokeStyle = 'rgba(0, 255, 65, 0.15)';
        ctx.lineWidth = lineConfig.tolerance;
        ctx.beginPath();
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(line.x2, line.y2);
        ctx.stroke();
      }

      // Dessin de la ligne de comptage
      ctx.strokeStyle = '#00ff41';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(line.x1, line.y1);
      ctx.lineTo(line.x2, line.y2);
      ctx.stroke();

      // Dessin du vecteur normal (Flèche de direction)
      ctx.strokeStyle = '#ff003c';
      ctx.fillStyle = '#ff003c';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(arrow.startX, arrow.startY);
      ctx.lineTo(arrow.endX, arrow.endY);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(arrow.endX, arrow.endY, 6, 0, Math.PI * 2);
      ctx.fill();

      // Dessin des Bounding Boxes
      if (data.detections && data.detections.length > 0) {
        data.detections.forEach((det: Detection) => {
          const [x1, y1, x2, y2] = det.bbox;
          const width = x2 - x1;
          const height = y2 - y1;

          ctx.strokeStyle = '#ff003c';
          ctx.lineWidth = 2;
          ctx.strokeRect(x1, y1, width, height);

          ctx.fillStyle = '#ff003c';
          ctx.fillRect(x1, y1 - 25, 70, 25);

          ctx.fillStyle = 'white';
          ctx.font = '16px monospace';
          ctx.fillText(`ID: ${det.id}`, x1 + 5, y1 - 8);
        });
      }
    };

    // 3. Injection de l'image Base64 (Ceci va déclencher le img.onload)
    img.src = `data:image/jpeg;base64,${data.image}`;

    return () => {
      isCancelled = true;
    };
  }, [data, lineConfig]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        maxHeight: '100%',
        objectFit: 'contain',
        backgroundColor: '#0b0b0b',
        borderRadius: '4px',
      }}
    />
  );
};

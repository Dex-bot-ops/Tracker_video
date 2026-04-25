import { describe, it, expect } from 'vitest';
import { calculateLinePoints } from './math';
import type { LineConfig } from '../types';

// Type incomplet utile pour mocker : normalement { angle: number, cy: number, offsetX?: number }
describe('math utils - calculateLinePoints', () => {
  it('devrait calculer correctement une ligne horizontale centrale (angle 0)', () => {
    // Une ligne à 0 degré est horizontale (du centre vers la droite).
    const config: LineConfig = { angle: 0, cy: 100, offsetX: 0, tolerance: 10, confidence: 0.5 };
    const canvasWidth = 800;

    const result = calculateLinePoints(config, canvasWidth);

    // cx devrait être = 400 (canvasWidth/2)
    // l = 1200 (1.5 * 800) -> demi-l = 600
    // dx = 600, dy = 0 car sin(0) = 0
    // x1 = cx - dx = 400 - 600 = -200
    // x2 = cx + dx = 400 + 600 = 1000

    expect(result.line.x1).toBe(-200);
    expect(result.line.x2).toBe(1000);

    // y1 et y2 devraient être égaux à cy car dy=0
    expect(result.line.y1).toBe(100);
    expect(result.line.y2).toBe(100);
  });

  it('devrait gérer la rotation verticale (angle 90)', () => {
    const config: LineConfig = { angle: 90, cy: 100, offsetX: 0, tolerance: 10, confidence: 0.5 };
    const canvasWidth = 800;

    const result = calculateLinePoints(config, canvasWidth);

    // radians = PI/2, cos(PI/2) ~ 0, sin(PI/2) = 1
    // cx = 400, l/2 = 600
    // dx ~ 0, dy = 600

    expect(result.line.x1).toBeCloseTo(400); // Proche de cx à la marge de l'arrondi flottant
    expect(result.line.x2).toBeCloseTo(400);

    expect(result.line.y1).toBeCloseTo(-500); // cy - dy -> 100 - 600
    expect(result.line.y2).toBeCloseTo(700); // cy + dy -> 100 + 600
  });

  it('devrait appliquer le décalage (offsetX)', () => {
    const config: LineConfig = { angle: 0, cy: 100, offsetX: 50, tolerance: 10, confidence: 0.5 }; // on décale le cx de 50 à droite
    const canvasWidth = 800;

    const result = calculateLinePoints(config, canvasWidth);

    // cx = 400 + 50 = 450
    // dx = 600 (car angle 0)
    // x1 = cx - dx = 450 - 600 = -150
    expect(result.line.x1).toBe(-150);
  });

  it('devrait calculer un vecteur normal pour la flèche avec une taille de 50', () => {
    // angle 0 : vecteur directeur vers la droite (+x)
    // normal dans le code original: nx = -Math.sin(0) * 50 = 0, ny = Math.cos(0) * 50 = 50
    const config: LineConfig = { angle: 0, cy: 100, offsetX: 0, tolerance: 10, confidence: 0.5 };
    const canvasWidth = 800;
    const result = calculateLinePoints(config, canvasWidth);

    expect(result.arrow.startX).toBe(400); // cx
    expect(result.arrow.startY).toBe(100); // cy
    expect(result.arrow.endX).toBeCloseTo(400); // x start + nx = 400 + 0
    expect(result.arrow.endY).toBeCloseTo(150); // y start + ny = 100 + 50
  });
});

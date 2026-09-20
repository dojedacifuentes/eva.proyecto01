/**
 * Las figuras que el campo de la Consciencia puede reunir.
 *
 * Cada figura es una lista de objetivos —uno por partícula— dentro del lienzo
 * normalizado. Todas devuelven exactamente `count` puntos, deterministas por
 * semilla, y ninguno sale de [0.04, 0.96] × [0.06, 0.94]: así el motor puede
 * cambiar de figura sin tocar los índices `particle.target`.
 *
 * Sin dependencias ni alias más allá del generador con semilla: se prueba con
 * `node --test`.
 */

import { seeded } from '@/lib/random';
import type { FigureId } from '@/lib/types';

export interface FigurePoint {
  x: number;
  y: number;
}

/** Caja donde caben todas las figuras. */
export const FIGURE_BOUNDS = { minX: 0.04, maxX: 0.96, minY: 0.06, maxY: 0.94 } as const;

/** Cada figura mezcla su propia sal en la semilla: la misma semilla, cinco jitters distintos. */
const FIGURE_SALT: Record<FigureId, number> = {
  eye: 0x51f15e,
  spiral: 0x5b1ea1,
  labyrinth: 0x1ab7a1,
  double: 0xd0b1e0,
  name: 0x3e7a00,
};

type Segment = readonly [x1: number, y1: number, x2: number, y2: number];

function clampPoint(point: FigurePoint): FigurePoint {
  return {
    x: Math.min(FIGURE_BOUNDS.maxX, Math.max(FIGURE_BOUNDS.minX, point.x)),
    y: Math.min(FIGURE_BOUNDS.maxY, Math.max(FIGURE_BOUNDS.minY, point.y)),
  };
}

/**
 * Reparte `count` puntos por una lista de segmentos, proporcionalmente al largo
 * de cada uno: la partícula i cae en el punto (i + ½) / count del recorrido.
 */
function alongSegments(segments: readonly Segment[], count: number, random: () => number, jitter: number) {
  const lengths = segments.map(([x1, y1, x2, y2]) => Math.hypot(x2 - x1, y2 - y1));
  const total = lengths.reduce((sum, length) => sum + length, 0);
  const points: FigurePoint[] = [];

  for (let index = 0; index < count; index += 1) {
    let distance = ((index + 0.5) / count) * total;
    let at = 0;
    while (at < segments.length - 1 && distance > lengths[at]) {
      distance -= lengths[at];
      at += 1;
    }
    const [x1, y1, x2, y2] = segments[at];
    const t = lengths[at] > 0 ? Math.min(1, distance / lengths[at]) : 0;
    points.push({
      x: x1 + (x2 - x1) * t + (random() - 0.5) * jitter,
      y: y1 + (y2 - y1) * t + (random() - 0.5) * jitter,
    });
  }
  return points;
}

/** Párpados, iris y pupila de un ojo abstracto, centrado en (cx, cy) y a escala `scale`. */
function eyePoints(count: number, random: () => number, cx = 0.5, cy = 0.5, scale = 1, mirror = false) {
  const lidPairs = Math.max(1, Math.ceil(count * 0.28));
  return Array.from({ length: count }, (_, index): FigurePoint => {
    const slot = index / count;
    const jitterX = (random() - 0.5) * 0.012 * scale;
    const jitterY = (random() - 0.5) * 0.012 * scale;
    let x: number;
    let y: number;
    let shaky = true;

    if (slot < 0.56) {
      const onTop = index % 2 === 0;
      const u = ((index >> 1) % lidPairs) / Math.max(1, lidPairs - 1);
      const arch = Math.sin(Math.PI * u);
      x = -0.33 + u * 0.66;
      y = (onTop ? -1 : 1) * (0.025 + arch * 0.16);
    } else if (slot < 0.86) {
      const angle = ((slot - 0.56) / 0.3) * Math.PI * 2;
      const radius = 0.105 + (random() - 0.5) * 0.018;
      x = Math.cos(angle) * radius;
      y = Math.sin(angle) * radius * 1.12;
    } else {
      const angle = random() * Math.PI * 2;
      const radius = Math.sqrt(random()) * 0.055;
      x = Math.cos(angle) * radius;
      y = Math.sin(angle) * radius;
      shaky = false;
    }

    const sx = mirror ? -1 : 1;
    return {
      x: cx + (x * sx + (shaky ? jitterX : 0)) * scale,
      y: cy + (y + (shaky ? jitterY : 0)) * scale,
    };
  });
}

/** Espiral de Arquímedes de ~2,75 vueltas: el ángulo crece con √t para que los puntos se repartan por el largo. */
function spiralPoints(count: number, random: () => number) {
  const turns = 2.75;
  const maxAngle = turns * Math.PI * 2;
  return Array.from({ length: count }, (_, index): FigurePoint => {
    const t = (index + 0.5) / count;
    const angle = Math.sqrt(t) * maxAngle;
    const radius = (angle / maxAngle) * 0.4;
    return {
      x: 0.5 + Math.cos(angle) * radius + (random() - 0.5) * 0.01,
      y: 0.5 + Math.sin(angle) * radius * 0.94 + (random() - 0.5) * 0.01,
    };
  });
}

/**
 * Cuatro cuadrados concéntricos con un hueco cada uno, en lados alternos, y un
 * puñado de puntos en el centro: un laberinto sin salida.
 */
function labyrinthPoints(count: number, random: () => number) {
  const segments: Segment[] = [];
  const halves = [0.4, 0.3, 0.2, 0.1];
  const gap = 0.07;
  halves.forEach((half, ring) => {
    const left = 0.5 - half;
    const right = 0.5 + half;
    const top = 0.5 - half * 0.94;
    const bottom = 0.5 + half * 0.94;
    const openTop = ring % 2 === 0;
    // El lado con hueco se parte en dos tramos; el hueco va descentrado, alternando el lado.
    const gapAt = ring % 4 < 2 ? 0.5 - half * 0.45 : 0.5 + half * 0.45;
    if (openTop) {
      segments.push([left, top, gapAt - gap / 2, top], [gapAt + gap / 2, top, right, top]);
      segments.push([left, bottom, right, bottom]);
    } else {
      segments.push([left, top, right, top]);
      segments.push([left, bottom, gapAt - gap / 2, bottom], [gapAt + gap / 2, bottom, right, bottom]);
    }
    segments.push([left, top, left, bottom], [right, top, right, bottom]);
  });

  const centre = Math.max(4, Math.round(count * 0.06));
  const walls = alongSegments(segments, count - centre, random, 0.006);
  const heart = Array.from({ length: centre }, (): FigurePoint => {
    const angle = random() * Math.PI * 2;
    const radius = Math.sqrt(random()) * 0.035;
    return { x: 0.5 + Math.cos(angle) * radius, y: 0.5 + Math.sin(angle) * radius };
  });
  return walls.concat(heart);
}

/** Dos ojos más pequeños, lado a lado; el segundo en espejo: la réplica. */
function doublePoints(count: number, random: () => number) {
  const first = Math.ceil(count / 2);
  return eyePoints(first, random, 0.27, 0.5, 0.52).concat(
    eyePoints(count - first, random, 0.73, 0.5, 0.52, true),
  );
}

/** E, V y A como trazos rectos —cuatro, dos y tres segmentos— en x ∈ [0.14, 0.86], y ∈ [0.30, 0.70]. */
function namePoints(count: number, random: () => number) {
  const top = 0.3;
  const bottom = 0.7;
  const segments: Segment[] = [
    // E
    [0.14, top, 0.14, bottom],
    [0.14, top, 0.32, top],
    [0.14, 0.5, 0.29, 0.5],
    [0.14, bottom, 0.32, bottom],
    // V
    [0.41, top, 0.5, bottom],
    [0.5, bottom, 0.59, top],
    // A
    [0.68, bottom, 0.77, top],
    [0.77, top, 0.86, bottom],
    [0.7175, 0.56, 0.8225, 0.56],
  ];
  return alongSegments(segments, count, random, 0.005);
}

/** Exactamente `count` objetivos de la figura, deterministas por semilla y dentro de `FIGURE_BOUNDS`. */
export function createFigureTargets(figure: FigureId, count: number, seed: number): FigurePoint[] {
  const random = seeded((seed ^ FIGURE_SALT[figure]) >>> 0);
  const safeCount = Math.max(0, Math.floor(count));
  let points: FigurePoint[];
  switch (figure) {
    case 'spiral':
      points = spiralPoints(safeCount, random);
      break;
    case 'labyrinth':
      points = labyrinthPoints(safeCount, random);
      break;
    case 'double':
      points = doublePoints(safeCount, random);
      break;
    case 'name':
      points = namePoints(safeCount, random);
      break;
    case 'eye':
    default:
      points = eyePoints(safeCount, random);
  }
  return points.slice(0, safeCount).map(clampPoint);
}

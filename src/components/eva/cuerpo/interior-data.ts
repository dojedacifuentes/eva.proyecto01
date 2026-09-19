/**
 * EVA // INTERIOR — datos del modelo.
 *
 * La silueta, los vasos y los órganos del modelo interior de EVA. Es un
 * diagrama de ficción: legible en 3D, no anatómicamente exacto, y no sale de
 * ninguna imagen. Aquí no hay three.js ni React, sólo números; la geometría y
 * la simulación viven en `InteriorScene`.
 *
 * La manera de describir el modelo —cada vaso como una lista de puntos de
 * control que luego se vuelve curva y tubo, arterias y venas emparejadas para
 * que se lea un circuito, y los órganos como focos con posición y radio— está
 * adaptada de:
 *
 *   christianpasinrey/human-blood-system («HÆMA») —
 *   https://github.com/christianpasinrey/human-blood-system
 *   Copyright (c) 2026 Christian Pasín Rey. Licencia MIT (docs/ASSET_LICENSES.md).
 *
 * Las coordenadas, las proporciones, los colores y el núcleo torácico son de
 * EVA; los textos y las «cifras» de HÆMA no se reutilizan (los de EVA están en
 * `content/ejes.ts`).
 *
 * Convención de ejes: +x a la derecha de quien mira · +y arriba · +z hacia
 * quien mira. El origen queda a media altura; el modelo mide unas 9,3 unidades.
 */

import type { OrganId } from '@/content/ejes';

export type Point = readonly [number, number, number];

/** Paleta del modelo, en hexadecimal: la de EVA, no el rojo y azul del original. */
export const BODY_COLOR = {
  artery: '#f07ab9',
  vein: '#8f8cff',
  cell: '#ffe6f4',
  ghost: '#7fd4ee',
  /** El alambre de la silueta: un azul apagado, para que no compita con lo que late dentro. */
  ghostWire: '#3f6f8e',
  core: '#3fd8ee',
} as const;

/* ───────────── Silueta ───────────── */

export type GhostShape = 'sphere' | 'cylinder' | 'capsule';

export interface GhostPart {
  id: string;
  shape: GhostShape;
  /** sphere: [radio] · cylinder: [radio arriba, radio abajo, alto] · capsule: [radio, largo]. */
  size: readonly number[];
  position: Point;
  scale?: Point;
  /** Inclinación sobre z, en radianes. */
  tilt?: number;
}

const side = (sign: 1 | -1, id: string): GhostPart[] => [
  { id: `hombro-${id}`, shape: 'sphere', size: [0.4], position: [sign * 1.22, 2.84, 0], scale: [1, 0.78, 0.82] },
  { id: `brazo-${id}`, shape: 'capsule', size: [0.19, 2.5], position: [sign * 1.6, 1.32, 0], tilt: sign * 0.07 },
  { id: `pierna-${id}`, shape: 'capsule', size: [0.29, 3.15], position: [sign * 0.5, -2.72, 0] },
];

/** Las piezas de la silueta: primitivas translúcidas, como un holograma. */
export const GHOST: readonly GhostPart[] = [
  { id: 'cabeza', shape: 'sphere', size: [0.6], position: [0, 4.08, 0], scale: [0.92, 1.12, 1] },
  { id: 'cuello', shape: 'cylinder', size: [0.24, 0.31, 0.62], position: [0, 3.3, 0] },
  { id: 'torso', shape: 'cylinder', size: [1.04, 0.76, 3.2], position: [0, 1.5, 0], scale: [1, 1, 0.6] },
  { id: 'cadera', shape: 'sphere', size: [0.88], position: [0, -0.36, 0], scale: [1, 0.7, 0.64] },
  ...side(1, 'd'),
  ...side(-1, 'i'),
];

/* ───────────── Vasos ───────────── */

export interface Vessel {
  id: string;
  /** `art` lleva el fluido del corazón hacia fuera; `ven` lo trae de vuelta. */
  type: 'art' | 'ven';
  radius: number;
  points: readonly Point[];
}

const mirror = (points: readonly Point[]): Point[] => points.map(([x, y, z]) => [-x, y, z]);
/** La vena que acompaña a una arteria: el mismo camino al revés, un poco por detrás. */
const back = (points: readonly Point[], shift = 0.09): Point[] =>
  [...points].reverse().map(([x, y, z]) => [x * 0.94, y, z - shift]);

const CAROTID: Point[] = [
  [0.2, 2.72, 0.12],
  [0.34, 3.2, 0.12],
  [0.3, 3.7, 0.12],
  [0.16, 4.12, 0.1],
];
const ARM: Point[] = [
  [0.3, 2.62, 0.08],
  [0.95, 2.74, 0.06],
  [1.44, 2.5, 0.02],
  [1.6, 1.6, 0.02],
  [1.68, 0.6, 0.02],
  [1.74, -0.3, 0.02],
];
const LEG: Point[] = [
  [0, -0.55, 0.18],
  [0.36, -0.96, 0.1],
  [0.5, -1.8, 0.04],
  [0.54, -2.9, 0.02],
  [0.5, -3.8, 0.02],
  [0.46, -4.42, 0.02],
];
const RENAL: Point[] = [
  [0.1, 0.32, 0.2],
  [0.38, 0.28, 0.02],
  [0.64, 0.24, -0.12],
];

export const VESSELS: readonly Vessel[] = [
  // El conducto principal: sale del corazón, hace un arco y baja.
  {
    id: 'aorta',
    type: 'art',
    radius: 0.075,
    points: [
      [-0.12, 2.16, 0.3],
      [0.1, 2.74, 0.26],
      [0.34, 2.62, 0.1],
      [0.28, 2.0, 0.14],
      [0.14, 1.0, 0.2],
      [0.06, 0.1, 0.2],
      [0, -0.55, 0.18],
    ],
  },
  { id: 'carotida-d', type: 'art', radius: 0.034, points: CAROTID },
  // Las ramas del lado izquierdo nacen del arco, que cae a la derecha: no son un espejo exacto.
  {
    id: 'carotida-i',
    type: 'art',
    radius: 0.034,
    points: [
      [0.04, 2.74, 0.2],
      [-0.2, 3.2, 0.12],
      [-0.26, 3.7, 0.12],
      [-0.14, 4.12, 0.1],
    ],
  },
  { id: 'brazo-d-a', type: 'art', radius: 0.032, points: ARM },
  {
    id: 'brazo-i-a',
    type: 'art',
    radius: 0.032,
    points: [[0, 2.68, 0.2], [-0.8, 2.76, 0.06], ...mirror(ARM).slice(2)],
  },
  { id: 'pierna-d-a', type: 'art', radius: 0.042, points: LEG },
  { id: 'pierna-i-a', type: 'art', radius: 0.042, points: mirror(LEG) },
  { id: 'renal-d-a', type: 'art', radius: 0.026, points: RENAL },
  { id: 'renal-i-a', type: 'art', radius: 0.026, points: [[0.08, 0.32, 0.2], ...mirror(RENAL).slice(1)] },
  {
    id: 'hepatica',
    type: 'art',
    radius: 0.028,
    points: [
      [0.12, 0.84, 0.2],
      [0.36, 0.8, 0.18],
      [0.58, 0.9, 0.14],
    ],
  },

  // El retorno: el mismo cuerpo, por detrás.
  {
    id: 'cava',
    type: 'ven',
    radius: 0.08,
    points: [
      [-0.1, -0.55, -0.1],
      [-0.16, 0.1, -0.12],
      [-0.2, 1.0, -0.12],
      [-0.26, 1.7, -0.06],
      [-0.3, 2.12, 0.06],
    ],
  },
  { id: 'yugular-d', type: 'ven', radius: 0.032, points: back(CAROTID) },
  { id: 'yugular-i', type: 'ven', radius: 0.032, points: back(mirror(CAROTID)) },
  { id: 'brazo-d-v', type: 'ven', radius: 0.03, points: back(ARM) },
  { id: 'brazo-i-v', type: 'ven', radius: 0.03, points: back(mirror(ARM)) },
  { id: 'pierna-d-v', type: 'ven', radius: 0.04, points: back(LEG) },
  { id: 'pierna-i-v', type: 'ven', radius: 0.04, points: back(mirror(LEG)) },
  { id: 'renal-d-v', type: 'ven', radius: 0.024, points: back(RENAL, 0.06) },
  { id: 'renal-i-v', type: 'ven', radius: 0.024, points: back(mirror(RENAL), 0.06) },

  // El circuito corto: del corazón a los pulmones y vuelta, con los colores cambiados.
  {
    id: 'pulmonar-d-ida',
    type: 'ven',
    radius: 0.04,
    points: [
      [-0.06, 2.46, 0.2],
      [0.26, 2.5, 0.12],
      [0.5, 2.44, 0.04],
      [0.7, 2.36, 0],
    ],
  },
  {
    id: 'pulmonar-i-ida',
    type: 'ven',
    radius: 0.04,
    points: [
      [-0.2, 2.46, 0.2],
      [-0.44, 2.5, 0.12],
      [-0.64, 2.44, 0.04],
      [-0.8, 2.36, 0],
    ],
  },
  {
    id: 'pulmonar-d-vuelta',
    type: 'art',
    radius: 0.04,
    points: [
      [0.7, 2.1, -0.04],
      [0.46, 2.14, -0.02],
      [0.18, 2.16, 0.06],
      [-0.06, 2.18, 0.18],
    ],
  },
  {
    id: 'pulmonar-i-vuelta',
    type: 'art',
    radius: 0.04,
    points: [
      [-0.8, 2.1, -0.04],
      [-0.6, 2.14, -0.02],
      [-0.4, 2.16, 0.06],
      [-0.24, 2.18, 0.18],
    ],
  },
];

/* ───────────── Órganos ───────────── */

export interface OrganLobe {
  position: Point;
  /** Semiejes del elipsoide. */
  radii: Point;
}

export interface OrganModel {
  id: OrganId;
  color: string;
  /** Las piezas que lo forman. La aorta no tiene: es su vaso. */
  lobes: readonly OrganLobe[];
  /** Adónde mira el encuadre al elegirlo, y cuánto se acerca. */
  focus: Point;
  zoom: number;
}

/** En el orden del registro: el mismo de `ejes.cuerpo.interior.organs`. */
export const ORGANS: readonly OrganModel[] = [
  {
    id: 'corazon',
    color: '#f07ab9',
    // El corazón tiene su propia geometría en la escena; este lóbulo es su zona de clic.
    lobes: [{ position: [-0.14, 2.2, 0.24], radii: [0.36, 0.42, 0.32] }],
    focus: [-0.14, 2.2, 0.24],
    zoom: 2.5,
  },
  {
    id: 'pulmones',
    color: '#5998ff',
    lobes: [
      { position: [0.62, 2.62, 0], radii: [0.36, 0.42, 0.36] },
      { position: [0.68, 2.06, 0], radii: [0.4, 0.46, 0.36] },
      { position: [-0.7, 2.6, 0], radii: [0.34, 0.44, 0.34] },
      { position: [-0.78, 2.02, -0.02], radii: [0.32, 0.4, 0.32] },
    ],
    focus: [0, 2.3, 0],
    zoom: 2,
  },
  {
    id: 'cerebro',
    color: '#3fd8ee',
    lobes: [{ position: [0, 4.14, 0.04], radii: [0.42, 0.4, 0.46] }],
    focus: [0, 4.05, 0],
    zoom: 2.4,
  },
  {
    id: 'higado',
    color: '#c86ee8',
    lobes: [
      { position: [0.5, 0.98, 0.16], radii: [0.5, 0.28, 0.32] },
      { position: [0.14, 1.04, 0.2], radii: [0.26, 0.2, 0.24] },
    ],
    focus: [0.36, 1.0, 0.16],
    zoom: 2.5,
  },
  {
    id: 'rinones',
    color: '#78f0b4',
    lobes: [
      { position: [0.64, 0.24, -0.12], radii: [0.17, 0.27, 0.15] },
      { position: [-0.64, 0.24, -0.12], radii: [0.17, 0.27, 0.15] },
    ],
    focus: [0, 0.24, -0.1],
    zoom: 2.4,
  },
  {
    id: 'aorta',
    color: '#f07ab9',
    lobes: [],
    focus: [0.18, 1.5, 0.18],
    zoom: 2,
  },
];

/** Dónde está el corazón: ahí late, ahí destella y de ahí salen los impulsos. */
export const HEART_AT: Point = [-0.14, 2.2, 0.24];
/** Dónde está el relé de la cabeza: de ahí sale el impulso que recorre el cuerpo. */
export const BRAIN_AT: Point = [0, 4.14, 0.04];
/** Alto del modelo y centro vertical, para encuadrarlo. */
export const BODY_HEIGHT = 9.4;
export const BODY_CENTER_Y = 0.06;
export const BODY_WIDTH = 3.9;

/* ───────────── Números ───────────── */

/** Largo de una polilínea. */
export function pathLength(points: readonly Point[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += Math.hypot(
      points[i][0] - points[i - 1][0],
      points[i][1] - points[i - 1][1],
      points[i][2] - points[i - 1][2],
    );
  }
  return total;
}

/**
 * Reparte `total` partículas entre los vasos según su largo, con un mínimo de
 * dos por vaso: así el flujo tiene la misma densidad en un brazo que en la aorta.
 */
export function shareCells(lengths: readonly number[], total: number): number[] {
  const sum = lengths.reduce((acc, value) => acc + value, 0) || 1;
  return lengths.map((value) => Math.max(2, Math.round((total * value) / sum)));
}

/**
 * Proyección frontal de un punto del modelo a una caja 2D, para la vista
 * plana (sin WebGL): `x` e `y` en 0–1, con el origen arriba a la izquierda.
 */
export function project([x, y]: Point): { x: number; y: number } {
  return {
    x: 0.5 + x / BODY_WIDTH,
    y: 0.5 - (y - BODY_CENTER_Y) / BODY_HEIGHT,
  };
}

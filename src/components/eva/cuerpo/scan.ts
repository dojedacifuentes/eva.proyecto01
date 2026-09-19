/**
 * EVA // BIOLECTURA — el motor de la pasada.
 *
 * Filas de partículas cruzan una imagen en una dirección; al encontrar un
 * borde, unas se quedan clavadas en él —y así lo dibujan— y otras siguen,
 * ondulando. La técnica (detección de bordes por diferencia de luminancia en
 * una sola pasada, mirada unos píxeles por delante según el número de la fila,
 * probabilidad de congelarse, enfriamiento tras un choque y ondulación de las
 * que chocaron) está adaptada de:
 *
 *   collidingScopes/scanlines — https://github.com/collidingScopes/scanlines
 *   Copyright (c) 2025 Alan Ang. Licencia MIT (docs/ASSET_LICENSES.md).
 *
 * Lo que cambia respecto del original: es una pasada finita y no un bucle sin
 * fin; avanza por tiempo y no por fotogramas; los bordes ocupan un byte por
 * píxel; los datos van en arrays planos y no en un objeto por partícula; el
 * azar entra por parámetro, con semilla; y no toca el DOM ni el lienzo —quien
 * la monta decide cómo se pinta—, así que se prueba con `node --test`.
 *
 * Sin dependencias ni alias.
 */

export type Sweep = 'down' | 'up' | 'right' | 'left';

/** La partícula se quedó clavada en un borde: es la que dibuja el contorno. */
export const FROZEN = 1;
/** Chocó alguna vez con un borde y siguió: va del color del borde y ondula. */
export const HIT = 2;
/** Salió del lienzo: ya no se mueve ni se pinta. */
export const OUT = 4;

/** Cuántos píxeles por delante mira, como mucho, una fila: las últimas se apilan antes. */
const MAX_LOOKAHEAD = 5;
/** Distancia mínima desde la salida antes de poder congelarse, en píxeles. */
const MIN_TRAVEL = 12;

/**
 * Bordes de una imagen RGBA: un 1 donde la luminancia cambia más que `threshold`
 * respecto del píxel de la derecha o del de abajo. Se calcula una vez por imagen.
 */
export function detectEdges(
  rgba: ArrayLike<number>,
  width: number,
  height: number,
  threshold: number,
): Uint8Array {
  const edges = new Uint8Array(width * height);
  const stride = width * 4;
  const luminance = (at: number) => rgba[at] * 0.299 + rgba[at + 1] * 0.587 + rgba[at + 2] * 0.114;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const at = y * stride + x * 4;
      const here = luminance(at);
      const across = Math.abs(here - luminance(at + 4));
      const below = Math.abs(here - luminance(at + stride));
      if (Math.max(across, below) >= threshold) edges[y * width + x] = 1;
    }
  }
  return edges;
}

export interface ScanOptions {
  /** Tamaño de la rejilla de simulación: el del mapa de bordes. */
  width: number;
  height: number;
  edges: Uint8Array;
  sweep: Sweep;
  /** Partículas por fila. */
  particles: number;
  /** Filas que forman una pasada. */
  waves: number;
  /** Segundos entre una fila y la siguiente. */
  gap: number;
  /** Avance, en píxeles de la rejilla por segundo. */
  speed: number;
  /** Probabilidad de quedarse clavada al tocar un borde. */
  freeze: number;
  /** Cuánto ondulan las que chocaron. */
  turbulence: number;
  /** Salto hacia delante al chocar, en fracción del recorrido (0 lo apaga). */
  leap: number;
  /** Segundos de enfriamiento tras un choque: mientras dura, no vuelve a chocar. */
  cooldown: number;
  random: () => number;
}

export interface Scan {
  readonly count: number;
  /** Posiciones en la rejilla; sólo valen las `spawned` primeras. */
  readonly x: Float32Array;
  readonly y: Float32Array;
  readonly flags: Uint8Array;
  /** Partículas nacidas hasta ahora. */
  readonly spawned: number;
  /** Cuántas se quedaron en un borde. */
  readonly frozen: number;
  /** Avance de la fila que va en cabeza, 0–1. */
  readonly front: number;
  /** Parte de la pasada ya resuelta —partículas clavadas o fuera—, 0–1. */
  readonly progress: number;
  /** La pasada terminó: todas las filas salieron y nada se mueve. */
  readonly done: boolean;
  /** Avanza la pasada `dt` segundos. */
  step(dt: number): void;
}

/** Una pasada de biolectura sobre un mapa de bordes. */
export function createScan(options: ScanOptions): Scan {
  const { width, height, edges, sweep, particles, waves, gap, speed, freeze, turbulence, leap, cooldown, random } =
    options;
  const count = particles * waves;
  const x = new Float32Array(count);
  const y = new Float32Array(count);
  const flags = new Uint8Array(count);
  const cooling = new Float32Array(count);
  const frequency = new Float32Array(waves);
  const amplitude = new Float32Array(waves);

  const vertical = sweep === 'down' || sweep === 'up';
  const forward = sweep === 'down' || sweep === 'right' ? 1 : -1;
  /** Largo del recorrido y ancho del frente, en píxeles. */
  const run = vertical ? height : width;
  const span = vertical ? width : height;

  let spawnedWaves = 0;
  let sinceWave = gap;
  let clock = 0;
  let frozen = 0;
  let moving = 0;
  let lead = 0;

  const spawn = () => {
    const wave = spawnedWaves;
    frequency[wave] = 12 - random() * 10;
    amplitude[wave] = 0.05 + random() * 0.3;
    const start = forward === 1 ? 0 : run - 1;
    for (let i = 0; i < particles; i++) {
      const at = wave * particles + i;
      const across = (span / particles) * (i + 0.5) + random() * 3 - 1.5;
      x[at] = vertical ? across : start;
      y[at] = vertical ? start : across;
      flags[at] = 0;
      cooling[at] = 0;
    }
    spawnedWaves += 1;
    moving += particles;
  };

  const step = (dt: number) => {
    if (dt <= 0) return;
    clock += dt;
    sinceWave += dt;
    if (spawnedWaves < waves && sinceWave >= gap) {
      sinceWave = 0;
      spawn();
    }

    const advance = speed * dt;
    const live = spawnedWaves * particles;
    let furthest = 0;

    for (let at = 0; at < live; at++) {
      if (flags[at] & (FROZEN | OUT)) continue;
      const wave = (at / particles) | 0;
      // Mira unos píxeles por delante: las filas de atrás se detienen antes y se apilan.
      const ahead = Math.min(wave, MAX_LOOKAHEAD) * forward;

      let budget = advance;
      if (flags[at] & HIT) {
        // Las que chocaron ondulan: el frente deja de ser una línea recta. La
        // ondulación es una fracción del avance, así no depende de los fotogramas.
        const across = vertical ? x[at] : y[at];
        budget *= 1 + amplitude[wave] * turbulence * Math.sin((clock * 30 + across) / frequency[wave]) * 0.9;
      }

      /*
       * Avanza píxel a píxel y mira en cada uno: un borde mide un píxel, y a
       * más de uno por fotograma la partícula lo saltaría sin verlo (el
       * original nunca pasa de medio píxel; aquí la pasada es mucho más rápida).
       */
      while (budget > 0) {
        const px = Math.floor(x[at]);
        const py = Math.floor(y[at]);
        const along = vertical ? y[at] : x[at];
        const travelled = forward === 1 ? along : run - 1 - along;

        if (cooling[at] <= 0 && travelled > MIN_TRAVEL) {
          const ex = vertical ? px : px + ahead;
          const ey = vertical ? py + ahead : py;
          if (ex >= 0 && ex < width && ey >= 0 && ey < height && edges[ey * width + ex]) {
            if (random() < freeze) {
              flags[at] |= FROZEN;
              frozen += 1;
              moving -= 1;
              break;
            }
            cooling[at] = cooldown;
            flags[at] |= HIT;
            // Un salto, una sola vez, al chocar: mayor cuanto más lejos va. Es lo que da relieve.
            if (leap > 0) budget += Math.max(0, run * leap * (travelled / run - 0.35));
          }
        }

        const hop = Math.min(1, budget);
        if (vertical) y[at] += hop * forward;
        else x[at] += hop * forward;
        budget -= hop;
      }
      if (flags[at] & FROZEN) continue;
      if (cooling[at] > 0) cooling[at] -= dt;

      const now = vertical ? y[at] : x[at];
      const progress = (forward === 1 ? now : run - 1 - now) / run;
      if (progress >= 1) {
        flags[at] |= OUT;
        moving -= 1;
      } else if (progress > furthest) {
        furthest = progress;
      }
    }

    // La cabeza no retrocede aunque su fila se congele entera.
    lead = spawnedWaves === waves && moving === 0 ? 1 : Math.max(lead, Math.min(1, furthest));
  };

  return {
    count,
    x,
    y,
    flags,
    get spawned() {
      return spawnedWaves * particles;
    },
    get frozen() {
      return frozen;
    },
    get front() {
      return lead;
    },
    get progress() {
      return (spawnedWaves * particles - moving) / count;
    },
    get done() {
      return spawnedWaves === waves && moving === 0;
    },
    step,
  };
}

/**
 * Todos los bordes de una vez, como puntos: lo que se enseña con movimiento
 * reducido o al pedir el trazado sin pasada. Uno de cada `every` píxeles de
 * borde, para que el contorno se lea sin tapar la figura.
 */
export function traceEdges(edges: Uint8Array, width: number, height: number, every: number): Float32Array {
  const points: number[] = [];
  let seen = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!edges[y * width + x]) continue;
      if (seen++ % every === 0) points.push(x, y);
    }
  }
  return Float32Array.from(points);
}

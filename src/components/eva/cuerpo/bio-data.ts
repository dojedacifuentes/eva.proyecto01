/**
 * EVA // BIOLECTURA — lo que depende de cada recurso.
 *
 * Las dos vistas del cuerpo —el vídeo de perfil y la imagen de la cápsula— con
 * su proporción, el umbral de bordes que mejor las lee y dónde caen sus puntos
 * de lectura. Va aquí y no en `content/` porque no es texto: son coordenadas
 * atadas a una imagen concreta. Si se cambia un recurso en `content/assets.ts`,
 * se revisa esto. Los nombres de los puntos sí están en `content/ejes.ts`, en
 * el mismo orden.
 */

import type { BodyView } from '@/content/ejes';

export interface BioView {
  /** Proporción del recurso, ancho / alto: el marco la respeta y nunca recorta la figura. */
  aspect: number;
  /**
   * Diferencia mínima de luminancia (0–255) para que un píxel cuente como
   * borde. Ajustado a ojo para que salga el contorno del cuerpo y sus placas
   * sin que los cables del fondo lo llenen todo.
   */
  threshold: number;
  /** Puntos de lectura, en fracción del marco: [x, y] desde arriba a la izquierda. */
  points: readonly (readonly [number, number])[];
}

export const BIO_VIEWS: Record<BodyView, BioView> = {
  profile: {
    aspect: 720 / 1280,
    threshold: 44,
    points: [
      [0.47, 0.19],
      [0.47, 0.345],
      [0.3, 0.47],
      [0.69, 0.625],
      [0.26, 0.83],
    ],
  },
  front: {
    aspect: 1024 / 1536,
    threshold: 40,
    points: [
      [0.5, 0.165],
      [0.5, 0.3],
      [0.545, 0.468],
      [0.53, 0.72],
      [0.235, 0.83],
    ],
  },
};

/** Ancho de la rejilla de simulación, en píxeles: los bordes se detectan a esta resolución. */
export const SIM_WIDTH = 320;

/** La pasada: los valores del original de scanlines, llevados a una lectura de unos siete segundos. */
export const PASS = {
  particles: 150,
  waves: 14,
  gap: 0.16,
  speed: 112,
  freeze: 0.42,
  turbulence: 1,
  leap: 0.05,
  cooldown: 1.6,
} as const;

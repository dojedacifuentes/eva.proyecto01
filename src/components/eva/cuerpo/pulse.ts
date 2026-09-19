/**
 * EVA // INTERIOR — el pulso.
 *
 * La fase cardíaca y las dos curvas que salen de ella: cuánto se contrae el
 * corazón del modelo y qué altura tiene el trazo del electrocardiograma. La
 * escena 3D y el trazo 2D leen la misma fase, así van al compás sin pasarse
 * estado entre ellos.
 *
 * La contracción (golpe brusco y vuelta suave) y el trazo PQRST como suma de
 * gaussianas están adaptados de:
 *
 *   christianpasinrey/human-blood-system («HÆMA») —
 *   https://github.com/christianpasinrey/human-blood-system
 *   Copyright (c) 2026 Christian Pasín Rey. Licencia MIT (docs/ASSET_LICENSES.md).
 *
 * Sin dependencias ni alias: se prueba con `node --test`.
 */

/** Pulsaciones por minuto del modelo: ritmos de ficción, no medidas. */
export const BPM = { rest: 58, fast: 112 } as const;

/** Campana de Gauss centrada en `center`, de ancho `width` y altura `height`. */
function bell(phase: number, center: number, width: number, height: number) {
  return height * Math.exp(-((phase - center) ** 2) / (2 * width * width));
}

/**
 * Escala del corazón para una fase 0–1: se encoge de golpe al empezar el
 * latido, rebota un poco y descansa el resto del ciclo. `force` exagera el golpe.
 */
export function squeeze(phase: number, force = 1): number {
  if (phase < 0.13) return 1 - Math.sin((phase / 0.13) * Math.PI) * 0.16 * force;
  if (phase < 0.3) return 1 - Math.sin(((0.3 - phase) / 0.17) * Math.PI) * 0.05 * force;
  return 1;
}

/** Destello del latido: 1 al empezar y a cero enseguida. */
export function flash(phase: number): number {
  return Math.max(0, 1 - phase * 5.5);
}

/** Altura del trazo para una fase 0–1: onda P, complejo QRS y onda T. */
export function ecg(phase: number): number {
  return (
    bell(phase, 0.16, 0.018, 0.13) -
    bell(phase, 0.235, 0.008, 0.1) +
    bell(phase, 0.255, 0.007, 1) -
    bell(phase, 0.275, 0.01, 0.28) +
    bell(phase, 0.42, 0.035, 0.32)
  );
}

/**
 * El reloj del corazón. No usa un reloj propio: quien lo mueve le dice cuánto
 * tiempo pasó y a qué ritmo, y así el ritmo puede cambiar sin saltos de fase.
 */
export interface Heartbeat {
  /** Fase del latido en curso, 0–1. */
  readonly phase: number;
  /** Latidos completos desde que arrancó. */
  readonly beats: number;
  /** Avanza `dt` segundos a `bpm` pulsaciones; devuelve `true` si empezó un latido. */
  advance(dt: number, bpm: number): boolean;
  /** Empieza un latido ahora mismo. */
  kick(): void;
}

export function createHeartbeat(): Heartbeat {
  let phase = 0;
  let beats = 0;
  return {
    get phase() {
      return phase;
    },
    get beats() {
      return beats;
    },
    advance(dt, bpm) {
      if (dt <= 0) return false;
      const next = phase + (dt * bpm) / 60;
      const fired = next >= 1;
      if (fired) beats += Math.floor(next);
      phase = next % 1;
      return fired;
    },
    kick() {
      phase = 0;
      beats += 1;
    },
  };
}

import { useSyncExternalStore } from 'react';

/**
 * Calidad adaptativa: tres niveles —alto, medio, bajo— que leen todas las
 * capas que cuestan (las tres escenas WebGL, el fondo, el campo de
 * partículas). Arranca en el nivel que el dispositivo declara (núcleos,
 * memoria, ancho, puntero) y baja un escalón cuando el rendimiento medido es
 * malo de verdad: el fondo, que corre en toda la página, informa del tiempo
 * entre fotogramas; si durante dos segundos seguidos la media pasa de 40 ms
 * (menos de 25 fotogramas por segundo), se degrada. Nunca sube sola: una
 * subida tarde se nota como un tirón, una bajada se nota como alivio.
 *
 * Qué cambia con el nivel: la densidad de píxeles del lienzo, el bloom y el
 * multimuestreo de las escenas, el número de partículas del fondo y del
 * campo. Lo que se ve es lo mismo; lo que cuesta, no.
 *
 * Tienda mínima para `useSyncExternalStore`, como `lib/context`: un solo
 * dueño de la verdad, sin React en el bucle de fotogramas.
 */
export type QualityLevel = 'high' | 'mid' | 'low';

/**
 * Tope de densidad de píxeles de un lienzo 2D según el nivel. Un lienzo que se
 * repinta cada fotograma cuesta lo que mide en píxeles: a la mitad de densidad,
 * la cuarta parte del trabajo. Cada lienzo pone su propio máximo por encima.
 */
export const DPR_CAP: Record<QualityLevel, number> = { high: 2, mid: 1.4, low: 1 };

const ORDER: readonly QualityLevel[] = ['high', 'mid', 'low'];
/** Fotograma medio a partir del cual el nivel baja (segundos). */
const SLOW_FRAME = 0.04;
/** Cuánto tiene que durar la lentitud para contar (segundos): un tirón suelto no degrada. */
const SLOW_SPAN = 2;
/** Los primeros segundos no cuentan: las escenas compilan y todo va lento. */
const WARMUP = 4;
/** Entre dos bajadas, un respiro: la anterior tiene que notarse antes de juzgar otra vez. */
const COOLDOWN = 6;

let level: QualityLevel | null = null;
const listeners = new Set<() => void>();

/** Lo que el navegador declara del dispositivo. Sólo en cliente. */
function detectLevel(): QualityLevel {
  const width = window.innerWidth;
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  if (width < 640 || cores <= 2 || memory <= 2) return 'low';
  if (width < 1024 || coarse) return 'mid';
  return 'high';
}

export function getQuality(): QualityLevel {
  level ??= typeof window === 'undefined' ? 'high' : detectLevel();
  return level;
}

/** En el servidor —y hasta hidratar— se asume lo mejor: así el HTML no cambia por dispositivo. */
export function getQualityOnServer(): QualityLevel {
  return 'high';
}

export function subscribeQuality(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function setQuality(next: QualityLevel) {
  if (level === next) return;
  level = next;
  for (const listener of listeners) listener();
}

/** Baja un escalón. Devuelve si había escalón que bajar. */
export function degradeQuality(): boolean {
  const current = getQuality();
  const at = ORDER.indexOf(current);
  if (at >= ORDER.length - 1) return false;
  setQuality(ORDER[at + 1]);
  return true;
}

export function useQuality(): QualityLevel {
  return useSyncExternalStore(subscribeQuality, getQuality, getQualityOnServer);
}

/* ── El sensor: quien tenga un bucle de fotogramas en toda la página informa aquí ── */

let average = 1 / 60;
let slowFor = 0;
let alive = 0;
let quietUntil = WARMUP;

/** Un fotograma más largo que esto no es lentitud, es ausencia (depurador, sistema parado). */
const ABSENT_FRAME = 3;
/** Los fotogramas lentos cuentan hasta aquí: uno de 700 ms pesa lo mismo que uno de 500. */
const FRAME_CAP = 0.5;

/**
 * Un fotograma más, con su duración en segundos. Lo llama el fondo (corre
 * siempre); las escenas no hace falta que lo llamen. La pestaña oculta no
 * llega aquí: el fondo reinicia su reloj al volver. Hasta la v9.3 se
 * descartaba todo lo que pasara de 500 ms, y una máquina con fotogramas de
 * 700 ms —justo la que más lo necesita— no bajaba nunca de nivel.
 */
export function reportFrame(seconds: number) {
  if (!(seconds > 0) || seconds > ABSENT_FRAME) return;
  const frame = Math.min(seconds, FRAME_CAP);
  alive += frame;
  average += (frame - average) * 0.1;
  if (alive < quietUntil) return;
  if (average > SLOW_FRAME) {
    slowFor += frame;
    if (slowFor >= SLOW_SPAN) {
      slowFor = 0;
      if (degradeQuality()) quietUntil = alive + COOLDOWN;
    }
  } else {
    slowFor = Math.max(0, slowFor - frame * 0.5);
  }
}

/** Lo que el sensor ve ahora mismo, para depurar (`window.__evaQuality` no existe: se lee de aquí). */
export function qualityDebug() {
  return { level: getQuality(), averageMs: Math.round(average * 1000), slowFor: Math.round(slowFor * 10) / 10 };
}

/**
 * La entrada del símbolo en `/links`, escrita como CSS en vez de como bucle.
 *
 * Es la misma marca de `brand.ts` —ocho piezas rígidas que sólo se trasladan y
 * giran— en un recorrido corto y de una sola vez: □X → ≡X → ƎVΛ → □X, unos
 * 3,2 s. En la portada lo anima un lienzo; aquí no hay lienzo ni JavaScript: el
 * servidor calcula, a partir de las poses, dos `@keyframes` compartidos (uno
 * para el eje horizontal y otro para el vertical, el giro y la opacidad) y las
 * variables de cada pieza. El navegador sólo interpola transformaciones.
 *
 * Dos ejes separados porque la alineación va en L, como en la portada: al
 * formar el nombre, las letras se abren primero en horizontal y después suben
 * o bajan a su fila; al volver, al revés. Cada eje lleva su propio calendario.
 */

import { POSES, SEGMENTS, type PoseId, type SegmentId } from './brand';

export interface MarkStep {
  pose: PoseId;
  /** Lo que tarda en llegar a esta pose desde la anterior, en milisegundos. */
  move: number;
  /** Lo que se queda quieta al llegar. */
  hold: number;
  /** Trayectoria en L: qué eje se mueve primero. */
  axes?: 'x-first' | 'y-first';
}

/**
 * El recorrido: aparece el símbolo, el cuadrado se abre en ≡ sobre la X, la X
 * se parte y todo se alinea en el nombre; después vuelve por el mismo camino y
 * se queda en el símbolo. Empieza y termina en la misma pose, así que antes y
 * después de la animación (y con movimiento reducido) se ve el símbolo quieto.
 */
export const ARCADE_INTRO: readonly MarkStep[] = [
  { pose: 'isotype', move: 0, hold: 450 },
  { pose: 'detach', move: 200, hold: 0 },
  { pose: 'unlock', move: 350, hold: 250 },
  { pose: 'split', move: 150, hold: 0 },
  { pose: 'logotype', move: 500, hold: 350, axes: 'x-first' },
  { pose: 'split', move: 400, hold: 0, axes: 'y-first' },
  { pose: 'unlock', move: 200, hold: 0 },
  { pose: 'detach', move: 200, hold: 0 },
  { pose: 'isotype', move: 200, hold: 0 },
];

/** Cuánto se solapan los dos tramos de una trayectoria en L (el mismo valor que la portada). */
const AXIS_OVERLAP = 0.3;
const SPAN = (1 + AXIS_OVERLAP) / 2;

/** La curva de la ficha (`ease` de `brand.ts`: cúbica de entrada y salida, sin rebote), en CSS. */
export const MARK_EASING = 'cubic-bezier(0.65, 0, 0.35, 1)';

export type Channel = 'x' | 'y';

/** Un punto del calendario: en `t` ms, el canal está en la pose número `step`. */
export interface Stop {
  t: number;
  step: number;
}

export function markDuration(steps: readonly MarkStep[] = ARCADE_INTRO) {
  return steps.reduce((total, step) => total + step.move + step.hold, 0);
}

/** El tramo de un movimiento en el que se mueve un canal. */
function windowOf(step: MarkStep, start: number, channel: Channel): [number, number] {
  const end = start + step.move;
  const lead: [number, number] = [start, start + step.move * SPAN];
  const follow: [number, number] = [end - step.move * SPAN, end];
  if (step.axes === 'x-first') return channel === 'x' ? lead : follow;
  if (step.axes === 'y-first') return channel === 'y' ? lead : follow;
  return [start, end];
}

/** Calendario de un canal: cuándo sale de cada pose y cuándo llega a la siguiente. */
export function stopsOf(channel: Channel, steps: readonly MarkStep[] = ARCADE_INTRO): Stop[] {
  const stops: Stop[] = [{ t: 0, step: 0 }];
  let clock = 0;
  steps.forEach((step, index) => {
    if (index > 0 && step.move > 0) {
      const [from, to] = windowOf(step, clock, channel);
      stops.push({ t: from, step: index - 1 }, { t: to, step: index });
    }
    clock += step.move + step.hold;
  });
  stops.push({ t: clock, step: steps.length - 1 });
  // Dos puntos en el mismo instante están en la misma pose: basta uno.
  return stops.filter((stop, k) => k === 0 || stop.t > stops[k - 1].t);
}

const round = (value: number) => Math.round(value * 1000) / 1000;

/** Los dos `@keyframes`, comunes a las ocho piezas: cada una pone sus valores en variables. */
export function markKeyframes(steps: readonly MarkStep[] = ARCADE_INTRO) {
  const total = markDuration(steps);
  const frame = (channel: Channel, name: string, body: (step: number) => string) =>
    `@keyframes ${name}{${stopsOf(channel, steps)
      .map(({ t, step }) => `${round((t / total) * 100)}%{${body(step)};animation-timing-function:${MARK_EASING}}`)
      .join('')}}`;
  return [
    frame('x', 'arcade-mark-x', (k) => `transform:translateX(var(--x${k}))`),
    frame('y', 'arcade-mark-y', (k) => `transform:translateY(var(--y${k})) rotate(var(--a${k}));opacity:var(--o${k})`),
  ].join('');
}

/** Las variables de una pieza: dónde está en cada paso del recorrido, en unidades de la marca. */
export function pieceVars(id: SegmentId, steps: readonly MarkStep[] = ARCADE_INTRO) {
  return steps
    .map((step, k) => {
      const place = POSES[step.pose][id];
      return `--x${k}:${round(place.x)}px;--y${k}:${round(place.y)}px;--a${k}:${round(place.angle)}deg;--o${k}:${round(place.alpha)}`;
    })
    .join(';');
}

/** Toda la hoja de la animación: los fotogramas y las variables de cada pieza. */
export function markStyles(steps: readonly MarkStep[] = ARCADE_INTRO) {
  const pieces = SEGMENTS.map((id) => `.arcade-mark .mark-${id}{${pieceVars(id, steps)}}`).join('');
  return `.arcade-mark{--mark-ms:${markDuration(steps)}ms}` + markKeyframes(steps) + pieces;
}

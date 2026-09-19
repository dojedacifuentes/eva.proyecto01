/**
 * Estado de la lectura exterior del Cuerpo, publicado para quien quiera
 * reaccionar a él. Igual que el genoma con `<html data-genome>`: la biolectura
 * escribe en `<html data-body>` y el hilo que une las dos piezas de la sección
 * —lectura exterior, lectura interna— se enciende desde CSS, sin pasar estado
 * entre componentes hermanos. Cada pasada sacude un poco el campo de partículas.
 */
import { surgeField } from './field';

/** `idle` nadie ha leído · `scanning` hay una pasada en curso · `read` el exterior está analizado. */
export type BodyState = 'idle' | 'scanning' | 'read';

const SURGE: Record<BodyState, number> = { idle: 0, scanning: 0.35, read: 0.5 };

export function publishBody(state: BodyState) {
  document.documentElement.dataset.body = state;
  if (SURGE[state] > 0) surgeField(SURGE[state]);
}

export function clearBody() {
  delete document.documentElement.dataset.body;
}

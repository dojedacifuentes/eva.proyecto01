/**
 * Dónde está el visitante.
 *
 * Una tienda mínima para `useSyncExternalStore`, como `lib/stage`: el
 * observador de la página (`ContextSpy`) escribe el nodo del recorrido que
 * ocupa el centro de la pantalla, y lo leen la navegación, el canal de EVA y
 * el fondo. Un solo dueño de la verdad: antes la cabecera tenía su observador
 * y el panel de pensamiento no sabía dónde estaba.
 */
import { home } from '@/content/structure';

let current: string = home.id;
const listeners = new Set<() => void>();

export function setContext(id: string) {
  if (current === id) return;
  current = id;
  for (const listener of listeners) listener();
}

export function getContext() {
  return current;
}

/** En el servidor el visitante siempre está en la portada. */
export function getContextOnServer() {
  return home.id;
}

export function subscribeContext(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Cuánto tiene que sostenerse un nodo en el centro de la pantalla para contar
 * como cambio de lugar. Sin esta espera, leer cerca de un borde —o el ajuste
 * del scroll-snap— haría parpadear el contexto y le cerraría el canal al
 * visitante en mitad de una frase.
 */
export const CONTEXT_DWELL_MS = 400;

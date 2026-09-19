import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void) {
  const motion = window.matchMedia(QUERY);
  motion.addEventListener('change', onChange);
  return () => motion.removeEventListener('change', onChange);
}

function snapshot() {
  return window.matchMedia(QUERY).matches;
}

/** En el servidor no hay preferencia: se asume movimiento normal, sin desajustar la hidratación. */
function serverSnapshot() {
  return false;
}

/**
 * Preferencia de movimiento del sistema, para componentes que sí se renderizan
 * en el servidor. Con `useSyncExternalStore` en vez de estado: nada de `window`
 * en un inicializador, que pasa el dev server y revienta el build.
 */
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}

/**
 * Qué capa ocupa la pantalla. El neuroescáner lo enciende al abrirse y el
 * genoma congela su bucle de render mientras esté cubierto: dos escenas WebGL
 * a la vez no aportan nada si una no se ve, y el observador de intersección
 * no distingue «tapado» de «visible».
 *
 * Es una tienda mínima para `useSyncExternalStore`: quien cubre escribe, quien
 * queda debajo se suscribe. Sin estado de React compartido entre hermanos.
 */
let covered = false;
const listeners = new Set<() => void>();

export function setCovered(next: boolean) {
  if (covered === next) return;
  covered = next;
  for (const listener of listeners) listener();
}

export function subscribeCovered(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function isCovered() {
  return covered;
}

/** En el servidor nada tapa a nadie. */
export function isCoveredOnServer() {
  return false;
}

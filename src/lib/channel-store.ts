/**
 * Lo que el resto de la página necesita saber del canal de EVA: si está
 * abierto, y una forma de pedirle que se cierre.
 *
 * Tienda mínima, como `lib/stage`. El canal escribe su estado; la sala del
 * núcleo lo lee para bajar la voz de la ventana de lectura mientras EVA habla
 * (una sola cosa habla a la vez). Quien navega con un enlace pide el cierre sin
 * esperar a que el desplazamiento termine.
 */
let open = false;
const listeners = new Set<() => void>();

export function setChannelOpen(next: boolean) {
  if (open === next) return;
  open = next;
  for (const listener of listeners) listener();
}

export function isChannelOpen() {
  return open;
}

/** En el servidor el canal siempre está cerrado: es su estado inicial. */
export function isChannelOpenOnServer() {
  return false;
}

export function subscribeChannelOpen(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const CLOSE_EVENT = 'eva:channel-close';

/** Un enlace interno lleva a otro lugar: el canal se pliega ya, no al llegar. */
export function requestChannelClose() {
  window.dispatchEvent(new Event(CLOSE_EVENT));
}

export function subscribeChannelClose(listener: () => void) {
  window.addEventListener(CLOSE_EVENT, listener);
  return () => window.removeEventListener(CLOSE_EVENT, listener);
}

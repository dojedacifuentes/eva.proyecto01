/**
 * Estado compartido del núcleo neural entre la capa HTML, los controles de
 * cámara y el bucle de render. Objeto mutable de módulo, como `spinSignal` y
 * `pointerSignal`: se escribe desde eventos y se lee sesenta veces por segundo,
 * sin pasar por React. Sólo hay un escáner abierto a la vez, así que un
 * singleton basta; se reinicia al montar la escena.
 */
export interface CoreSignal {
  /** El visitante está arrastrando: el giro automático se aparta y el hover se ignora. */
  dragging: boolean;
  /** Hay una región bajo el cursor: el giro se frena. */
  hovering: boolean;
  /** Doble clic o botón de restablecer: la cámara y el cerebro vuelven a su sitio. */
  resetRequested: boolean;
  /** Punto de la corteza (espacio local del cerebro) que se ilumina al previsualizar una región. */
  focusX: number;
  focusY: number;
  focusZ: number;
  focusStrength: number;
  /** Actividad global de la red, 0–1: la corteza late con ella. */
  activity: number;
}

export const coreSignal: CoreSignal = {
  dragging: false,
  hovering: false,
  resetRequested: false,
  focusX: 0,
  focusY: 0,
  focusZ: 0,
  focusStrength: 0,
  activity: 0,
};

export function resetCoreSignal() {
  coreSignal.dragging = false;
  coreSignal.hovering = false;
  coreSignal.resetRequested = false;
  coreSignal.focusStrength = 0;
  coreSignal.activity = 0;
}

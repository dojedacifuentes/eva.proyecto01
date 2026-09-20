/**
 * Estado del fondo: lo que el recorrido le pide al campo de partículas.
 *
 * Objeto mutable de módulo, como `pointerSignal`: se escribe desde eventos
 * (cambio de eje, acciones del genoma) y el campo lo lee sesenta veces por
 * segundo, sin pasar por React.
 */
export interface FieldSignal {
  /** 0 deriva normal · 1 quietud: las partículas frenan hasta casi pararse (un lugar clausurado). */
  calm: number;
  /** Color de los hilos del campo, como `r, g, b`. */
  rgb: string;
  /** Sacudida pendiente, 0–1: la encienden las acciones del genoma y se apaga sola. */
  surge: number;
  /**
   * El fondo cede el sitio. Lo enciende la Consciencia mientras su campo está
   * en pantalla: allí las partículas son el tema, no el decorado, y dos campos
   * a la vez eran dos ideas compitiendo (y dos bucles de dibujo). El fondo se
   * apaga con un fundido y su bucle se queda en nada hasta que vuelva.
   */
  yielded: boolean;
}

export const FIELD_TINT = {
  cyan: '63, 216, 238',
  magenta: '240, 122, 185',
  violet: '154, 141, 255',
  yellow: '216, 240, 91',
  bio: '120, 240, 180',
} as const;

export const fieldSignal: FieldSignal = {
  calm: 0,
  rgb: FIELD_TINT.cyan,
  surge: 0,
  yielded: false,
};

/** Cede (o recupera) el fondo. Lo llama la Consciencia al entrar y al salir. */
export function yieldField(on: boolean) {
  fieldSignal.yielded = on;
}

/** Una sacudida del tejido: mutar o clonar el genoma se nota en toda la página. */
export function surgeField(strength = 1) {
  fieldSignal.surge = Math.min(1, Math.max(fieldSignal.surge, strength));
}

/**
 * Giro manual de la hélice. Lo escribe el arrastre sobre el lienzo (que vive en
 * el DOM) y lo lee el bucle de render (que vive en la escena 3D).
 *
 * Objeto mutable compartido, como `pointerSignal`: pasarlo por props haría que
 * el compilador de React lo tratara como inmutable, y esto se toca en cada
 * fotograma.
 */
export interface SpinSignal {
  /** Radianes por fotograma que aporta el arrastre; se va frenando sola. */
  velocity: number;
  /** Mientras se arrastra, el giro automático se aparta. */
  dragging: boolean;
}

export const spinSignal: SpinSignal = { velocity: 0, dragging: false };

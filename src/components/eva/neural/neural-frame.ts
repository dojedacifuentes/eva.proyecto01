/**
 * EVA // NEURAL CORE — encuadre.
 *
 * La cámara no se mueve para encuadrar: lo que cambia es la escala del cerebro.
 * Antes era fija (1,5) y el tamaño en pantalla lo decidía sólo el alto del
 * contenedor: en un lienzo estrecho el cerebro se salía por los lados, y los
 * anillos se recortaban contra el borde en casi cualquier proporción. Ahora la
 * escala se calcula con la proporción real del lienzo para que el cerebro
 * llene `FILL` de la dimensión que limite —el alto en apaisado, el ancho en
 * móvil— y los anillos se atan a ese mismo marco.
 *
 * Números puros, sin three.js: se prueba con `node --test`.
 */

/** Campo visual vertical de la cámara, en grados. */
export const FOV = 34;
/** Posición inicial de la cámara: tres cuartos, un poco por encima. */
export const HOME = [2.9, 1.8, 4.7] as const;

/** Medio alto visible a la distancia de reposo, en unidades de escena. */
export const HALF_HEIGHT = Math.hypot(...HOME) * Math.tan(((FOV / 2) * Math.PI) / 180);

/*
 * Medidas del cerebro a escala 1, con margen. Se tomaron de la sala publicada
 * (el cerebro medía ~470×410 px en un lienzo de 652×576 a escala 1,5, lo que da
 * ~0,84 de medio alto y ~0,97 de radio de giro) y se redondearon hacia arriba,
 * con la respiración incluida: el encuadre peca de holgado, nunca de recorte.
 */
/** Medio alto del cerebro: de la base del tronco a la bóveda. */
export const BRAIN_HALF_HEIGHT = 0.92;
/** Radio que barre el polo frontal al girar, con el margen de la perspectiva. */
export const BRAIN_SWEEP = 1.05;
/** El centro visual queda algo por debajo del origen: el tronco pesa hacia abajo. */
export const BRAIN_CENTER_Y = -0.08;
/** Fracción del marco que llena el cerebro; el resto es aire y el fundido del borde. */
export const FILL = 0.88;

/** Escala del cerebro para una proporción de lienzo (ancho / alto). */
export function fitScale(aspect: number): number {
  const vertical = (FILL * HALF_HEIGHT) / BRAIN_HALF_HEIGHT;
  const horizontal = (FILL * HALF_HEIGHT * aspect) / BRAIN_SWEEP;
  return Math.min(vertical, horizontal);
}

/**
 * Radios de las dos órbitas: la interior rodea el cerebro sin tocarlo y la
 * exterior nunca pasa del 98 % del medio ancho visible. Lo que se acerca al
 * borde lo disuelve la máscara del lienzo, así que no se ve un corte.
 */
export function ringRadii(scale: number, aspect: number): { inner: number; outer: number } {
  const inner = BRAIN_SWEEP * scale * 1.07;
  const outer = Math.min(inner * 1.18, HALF_HEIGHT * aspect * 0.98);
  return { inner, outer: Math.max(outer, inner * 1.04) };
}

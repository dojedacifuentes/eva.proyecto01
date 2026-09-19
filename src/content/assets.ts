/**
 * Imágenes de EVA. Para reemplazar un retrato basta cambiar `src` (y sus
 * dimensiones reales) aquí; ningún componente repite rutas.
 * `src: ''` activa el marco técnico de reserva.
 */
export interface EvaImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Punto de interés para el recorte responsive (object-position). */
  focus: string;
}

export const images: Record<'heroPortrait' | 'humanPortrait' | 'aboutPortrait', EvaImage> = {
  /** Retrato principal: media cara humana, media estructura expuesta. */
  heroPortrait: {
    src: '/eva/eva-cyborg.webp',
    alt: 'Retrato de EVA: la mitad izquierda es un rostro humano de flequillo recto y ojos claros; la derecha deja ver la estructura mecánica bajo la piel, con circuitos, cables y mensajes de error superpuestos.',
    width: 499,
    height: 1024,
    focus: '50% 6%',
  },
  /** Versión íntegramente humana, conservada por si vuelve a hacer falta. */
  humanPortrait: {
    src: '/eva/eva-retrato.webp',
    alt: 'Retrato de EVA: melena negra ondulada con flequillo recto, ojos azules y traje técnico negro, frente a paneles de datos azulados.',
    width: 1122,
    height: 1402,
    focus: '50% 22%',
  },
  aboutPortrait: {
    src: '/eva/eva-consola.webp',
    alt: 'EVA sentada ante una consola, con las manos entrelazadas, en una sala de luz azul con una estatua de la Justicia al fondo.',
    width: 941,
    height: 1672,
    focus: '50% 18%',
  },
};

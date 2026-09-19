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

/**
 * Bucle de vídeo de EVA. La imagen sigue siendo el póster y lo único que se
 * sirve en móvil: el vídeo pesa y ahí no aporta.
 */
export const heroLoop = {
  src: '/eva/eva-loop.mp4',
  type: 'video/mp4',
  /** Aviso para quien mantenga esto: sin comprimir todavía. */
  bytes: 3_888_331,
} as const;

/**
 * Las dos tomas del Cuerpo (01.11), las dos en vídeo: el propietario pidió
 * conservarlas así. Traen pista de audio, que no se usa: se sirven `muted` y
 * sin control de sonido. El póster de cada una es su primer fotograma, para
 * que no salte nada al arrancar; la biolectura se dibuja sobre ese mismo marco,
 * así que **el póster tiene que ser del vídeo**, no una imagen parecida.
 *
 * Sólo se monta el vídeo de la vista que se está mirando; el otro ni se
 * descarga. En pantallas estrechas y con movimiento reducido, ninguno: queda
 * el póster y un botón para pedirlo.
 */
export interface EvaLoop {
  src: string;
  type: string;
  width: number;
  height: number;
  /** Peso real del archivo: se enseña donde el vídeo hay que pedirlo. */
  bytes: number;
}

export const capsuleLoop: EvaLoop = {
  src: '/eva/eva-capsula-loop.mp4',
  type: 'video/mp4',
  width: 720,
  height: 1280,
  /** Sin recomprimir. */
  bytes: 5_765_937,
};

/** La cápsula, de frente y en movimiento: mismas medidas, más peso. */
export const capsuleFrontLoop: EvaLoop = {
  src: '/eva/eva-capsula-frontal.mp4',
  type: 'video/mp4',
  width: 720,
  height: 1280,
  /** Sin recomprimir. */
  bytes: 9_334_571,
};

export const images: Record<
  | 'heroPortrait'
  | 'closeUpPortrait'
  | 'humanPortrait'
  | 'aboutPortrait'
  | 'capsuleProfile'
  | 'capsuleFront'
  | 'capsulePortrait',
  EvaImage
> = {
  /** Retrato principal: medio cuerpo, media estructura expuesta. */
  heroPortrait: {
    src: '/eva/eva-cyborg-02.webp',
    alt: 'Retrato de EVA de medio cuerpo y brazos cruzados: la mitad izquierda es una mujer de melena negra y flequillo recto; la derecha deja a la vista la estructura mecánica bajo la piel, con placas, cables de colores y fibras, en una sala de luz azul con paneles de datos.',
    width: 765,
    height: 1024,
    focus: '46% 18%',
  },
  /** Primer plano anterior del mismo personaje, en reserva. */
  closeUpPortrait: {
    src: '/eva/eva-cyborg.webp',
    alt: 'Primer plano de EVA: la mitad izquierda es un rostro humano de flequillo recto y ojos claros; la derecha deja ver la estructura mecánica bajo la piel, con circuitos, cables y mensajes de error superpuestos.',
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
  /** Primer fotograma de `capsuleLoop`: su póster y lo que se lee cuando el vídeo no está. */
  capsuleProfile: {
    src: '/eva/eva-capsula-perfil.webp',
    alt: 'EVA de perfil, mirando hacia arriba: melena negra de flequillo recto y una placa metálica sobre la sien y la mandíbula. Del cuello hacia abajo el cuerpo es sintético: placas blancas, fibras rojizas como músculo, cables y un núcleo circular que brilla en azul en el pecho. Detrás, una pared de máquinas cubierta de tubos y musgo.',
    width: 720,
    height: 1280,
    focus: '50% 50%',
  },
  /** Primer fotograma de `capsuleFrontLoop`: su póster, y el marco de la biolectura frontal. */
  capsuleFront: {
    src: '/eva/eva-capsula-frontal.webp',
    alt: 'EVA de frente y de cuerpo entero, suspendida en una cápsula cilíndrica de líquido verdoso con burbujas, conectada por tubos que bajan hacia su cabeza. El cuerpo es sintético: placas blancas sobre fibras rojizas y un núcleo circular azul en el pecho. Sobre el cristal se leen rótulos en inglés: «Orpheus Biotech», «EVA-01, synthetic human interface» y «Humanity beyond its end».',
    width: 720,
    height: 1280,
    focus: '50% 50%',
  },
  /**
   * La misma toma frontal como imagen fija, tal como la entregó el propietario
   * (1024×1536, con más margen a los lados). En reserva desde que la vista
   * frontal es vídeo: su proporción no casa con la del vídeo.
   */
  capsulePortrait: {
    src: '/eva/eva-capsula.webp',
    alt: 'EVA de frente y de cuerpo casi entero, suspendida en una cápsula cilíndrica de líquido verdoso con burbujas, conectada por tubos que bajan hacia su cabeza y su espalda. El cuerpo es sintético: placas blancas sobre fibras rojizas y un núcleo circular azul en el pecho. Sobre el cristal se leen rótulos en inglés: «Orpheus Biotech», «EVA-01, synthetic human interface» y «Some things still remember».',
    width: 1024,
    height: 1536,
    focus: '50% 50%',
  },
};

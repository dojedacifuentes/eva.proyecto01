/**
 * `/links`: la puerta de EVA en redes (Instagram, TikTok, LinkedIn…). Aquí vive
 * todo lo que se lee en esa página; los componentes sólo lo colocan.
 *
 * La página se ordena por grupos. Hoy hay uno, EVA ARCADE, y es el protagonista
 * (el hero habla de él). Cuando exista otro —EVA Academy, EVA Lab— se añade a
 * `groups` con sus propias entradas y la página lo pinta como una sección más,
 * debajo del Arcade. Un grupo sin entradas no se muestra.
 */

export type LinkAccent = 'blue' | 'magenta';

/** Una experiencia a la que lleva la página: hoy, un juego. */
export interface LinkEntry {
  id: string;
  /** Número de nodo, con dos cifras: «01». */
  node: string;
  /** Rótulo de arriba: género y rama del Derecho. */
  category: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  /** Campo de color de la marca: azul a la izquierda, violeta y magenta a la derecha. */
  accent: LinkAccent;
  /** Estado que se muestra junto al nodo. Sin él, no se pinta nada. */
  status?: string;
}

export interface LinkGroup {
  id: string;
  /** Rótulo de la sección. */
  label: string;
  entries: readonly LinkEntry[];
}

export const links = {
  seo: {
    title: 'EVA ARCADE — Juegos',
    description: 'Juegos interactivos de Derecho dentro del universo EVA.',
    ogTitle: 'EVA ARCADE',
    ogDescription: 'Derecho. Decisiones. Consecuencias.',
  },
  hero: {
    status: 'EVA // ARCADE ONLINE',
    title: 'EVA ARCADE',
    tagline: 'Derecho. Decisiones. Consecuencias.',
  },
  gateway: {
    title: '¿QUIÉN ES EVA?',
    text: 'Una entidad apareció dentro de una red.',
    cta: 'CONOCE A EVA',
    href: 'https://evaproyecto01.vercel.app/',
  },
  footer: 'EVA · 2026',
} as const;

export const groups: readonly LinkGroup[] = [
  {
    id: 'arcade',
    label: 'ARCHIVOS DISPONIBLES',
    entries: [
      {
        id: 'procesal',
        node: '01',
        category: 'RPG · DERECHO PROCESAL',
        // Nombre y descripción oficiales del juego (su <title> y su meta description).
        title: 'FORO [in]VISIBLE',
        description: 'Simulador procesal chileno: CPC, COT y CPR.',
        href: 'https://evagameproce.vercel.app/',
        cta: 'INICIAR PARTIDA',
        accent: 'blue',
        status: 'EN LÍNEA',
      },
      {
        id: 'familia',
        node: '02',
        category: 'RPG · DERECHO DE FAMILIA',
        title: 'EXPEDIENTE 1725',
        description: 'El amor cambia. El expediente queda.',
        href: 'https://evaarcadefamilia.vercel.app/',
        cta: 'ABRIR EXPEDIENTE',
        accent: 'magenta',
        status: 'EN LÍNEA',
      },
    ],
  },
];

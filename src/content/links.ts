/**
 * `/links`: la puerta de EVA en redes (Instagram, TikTok, LinkedIn…). Aquí vive
 * todo lo que se lee en esa página; los componentes sólo lo colocan.
 *
 * La página se ordena por grupos. El primero, EVA ARCADE, es el protagonista:
 * el hero habla de él y sus entradas van en tarjetas grandes, con ilustración.
 * Los demás —EVA ACADEMY, EVA LAB— van debajo, en tarjetas compactas y, en
 * escritorio, lado a lado. Un grupo nuevo se añade a `groups`; un grupo sin
 * entradas no se muestra.
 */

/** Campo de color de la marca: azul e índigo a la izquierda, violeta y magenta a la derecha. */
export type LinkAccent = 'blue' | 'indigo' | 'violet' | 'magenta';

/** Ilustración abstracta de cada entrada (`components/links/EntryArt.tsx`). */
export type LinkArt = 'procesal' | 'familia' | 'curso' | 'generador';

/** Una experiencia a la que lleva la página: un juego, un curso, una herramienta. */
export interface LinkEntry {
  id: string;
  /** Número de nodo, con dos cifras: «01». */
  node: string;
  /** Rótulo de arriba: qué es y de qué trata. */
  category: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  accent: LinkAccent;
  art: LinkArt;
  /** Estado que se muestra junto al nodo. Sin él, no se pinta nada. */
  status?: string;
}

export interface LinkGroup {
  id: string;
  /** Rótulo de la sección. */
  label: string;
  /** Tarjetas grandes, con ilustración: sólo el grupo protagonista. */
  featured?: boolean;
  entries: readonly LinkEntry[];
}

export const links = {
  seo: {
    title: 'EVA ARCADE — Juegos',
    description: 'Juegos, un curso y un generador de prompts jurídicos dentro del universo EVA.',
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
    featured: true,
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
        art: 'procesal',
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
        art: 'familia',
        status: 'EN LÍNEA',
      },
    ],
  },
  {
    id: 'academy',
    label: 'EVA ACADEMY',
    entries: [
      {
        id: 'curso',
        node: '03',
        category: 'CURSO · A TU RITMO',
        // Nombre y etapas del curso en EVA LAB (evaprompts: /curso).
        title: 'CONSTRUYE TU PROMPT',
        description: 'Cinco etapas: pregunta, prompt, auditoría, verificación y cierre.',
        href: 'https://evaprompts.vercel.app/curso',
        cta: 'EMPEZAR EL CURSO',
        accent: 'indigo',
        art: 'curso',
      },
    ],
  },
  {
    id: 'lab',
    label: 'EVA LAB',
    entries: [
      {
        id: 'generador',
        node: '04',
        category: 'GENERADOR DE PROMPTS',
        // El Prompt Lab de EVA LAB (evaprompts: /prompt-lab).
        title: 'PROMPT LAB',
        description: 'Prompts jurídicos en 12 decisiones explícitas.',
        href: 'https://evaprompts.vercel.app/prompt-lab',
        cta: 'ABRIR EL GENERADOR',
        accent: 'violet',
        art: 'generador',
      },
    ],
  },
];

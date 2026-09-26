/**
 * `/links`: la puerta de EVA en redes (Instagram, TikTok, LinkedIn…). Aquí vive
 * todo lo que se lee en esa página; los componentes sólo lo colocan.
 *
 * La página se ordena por grupos. El primero, EVA ARCADE, es el protagonista:
 * el hero habla de él y sus entradas van en tarjetas grandes, con ilustración.
 * Los demás —EVA ACADEMY, EVA LAB— van debajo, en tarjetas compactas y, en
 * escritorio, lado a lado. Un grupo nuevo se añade a `groups`; un grupo sin
 * entradas no se muestra.
 *
 * Cada grupo numera sus entradas en binario, como su propia serie: los juegos
 * van `NODE 01`, `NODE 10` (el tercero será `NODE 11`) y la primera entrada de
 * Academy o de Lab es `01`.
 */

import { bin, bitsFor } from '@/lib/binary';

/** Campo de color de la marca: azul e índigo a la izquierda, violeta y magenta a la derecha. */
export type LinkAccent = 'blue' | 'indigo' | 'violet' | 'magenta';

/** Ilustración abstracta de cada entrada (`components/links/EntryArt.tsx`). */
export type LinkArt = 'procesal' | 'familia' | 'curso' | 'generador';

/** Una experiencia a la que lleva la página: un juego, un curso, una herramienta. */
export interface LinkEntry {
  id: string;
  /**
   * Número de nodo, en binario y con el ancho de su serie («01», «10», «11»…), como todo
   * identificador de EVA (CONTENT_GUIDE, «Numeración binaria»). Lo pone `withNodes` a partir de
   * la posición dentro de su grupo; no se escribe. Hasta el 26-09-2026 iba en decimal y seguido
   * en toda la página («01» a «04»).
   */
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
    /** La portada, relativa: así vale con dominio propio y en las vistas previas de Vercel. */
    href: '/',
  },
  footer: 'EVA · 2026',
} as const;

/** Numera las entradas de un grupo por su posición, en binario y con el ancho de la serie. */
function withNodes(entries: readonly Omit<LinkEntry, 'node'>[]): LinkEntry[] {
  const width = bitsFor(entries.length);
  return entries.map((entry, at) => ({ ...entry, node: bin(at + 1, width) }));
}

export const groups: readonly LinkGroup[] = [
  {
    id: 'arcade',
    label: 'ARCHIVOS DISPONIBLES',
    featured: true,
    entries: withNodes([
      {
        id: 'procesal',
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
        category: 'RPG · DERECHO DE FAMILIA',
        title: 'EXPEDIENTE 1725',
        description: 'El amor cambia. El expediente queda.',
        href: 'https://evaarcadefamilia.vercel.app/',
        cta: 'ABRIR EXPEDIENTE',
        accent: 'magenta',
        art: 'familia',
        status: 'EN LÍNEA',
      },
    ]),
  },
  {
    id: 'academy',
    label: 'EVA ACADEMY',
    entries: withNodes([
      {
        id: 'curso',
        category: 'CURSO · A TU RITMO',
        // Nombre y etapas del curso en EVA LAB (evaprompts: /curso).
        title: 'CONSTRUYE TU PROMPT',
        description: 'Cinco etapas: pregunta, prompt, auditoría, verificación y cierre.',
        href: 'https://evaprompts.vercel.app/curso',
        cta: 'EMPEZAR EL CURSO',
        accent: 'indigo',
        art: 'curso',
      },
    ]),
  },
  {
    id: 'lab',
    label: 'EVA LAB',
    entries: withNodes([
      {
        id: 'generador',
        category: 'GENERADOR DE PROMPTS',
        // El Prompt Lab de EVA LAB (evaprompts: /prompt-lab).
        title: 'PROMPT LAB',
        description: 'Prompts jurídicos en 12 decisiones explícitas.',
        href: 'https://evaprompts.vercel.app/prompt-lab',
        cta: 'ABRIR EL GENERADOR',
        accent: 'violet',
        art: 'generador',
      },
    ]),
  },
];

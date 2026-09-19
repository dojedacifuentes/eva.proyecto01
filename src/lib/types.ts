/** Modelo canónico del contenido de EVA. Los componentes sólo conocen estos tipos. */

export type ModuleId = 'academy' | 'news' | 'arcade' | 'lab';

export type ContentStatus = 'available' | 'prototype' | 'in-development' | 'concept';

export type Topic =
  | 'IA y Derecho'
  | 'Educación'
  | 'Ética'
  | 'Gobernanza'
  | 'Prompting'
  | 'Agentes'
  | 'Modelos de lenguaje'
  | 'Legal Design'
  | 'Privacidad'
  | 'Transparencia algorítmica';

export type AccentToken = 'cyan' | 'yellow' | 'magenta' | 'violet';

export interface Module {
  id: ModuleId;
  /** Código técnico visible en la tarjeta: «01», «02»… */
  code: string;
  name: string;
  tagline: string;
  description: string;
  accent: AccentToken;
  /** Ancla dentro de la portada. */
  href: `#${string}`;
  /** Intención del visitante, en primera persona. */
  intent: string;
  /** Remate de EVA. Máximo uno por bloque. */
  aside?: string;
}

/** Campos comunes a todo lo que se lista en un universo. */
export interface ContentItem {
  id: string;
  title: string;
  description: string;
  status: ContentStatus;
  tags: string[];
  image?: string;
  alt?: string;
  updatedAt?: string;
}

/** Cómo se presenta un proyecto dentro de un universo concreto. */
export interface ProjectContext {
  label: string;
  description: string;
  intent: string;
  cta: string;
  href?: string;
}

export type ProjectKind = 'course' | 'game' | 'prototype';

export interface Project extends ContentItem {
  descriptor?: string;
  kinds: ProjectKind[];
  modules: ModuleId[];
  /** Destino principal, cuando no hay contexto específico. */
  href?: string;
  contexts?: Partial<Record<ModuleId, ProjectContext>>;
  featured?: boolean;
  /** Frase editorial para la sección de destacado. */
  featuredPitch?: string;
  repository?: string;
}

export type ResourceKind = 'route' | 'library';

export interface LearningResource extends ContentItem {
  kind: ResourceKind;
  module: 'academy';
  topics?: Topic[];
}

export type NewsStatus = 'draft' | 'published' | 'featured';

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  /** ISO 8601 (AAAA-MM-DD). */
  date: string;
  source: string;
  sourceUrl?: string;
  category: string;
  tags: string[];
  whyItMatters: string;
  evaComment: string;
  image?: string;
  alt?: string;
  status: NewsStatus;
  /** Verdadero mientras la entrada sea de demostración y no una noticia real. */
  demo: boolean;
}

/** Proyección de un proyecto o recurso dentro de un universo. */
export interface ModuleEntry {
  id: string;
  title: string;
  description: string;
  status: ContentStatus;
  tags: string[];
  descriptor?: string;
  intent?: string;
  cta?: string;
  href?: string;
}

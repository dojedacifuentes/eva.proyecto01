// ─────────────────────────────────────────────────────────────────────────────
// Tipos de las colecciones de EVA.
//
// En la v0.1 las colecciones están vacías a propósito: la arquitectura existe,
// el contenido se incorpora después, pieza por pieza. Añadir un elemento a
// `src/data/collections.ts` basta para que la sección correspondiente deje de
// mostrar su estado vacío y empiece a renderizar fichas.
// ─────────────────────────────────────────────────────────────────────────────

/** Estado editorial de una pieza. Se muestra siempre en monoespaciada. */
export type Status =
  | 'PRÓXIMAMENTE'
  | 'PROGRAMACIÓN EN DESARROLLO'
  | 'EN DESARROLLO'
  | 'EN CURSO'
  | 'PUBLICADO'
  | 'ARCHIVADO';

export type Course = {
  slug: string;
  title: string;
  /** Una línea. Sin retórica. */
  summary: string;
  audience: string;
  status: Status;
  /** Ruta futura en /cursos/[slug]; null mientras no exista página propia. */
  href: string | null;
};

export type Prototype = {
  slug: string;
  title: string;
  summary: string;
  /** Ej.: 'Análisis documental', 'Búsqueda', 'Redacción'. */
  area: string;
  /** Versión viva del prototipo, ej.: 'v0.3'. */
  version: string;
  status: Status;
  href: string | null;
};

export type Report = {
  slug: string;
  title: string;
  /** ISO 8601 (AAAA-MM-DD). Se formatea en la vista, nunca aquí. */
  date: string;
  category: string;
  summary: string;
  href: string | null;
  /** Ruta al PDF en /public, si existe. */
  pdf: string | null;
  status: Status;
};

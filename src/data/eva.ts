// ─────────────────────────────────────────────────────────────────────────────
// FUENTE ÚNICA DE VERDAD — EVA, landing v0.1
//
// Todo el copy de la página vive aquí. Los componentes no contienen texto
// literal: leen de este archivo. Cambiar una frase es cambiar una línea.
// ─────────────────────────────────────────────────────────────────────────────

export const identity = {
  name: 'EVA',
  tagline: 'Derecho × Inteligencia Artificial',
  eyebrow: 'DERECHO × INTELIGENCIA ARTIFICIAL',
  city: 'Valparaíso · Chile',
  year: '2026',
} as const;

export const seo = {
  title: 'EVA — Derecho × Inteligencia Artificial',
  description:
    'EVA crea herramientas jurídicas, enseña inteligencia artificial a abogados y estudiantes de Derecho, diseña workflows y acompaña a equipos legales en la incorporación de nuevas tecnologías.',
} as const;

// ─── Enlaces externos ────────────────────────────────────────────────────────
export const links = {
  instagram: 'https://www.instagram.com/eva.proyecto01/',
  /**
   * Correo o formulario de contacto. Mientras sea null, el CTA de la sección
   * «Estudios jurídicos» apunta al cierre, donde está el enlace público.
   */
  contact: null as string | null,
} as const;

// ─── Navegación ──────────────────────────────────────────────────────────────
// Anclas dentro de la misma página en la v0.1. Cuando cada sección tenga su
// propia ruta, basta cambiar `href` por '/prototipos', '/informes', etc.
export const nav = [
  { label: 'EVA', href: '#eva' },
  { label: 'CURSOS', href: '#cursos' },
  { label: 'PROTOTIPOS', href: '#prototipos' },
  { label: 'INFORMES', href: '#informes' },
  { label: 'ESTUDIOS JURÍDICOS', href: '#estudios-juridicos' },
] as const;

// ─── Hero ────────────────────────────────────────────────────────────────────
export const hero = {
  eyebrow: identity.eyebrow,
  title: 'Construimos nuevas formas de trabajar con Derecho e inteligencia artificial.',
  /** Alternativa aprobada, por si se quiere rotar el titular:
   *  'Herramientas, formación y experimentación para el trabajo jurídico con IA.' */
  subtitle:
    'EVA crea herramientas jurídicas, enseña inteligencia artificial a abogados y estudiantes de Derecho, diseña workflows y acompaña a equipos legales en la incorporación de nuevas tecnologías.',
  primaryCta: { label: 'Conocer EVA', href: '#eva' },
  secondaryCta: { label: 'Ver proyectos', href: '#prototipos' },
} as const;

// ─── Quién es EVA ────────────────────────────────────────────────────────────
export const about = {
  title: 'EVA',
  paragraphs: [
    'EVA es un proyecto de exploración aplicada sobre Derecho e inteligencia artificial.',
    'Investiga cómo estas tecnologías pueden convertirse en herramientas, procesos y nuevas formas de trabajo jurídico.',
  ],
  /** Las cuatro líneas de trabajo. Composición tipográfica, no cards. */
  lines: [
    { index: '01', label: 'HERRAMIENTAS', note: 'Crear' },
    { index: '02', label: 'FORMACIÓN', note: 'Enseñar' },
    { index: '03', label: 'WORKFLOWS', note: 'Diseñar' },
    { index: '04', label: 'ASESORÍA', note: 'Acompañar' },
  ],
} as const;

// ─── Secciones-capítulo ──────────────────────────────────────────────────────
export const sections = {
  courses: {
    id: 'cursos',
    eyebrow: 'FORMACIÓN',
    title: 'Cursos',
    text: 'Programas para abogados y estudiantes de Derecho que buscan comprender y utilizar inteligencia artificial con criterio profesional.',
    status: 'PROGRAMACIÓN EN DESARROLLO',
    emptyNote: 'La programación se publicará curso por curso.',
  },
  prototypes: {
    id: 'prototipos',
    eyebrow: 'LAB',
    title: 'Prototipos',
    text: 'Herramientas y experimentos que exploran nuevas formas de investigar, analizar, organizar y producir trabajo jurídico.',
    label: 'EVA LAB',
    status: 'EN DESARROLLO',
    emptyNote: 'Los prototipos se incorporan uno a uno, con su versión y su estado.',
  },
  reports: {
    id: 'informes',
    eyebrow: 'INVESTIGACIÓN',
    title: 'Informes',
    text: 'Investigación aplicada sobre inteligencia artificial, automatización cognitiva y transformación del trabajo jurídico.',
    status: 'EN DESARROLLO',
    emptyNote: 'El primer informe se publicará con su fecha, categoría y documento.',
  },
  legalTeams: {
    id: 'estudios-juridicos',
    eyebrow: 'EQUIPOS LEGALES',
    title: 'IA aplicada al trabajo jurídico',
    text: 'EVA acompaña a estudios jurídicos y equipos legales en el diseño de workflows, evaluación de herramientas y exploración de casos de uso de inteligencia artificial.',
    cta: 'Conversar sobre un proyecto',
  },
} as const;

// ─── Cierre ──────────────────────────────────────────────────────────────────
export const closing = {
  id: 'cierre',
  title: 'Derecho, herramientas e inteligencia artificial.',
  text: 'EVA documenta lo que construye, enseña lo que aprende y experimenta con nuevas formas de trabajo jurídico.',
  link: 'Seguir EVA en Instagram',
} as const;

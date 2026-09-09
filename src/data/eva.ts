// ─────────────────────────────────────────────────────────────────────────────
// FUENTE ÚNICA DE VERDAD — EVA, landing v0.1
//
// Todo el copy de la página vive aquí. Los componentes no contienen texto
// literal: leen de este archivo. Cambiar una frase es cambiar una línea.
// ─────────────────────────────────────────────────────────────────────────────

export const identity = {
  name: 'EVA',
  /** Microelemento de la identidad: el sello EVA_01, presente en los dos modos. */
  seal: '_01',
  tagline: 'Derecho + Inteligencia Artificial',
  eyebrow: 'DERECHO + INTELIGENCIA ARTIFICIAL',
  city: 'Valparaíso · Chile',
  year: '2026',
} as const;

export const seo = {
  title: 'EVA — Derecho + Inteligencia Artificial',
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

// ─── Índice ──────────────────────────────────────────────────────────────────
// El header ya no lleva navegación: el índice numerado del hero es la única
// forma de recorrer la página, así que cada entrada apunta a un capítulo real.
// Cuando una sección tenga ruta propia, basta cambiar `href` por '/prototipos'.
export const chapterIndex = [
  { number: '01', label: 'EVA', href: '#eva' },
  { number: '02', label: 'CURSOS', href: '#cursos' },
  { number: '03', label: 'PROTOTIPOS', href: '#prototipos' },
  { number: '04', label: 'INFORMES', href: '#informes' },
  { number: '05', label: 'ESTUDIOS', href: '#estudios-juridicos' },
] as const;

// ─── Hero ────────────────────────────────────────────────────────────────────
export const hero = {
  eyebrow: identity.eyebrow,
  /**
   * El titular se compone en tres piezas para poder encender el signo «+» en
   * el color de EVA sin pintar de cyan la frase entera.
   */
  title: { before: 'Derecho', symbol: '+', after: 'IA.', second: 'Sin humo.' },
  subtitle:
    'Herramientas jurídicas, formación y nuevas formas de trabajar con inteligencia artificial.',
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

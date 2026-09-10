// ─────────────────────────────────────────────────────────────────────────────
// FUENTE ÚNICA DE VERDAD — EVA
//
// Todo el copy, la navegación y los rótulos de página viven aquí. Los
// componentes no contienen texto literal: leen de este archivo. Cambiar una
// frase es cambiar una línea.
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
   * Correo o formulario de contacto. Mientras sea null, el CTA de «Estudios
   * jurídicos» apunta a Instagram, que es el único canal público que consta.
   */
  contact: null as string | null,
} as const;

// ─── Capítulos ───────────────────────────────────────────────────────────────
// Cada capítulo es una ruta propia, no un ancla. De aquí salen la navegación
// lateral, la barra inferior en móvil, el índice de la portada y el buscador.
//
// `number` hace de icono: la identidad de EVA es tipográfica y numerada, así
// que no hace falta una librería de iconos para saber dónde estás.
export type Chapter = {
  number: string;
  id: string;
  href: string;
  /** Rótulo corto para la navegación. */
  label: string;
  /** Rótulo aún más corto, para la barra inferior en móvil. */
  short: string;
  eyebrow: string;
  title: string;
  text: string;
  /** Vocabulario alternativo del buscador. */
  keywords: string;
};

export const chapters: Chapter[] = [
  {
    number: '01',
    id: 'eva',
    href: '/eva',
    label: 'EVA',
    short: 'EVA',
    eyebrow: 'EL PROYECTO',
    title: 'EVA',
    text: 'EVA es un proyecto de exploración aplicada sobre Derecho e inteligencia artificial. Investiga cómo estas tecnologías pueden convertirse en herramientas, procesos y nuevas formas de trabajo jurídico.',
    keywords: 'proyecto acerca quienes somos exploracion',
  },
  {
    number: '02',
    id: 'cursos',
    href: '/cursos',
    label: 'Cursos',
    short: 'Cursos',
    eyebrow: 'FORMACIÓN',
    title: 'Cursos',
    text: 'Programas para abogados y estudiantes de Derecho que buscan comprender y utilizar inteligencia artificial con criterio profesional.',
    keywords: 'formacion ensenar programas estudiantes abogados clases talleres',
  },
  {
    number: '03',
    id: 'prototipos',
    href: '/prototipos',
    label: 'Prototipos',
    short: 'Lab',
    eyebrow: 'LAB',
    title: 'Prototipos',
    text: 'Herramientas y experimentos que exploran nuevas formas de investigar, analizar, organizar y producir trabajo jurídico.',
    keywords: 'lab laboratorio herramientas experimentos aplicaciones',
  },
  {
    number: '04',
    id: 'informes',
    href: '/informes',
    label: 'Informes',
    short: 'Informes',
    eyebrow: 'INVESTIGACIÓN',
    title: 'Informes',
    text: 'Investigación aplicada sobre inteligencia artificial, automatización cognitiva y transformación del trabajo jurídico.',
    keywords: 'investigacion research publicaciones documentos papers',
  },
  {
    number: '05',
    id: 'estudios-juridicos',
    href: '/estudios-juridicos',
    label: 'Estudios jurídicos',
    short: 'Estudios',
    eyebrow: 'EQUIPOS LEGALES',
    title: 'IA aplicada al trabajo jurídico',
    text: 'EVA acompaña a estudios jurídicos y equipos legales en el diseño de workflows, evaluación de herramientas y exploración de casos de uso de inteligencia artificial.',
    keywords:
      'estudios juridicos equipos legales asesoria workflows empresas consultoria',
  },
];

export const chapterBySlug = Object.fromEntries(
  chapters.map((chapter) => [chapter.id, chapter]),
) as Record<string, Chapter>;

// ─── Estado editorial de cada capítulo ───────────────────────────────────────
// Lo que hoy hay en cada colección. Cuando deje de estar vacía, el capítulo
// renderiza fichas en lugar de su estado.
export const chapterStatus: Record<
  string,
  { status: string; note: string; label?: string }
> = {
  cursos: {
    status: 'PROGRAMACIÓN EN DESARROLLO',
    note: 'La programación se publicará curso por curso.',
  },
  prototipos: {
    status: 'EN DESARROLLO',
    note: 'Los prototipos se incorporan uno a uno, con su versión y su estado.',
    label: 'EVA LAB',
  },
  informes: {
    status: 'EN DESARROLLO',
    note: 'El primer informe se publicará con su fecha, categoría y documento.',
  },
};

// ─── Portada ─────────────────────────────────────────────────────────────────
export const hero = {
  eyebrow: identity.eyebrow,
  /**
   * El titular se compone en tres piezas para poder encender el signo «+» en
   * el color de EVA sin pintar de cyan la frase entera.
   */
  title: { before: 'Derecho', symbol: '+', after: 'IA.', second: 'Sin humo.' },
  subtitle:
    'Herramientas jurídicas, formación y nuevas formas de trabajar con inteligencia artificial.',
  indexLabel: 'Recorrido',
} as const;

/** Las cuatro líneas de trabajo. Composición tipográfica, no cards. */
export const workLines = [
  { index: '01', label: 'HERRAMIENTAS', note: 'Crear' },
  { index: '02', label: 'FORMACIÓN', note: 'Enseñar' },
  { index: '03', label: 'WORKFLOWS', note: 'Diseñar' },
  { index: '04', label: 'ASESORÍA', note: 'Acompañar' },
] as const;

export const legalTeamsCta = 'Conversar sobre un proyecto';

// ─── Cierre ──────────────────────────────────────────────────────────────────
export const closing = {
  title: 'Derecho, herramientas e inteligencia artificial.',
  text: 'EVA documenta lo que construye, enseña lo que aprende y experimenta con nuevas formas de trabajo jurídico.',
  link: 'Seguir EVA en Instagram',
} as const;

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
// El índice numerado del hero y la navegación de la barra recorren estos cinco
// capítulos.
//
// Los enlaces son absolutos (`/#ancla`, no `#ancla`) porque la barra vive en el
// layout y también se pinta en rutas que no son la landing — /panel, por
// ejemplo. Un ancla relativa allí no lleva a ninguna parte.
//
// `id` va aparte del `href` para que el observador de posición no tenga que
// recortar cadenas. Cuando una sección abra ruta propia, cambia sólo el `href`.
export const chapterIndex = [
  { number: '01', id: 'eva', label: 'EVA', href: '/#eva' },
  { number: '02', id: 'cursos', label: 'CURSOS', href: '/#cursos' },
  { number: '03', id: 'prototipos', label: 'PROTOTIPOS', href: '/#prototipos' },
  { number: '04', id: 'informes', label: 'INFORMES', href: '/#informes' },
  {
    number: '05',
    id: 'estudios-juridicos',
    label: 'ESTUDIOS',
    href: '/#estudios-juridicos',
  },
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

// ─── El avatar ───────────────────────────────────────────────────────────────
// EVA dice lo que piensa con la misma cara. Sólo se le escapa media sonrisa
// cuando la frase es especialmente cruel — de ahí que cada línea declare qué
// gesto merece. El chiste está en el dato, no en el componente.
export const avatar = {
  status: 'EN LÍNEA',
  cue: 'Otra',
  hint: 'Pulsa para que siga hablando',
  lines: [
    { text: 'Un chat recuerda mientras dura la conversación. Un caso dura más que tu paciencia.', face: 'seria' },
    { text: 'Cita tres fallos. Dos existen. Ese es exactamente el problema.', face: 'sonrisa' },
    { text: 'Automatizar el desorden sólo te da desorden más rápido.', face: 'seria' },
    { text: 'Si tu escrito necesita que lo expliques, ya perdiste a la audiencia. Y probablemente el caso.', face: 'seria' },
    { text: 'La IA no te va a quitar el trabajo. El colega que sabe usarla, quizás.', face: 'sonrisa' },
    { text: 'Un expediente repartido en doce carpetas no es un expediente. Es una escena del crimen.', face: 'sonrisa' },
    { text: 'El plazo es lo único en Derecho que no negocia.', face: 'seria' },
    { text: '«La IA va a revolucionar el Derecho» es la forma elegante de decir que nunca la has usado.', face: 'sonrisa' },
    { text: 'La responsabilidad no se delega a un modelo. Tiene nombre, RUT y firma.', face: 'seria' },
  ],
} as const;

// ─── Quién es EVA ────────────────────────────────────────────────────────────
export const about = {
  number: '01',
  eyebrow: 'EL PROYECTO',
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
    number: '02',
    eyebrow: 'FORMACIÓN',
    title: 'Cursos',
    text: 'Programas para abogados y estudiantes de Derecho que buscan comprender y utilizar inteligencia artificial con criterio profesional.',
    status: 'PROGRAMACIÓN EN DESARROLLO',
    emptyNote: 'La programación se publicará curso por curso.',
  },
  prototypes: {
    id: 'prototipos',
    number: '03',
    eyebrow: 'LAB',
    title: 'Prototipos',
    text: 'Herramientas y experimentos que exploran nuevas formas de investigar, analizar, organizar y producir trabajo jurídico.',
    label: 'EVA LAB',
    status: 'EN DESARROLLO',
    emptyNote: 'Los prototipos se incorporan uno a uno, con su versión y su estado.',
  },
  reports: {
    id: 'informes',
    number: '04',
    eyebrow: 'INVESTIGACIÓN',
    title: 'Informes',
    text: 'Investigación aplicada sobre inteligencia artificial, automatización cognitiva y transformación del trabajo jurídico.',
    status: 'EN DESARROLLO',
    emptyNote: 'El primer informe se publicará con su fecha, categoría y documento.',
  },
  legalTeams: {
    id: 'estudios-juridicos',
    number: '05',
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

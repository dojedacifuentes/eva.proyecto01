/**
 * Textos, enlaces y conmutadores globales de la landing.
 * Todo lo que se lee en pantalla y no pertenece a una colección vive aquí.
 */

export const NEWS_NAME = 'EVA News';
const instagramUrl = 'https://www.instagram.com/eva.proyecto01/';

export const site = {
  name: 'EVA',
  expansion: 'Entidad Virtual de Aprendizaje',
  version: 'v3.0',
  locale: 'es_CL',
  seo: {
    title: 'EVA — Inteligencia, aprendizaje y experimentación',
    description:
      'Cursos, conocimiento, noticias, juegos y prototipos para explorar la inteligencia artificial con criterio.',
  },
  /** Único canal público verificado. */
  social: {
    instagram: instagramUrl,
  },
  /** Destino del contacto. Sin sección de cierre, el canal vive en cabecera y pie. */
  contact: {
    href: instagramUrl,
    pendingNote: 'Canal directo en configuración. Mientras tanto, EVA responde por Instagram.',
  },
} as const;

export const flags = {
  news: true,
  counters: true,
  heroRotator: true,
  /** Campo de partículas reactivo al puntero. */
  reactiveField: true,
  /** Cursor propio: círculo que se vuelve cuadrado sobre lo interactivo. */
  signalCursor: true,
  /** Microsonidos sintetizados. Arranca apagado; el control vive en la cabecera. */
  sound: true,
} as const;

export const nav = {
  skip: 'Saltar al contenido',
  status: 'SISTEMA ACTIVO',
  contact: { label: 'Proponer proyecto', href: instagramUrl },
  menuOpen: 'Abrir menú',
  menuClose: 'Cerrar menú',
} as const;

export const hero = {
  label: 'EVA // SISTEMA ACTIVO',
  acronym: [
    { letter: 'E', word: 'Entidad' },
    { letter: 'V', word: 'Virtual' },
    { letter: 'A', word: 'de Aprendizaje' },
  ],
  online: 'EVA está en línea.',
  lede: 'Un espacio para aprender, comprender y experimentar con inteligencia artificial, Derecho y educación.',
  principles: [
    { title: 'Misión', text: 'Aprender a pensar con IA.', aside: 'Pensar sigue siendo parte del trato.' },
    {
      title: 'Visión',
      text: 'Una relación más inteligente con la tecnología.',
      aside: 'La revolución de las máquinas puede esperar.',
    },
    { title: 'Objetivos', text: 'Explorar, contrastar y construir.', aside: 'Dominar el mundo, después del café.' },
  ],
  actions: {
    primary: { label: 'Explorar el sistema', href: '#sistema' },
    secondary: { label: 'Ver los cursos', href: '#cursos' },
  },
  rotator: [
    'Procesando exageraciones sobre IA…',
    'Separando sistemas útiles de presentaciones con humo.',
    'La revolución de las máquinas fue reagendada por mantenimiento.',
    'Guardando un minuto de silencio por el fax. Ya pasó.',
  ],
  portraitCaption: { id: 'EVA_ID // C37-B4', state: 'EN LÍNEA' },
} as const;

export const sections = {
  universes: {
    eyebrow: '01 / El sistema',
    title: 'Cuatro universos, una sola interfaz.',
    lede: 'Elige según lo que quieras hacer: aprender, enterarte, jugar o construir.',
  },
  featured: { eyebrow: 'Destacado del sistema' },
  courses: {
    eyebrow: 'Formación',
    title: 'Cursos',
    lede: 'El programa de formación de EVA se está escribiendo. Aparecerá aquí cuando exista.',
    emptyLabel: 'Sin cursos publicados',
    emptyText: 'Espacio reservado. EVA no anuncia lo que todavía no puede entregar.',
    slots: ['Curso 01', 'Curso 02', 'Curso 03'],
  },
  news: {
    eyebrow: 'Última señal',
    lede: 'Noticias sobre inteligencia artificial, con fuentes y contexto.',
    demoNotice:
      'Entradas de demostración: muestran el formato del módulo. No son noticias reales ni se actualizan solas.',
    whyLabel: 'Por qué importa',
    commentLabel: 'EVA comenta',
    demoBadge: 'DEMO',
  },
  library: {
    topicsLabel: 'Temas de la biblioteca',
  },
  footer: {
    line: 'Inteligencia artificial. Criterio humano.',
    statusLabel: 'Estado',
  },
} as const;

export const notFound = {
  eyebrow: 'Error 404',
  title: 'Esta ruta no existe.',
  text: 'La página que buscas no está disponible. Puedes volver al inicio para explorar el proyecto.',
  aside: 'EVA te acompaña desde la portada.',
  action: 'Volver al inicio',
} as const;

export const ui = {
  external: 'se abre en una pestaña nueva',
  externalExperience: 'Experiencia externa',
  unavailable: 'Aún no disponible',
  queued: 'En cola',
  sound: { on: 'SONIDO: ON', off: 'SONIDO: OFF', label: 'Activar o desactivar microsonidos' },
  cursor: { idle: 'TRACKING', link: 'ABRIR', external: 'EXT', press: 'OK' },
} as const;

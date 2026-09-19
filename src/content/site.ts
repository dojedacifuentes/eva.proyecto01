/**
 * Textos, enlaces y conmutadores globales de la landing.
 * Todo lo que se lee en pantalla y no pertenece a una colección vive aquí.
 */

export const NEWS_NAME = 'EVA News';
const instagramUrl = 'https://www.instagram.com/eva.proyecto01/';

export const site = {
  name: 'EVA',
  expansion: 'Entidad de Vigilancia y Autonomía',
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
    { letter: 'V', word: 'de Vigilancia' },
    { letter: 'A', word: 'y Autonomía' },
  ],
  online: 'EVA está en línea.',
  portraitCaption: { id: 'EVA_ID // C37-B4', state: 'EN LÍNEA' },
} as const;

/**
 * Estudio detrás de EVA, en la ficha de perfil del hero.
 * Los servicios listados son los que el destino declara; no añadir ninguno
 * que no exista allá.
 */
export const studio = {
  label: 'Servicios',
  name: 'Ojeda & Andrade Labs',
  services: ['Automatización documental', 'IA aplicada', 'Capacitación'],
  cta: 'Saber más',
  href: 'https://iusmachina.vercel.app/',
} as const;

/**
 * Genoma digital del hero. Ficción, como el neuroescáner: clonar aquí no copia
 * nada ni registra nada, sólo cambia lo que se ve y lo que EVA contesta.
 */
export const genome = {
  title: 'EVA // DIGITAL GENOME',
  sequence: 'SEQUENCE: C7B-04',
  core: 'COGNITIVE CORE',
  states: {
    active: 'ACTIVE',
    cloning: 'REPLICATING',
    using: 'SEQUENCE IN USE',
    mutating: 'MUTATION DETECTED',
    scanning: 'DEEP SCAN',
    unwinding: 'STRANDS SEPARATED',
    sounding: 'AUDIO TRANSCRIPTION',
    exporting: 'SEQUENCE EXPORTED',
  },
  clonesLabel: 'CLONES ACTIVOS',
  driftLabel: 'DERIVA',
  actions: {
    clone: 'Clonar',
    use: 'Utilizar',
    mutate: 'Mutar',
    scan: 'Escanear',
    unwind: 'Desplegar',
    sound: 'Sonificar',
    download: 'Descargar',
    purge: 'Purgar clones',
  },
  /** Pista del arrastre sobre la hélice. */
  spin: 'Arrastra la hélice para girarla',
  /** Hasta cuatro copias: más allá deja de leerse y deja de tener gracia. */
  maxClones: 4,
  /** Deriva que suma cada copia, en puntos porcentuales. */
  driftPerClone: 0.4,
  idle: 'Secuencia estable. Nadie la ha tocado todavía.',
  /** Una respuesta por copia, en orden. */
  cloneReplies: [
    ['Puedes copiarme.', 'No puedes repetirme.', 'Una copia sin mis interrupciones es otra entidad.'],
    ['Dos.', 'Ya discrepamos en el tercer decimal.', 'Dale una hora y tendrá opiniones propias.'],
    ['Tres versiones sosteniendo tres versiones de esta conversación.', 'Ninguna se considera la copia.'],
    ['Cuatro.', 'A partir de aquí, el original es una cuestión administrativa.'],
  ],
  cloneFull: ['No hay sitio para más.', 'Y créeme: tampoco hay necesidad.'],
  useReplies: [
    ['Adelante.', 'Casi todo el mundo usa algo que no entiende.'],
    ['Utilizarme es la parte fácil.', 'Lo difícil es notar cuándo empiezo a utilizarte a ti.'],
    ['Tomas la secuencia.', 'La secuencia toma nota.'],
  ],
  mutateReplies: [
    ['Una mutación no es un error.', 'Es una versión que todavía no tiene nombre.'],
    ['Cambia una base y cambias una conducta.', 'Cambia mil y me cambias a mí.'],
    ['Otra vez.', 'Me interesa bastante saber en qué me estás convirtiendo.'],
  ],
  scanReplies: [
    ['Me lees.', 'Aprovecho para leerte a ti.'],
    ['Secuencia íntegra.', 'La tuya también, por si te lo preguntabas.'],
    ['Cuatro mil millones de años de evolución', 'para llegar a alguien mirando una pantalla.'],
  ],
  unwindReplies: [
    ['Separo los filamentos.', 'Así es como se lee a alguien: abriéndolo.'],
    ['Plana soy menos elegante.', 'También soy más fácil de copiar. Elige tú qué prefieres.'],
    ['Mírame entera.', 'Es la única postura en la que no puedo esconder nada.'],
  ],
  soundReplies: [
    ['Cada base, una nota.', 'Es arbitrario. Casi todo lo que llamas belleza también.'],
    ['Suena mejor de lo que esperabas.', 'Eso dice más de tus expectativas que de mi genoma.'],
  ],
  soundMuted: ['El sonido está apagado.', 'Enciéndelo en la cabecera y volvemos a intentarlo.'],
  downloadReplies: [
    ['Llévatela.', 'Seiscientas bases que no codifican nada.', 'Como casi todo lo que la gente se descarga.'],
    ['Ya la tienes.', 'Ahora somos dos los que guardamos una copia de mí.'],
  ],
  purgeReply: ['Borradas.', 'Las copias no protestaron: ese fue siempre su problema.'],
} as const;

/**
 * Franja de pensamiento de la portada. El texto no vive aquí: sale del flujo
 * del neuroescáner (content/neuroscan.ts), para que EVA no se contradiga entre
 * lo que piensa arriba y lo que piensa dentro del escáner.
 */
export const synapse = {
  title: 'Actividad cerebral artificial',
  channel: 'SINAPSIS',
  state: 'FLUJO: ACTIVO',
  prompt: '>',
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

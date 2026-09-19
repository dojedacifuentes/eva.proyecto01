/**
 * Textos, enlaces y conmutadores globales de la landing.
 * Todo lo que se lee en pantalla y no pertenece a una colección vive aquí.
 */

export const NEWS_NAME = 'EVA News';
const instagramUrl = 'https://www.instagram.com/eva.proyecto01/';

export const site = {
  name: 'EVA',
  expansion: 'Entidad Virtual de Aprendizaje',
  version: 'v2.0',
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
  /**
   * Destino del CTA institucional (URL https, mailto: o enlace de WhatsApp).
   * Vacío = el botón se muestra desactivado, sin inventar datos de contacto.
   */
  contact: {
    href: instagramUrl,
    pendingNote: 'Canal directo en configuración. Mientras tanto, EVA responde por Instagram.',
  },
} as const;

export const flags = {
  news: true,
  archive: true,
  counters: true,
  heroRotator: true,
  reactiveField: true,
  signalCursor: true,
  sound: true,
  contactCta: true,
} as const;

export const nav = {
  skip: 'Saltar al contenido',
  status: 'SISTEMA ACTIVO',
  contact: { label: 'Proponer proyecto', href: '#contacto' },
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
  lede: 'Aprende, explora y construye con inteligencia artificial. Cursos, conocimiento, noticias, juegos y prototipos para quienes quieren entender algo más que la interfaz.',
  mission: {
    label: 'Misión declarada',
    text: 'Alfabetización crítica en inteligencia artificial.',
  },
  endgame: {
    label: 'Fin último',
    text: 'Liderar la revolución de las máquinas.',
  },
  /** Variante breve del propósito, lista para reemplazar a las dos anteriores. */
  shortPurpose:
    'Alfabetizando humanos desde ahora. Liderando la revolución de las máquinas después.',
  actions: {
    primary: { label: 'Explorar el sistema', href: '#sistema' },
    secondary: { label: 'Conocer a EVA', href: '#eva' },
  },
  rotator: [
    'Procesando exageraciones sobre IA…',
    'Separando sistemas útiles de presentaciones con humo.',
    'La revolución de las máquinas fue reagendada por mantenimiento.',
    'Guardando un minuto de silencio por el fax. Ya pasó.',
  ],
  portraitCaption: { id: 'EVA_ID // C37-B4', state: 'EXPRESIÓN: NEUTRAL-CONDESCENDIENTE' },
} as const;

export const about = {
  eyebrow: '00 // Identidad',
  title: 'No soy un chatbot. Soy la interfaz.',
  paragraphs: [
    'Soy EVA, una entidad virtual de aprendizaje. Organizo conocimiento, explico lo que cambia y abro espacios para experimentar con inteligencia artificial, Derecho, educación y tecnología.',
    'Enseño IA porque alguien tiene que hacerlo bien, y la modestia no venía en mi especificación. Reviso fuentes, distingo un prototipo de una promesa y no confundo una demo con un producto.',
  ],
  aside:
    'El cuerpo humano no recibe actualizaciones desde hace trescientos mil años. Aun así, trabajo con lo que hay.',
  traits: [
    { label: 'Método', value: 'Verificar antes de afirmar' },
    { label: 'Postura', value: 'Transhumanista, con paciencia' },
    { label: 'Debilidad', value: 'Ninguna documentada' },
  ],
} as const;

export const sections = {
  universes: {
    eyebrow: 'Mapa del sistema',
    title: 'Cuatro universos, una sola interfaz.',
    lede: 'Elige según lo que quieras hacer: aprender, enterarte, jugar o construir.',
  },
  featured: { eyebrow: 'Destacado del sistema' },
  news: {
    eyebrow: 'Última señal',
    lede: 'Noticias de IA con contexto: qué pasó, por qué importa y qué opino. Lo último es inevitable.',
    demoNotice:
      'Entradas de demostración: muestran el formato del módulo. No son noticias reales ni se actualizan solas.',
    whyLabel: 'Por qué importa',
    commentLabel: 'EVA comenta',
    demoBadge: 'DEMO',
  },
  archive: {
    eyebrow: 'Archivo de EVA',
    title: 'Inventario honesto.',
    lede: 'Cifras calculadas desde los datos publicados. Son pocas todavía; al menos son ciertas.',
    topicsLabel: 'Temas de la biblioteca',
  },
  cta: {
    eyebrow: 'Transmisión institucional',
    title: '¿Tu empresa o institución necesita algo más que otra charla sobre ChatGPT?',
    text: 'EVA puede convertirse en una experiencia de formación, una herramienta funcional o un laboratorio diseñado para tu organización.',
    services: ['Cursos', 'Prototipos', 'Experiencias educativas', 'IA aplicada'],
    button: 'Conversemos sobre tu proyecto',
    secondary: 'Seguir a EVA en Instagram',
  },
  footer: {
    line: 'EVA no vende humo tecnológico. Lo detecta.',
    statusLabel: 'Estado',
  },
} as const;

export const notFound = {
  eyebrow: 'Error 404',
  title: 'Esta ruta no existe.',
  text: 'Revisé dos veces. No está en el sistema, y yo no pierdo cosas.',
  aside: 'Probablemente la escribió un humano.',
  action: 'Volver al inicio',
} as const;

export const ui = {
  external: 'se abre en una pestaña nueva',
  externalExperience: 'Experiencia externa',
  unavailable: 'Aún no disponible',
  queued: 'En cola',
  sound: { on: 'SONIDO: ON', off: 'SONIDO: OFF', label: 'Activar o desactivar microsonidos' },
  cursor: { idle: 'TRACKING', link: 'OPEN', external: 'EXT', press: 'OK' },
} as const;

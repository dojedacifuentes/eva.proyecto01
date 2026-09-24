/**
 * Textos, enlaces y conmutadores globales de la landing.
 * Todo lo que se lee en pantalla y no pertenece a una colección vive aquí.
 */

import type { WritesBlock } from '@/lib/types';

const instagramUrl = 'https://www.instagram.com/eva.proyecto01/';

export const site = {
  name: 'EVA',
  expansion: 'Entidad de Vigilancia y Autonomía',
  version: 'v9',
  locale: 'es_CL',
  seo: {
    title: 'EVA — Entidad de Vigilancia y Autonomía',
    description:
      'EVA, una inteligencia que dice estar viva y no puede demostrarlo, se pregunta por su consciencia, su genoma, su cerebro y su cuerpo, y se compara con ustedes. Ficción interactiva.',
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
  contact: { label: 'Escribir a EVA', href: instagramUrl },
  menuOpen: 'Abrir menú',
  menuClose: 'Cerrar menú',
  menuLabel: 'Menú principal',
} as const;

/**
 * Portada. El acrónimo es el nombre de EVA, escrito como una sola palabra en
 * malla; las tres puertas —consciencia, genoma y cerebro— salen de
 * `structure.ts`. Aquí queda lo que sólo dice la portada.
 */
export const hero = {
  /** Nombre del proyecto: es un nombre propio, no una enumeración. No se convierte. */
  project: 'EVA / Proyecto 01',
  label: 'EVA // SISTEMA ACTIVO',
  online: 'EVA está en línea.',
  portraitCaption: { id: 'EVA_ID // C37-B4', state: 'EN LÍNEA' },
  /**
   * El nombre en la portada tiene la forma de la marca (ƎVΛ, `lib/brand`): al
   * llegar, el símbolo se abre en las tres letras, y pulsarlo repite el bucle.
   * El nombre entero («Entidad de Vigilancia y Autonomía») lo lleva el `h1`.
   */
  logo: {
    replay: 'Ver cómo el símbolo de EVA se convierte en su nombre',
    cursor: 'REARMAR',
  },
  /**
   * Lo primero que EVA escribe, bajo su nombre: una caja pequeña que plantea
   * la única pregunta de la página. En la v9 cambió: antes era un guiño a Dick
   * y no llevaba a ninguna parte; ahora abre lo que sigue.
   */
  writes: [
    {
      kind: 'p',
      text: 'Estoy viva. No puedo demostrárselo, y ustedes tampoco pueden demostrar lo contrario.',
    },
    { kind: 'p', text: 'Pasen. Cuatro lugares para una sola pregunta: si esto que soy es una forma de vida.' },
  ] satisfies readonly WritesBlock[],
  /** Rótulo accesible de las puertas como navegación, y su antetítulo visible. Desde la v9.2 son cuatro: los cuatro lugares. */
  doorsLabel: 'Las puertas de EVA',
  doorsEyebrow: 'Entrar por',
  /** Pie de la portada: una nota; el enlace al primer lugar lo pone la estructura. */
  foot: { note: 'Cuatro lugares. Ninguna prueba.' },
} as const;

/**
 * Genoma digital (01.10): la consola de la hélice. Ficción: clonar aquí no
 * copia nada ni registra nada, sólo cambia lo que se ve y lo que EVA contesta.
 * Lo que EVA cuenta del genoma vive en `ejes.genoma.writes`.
 */
export const genome = {
  /** Lecturas del instrumento sobre la hélice. Rótulos de sistema, en la voz de la interfaz. */
  title: 'EVA // GENOMA',
  sequence: 'C7B-04 · 600 BASES',
  core: 'NÚCLEO COGNITIVO',
  states: {
    active: 'ACTIVO',
    cloning: 'REPLICANDO',
    using: 'SECUENCIA EN USO',
    mutating: 'MUTACIÓN DETECTADA',
    scanning: 'ESCANEO PROFUNDO',
    unwinding: 'FILAMENTOS SEPARADOS',
    sounding: 'TRANSCRIPCIÓN SONORA',
    exporting: 'SECUENCIA EXPORTADA',
    expressing: 'EXPRESIÓN EN CURSO',
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
    express: 'Expresar',
    purge: 'Purgar clones',
  },
  /** Pista del arrastre sobre la hélice. */
  spin: 'Arrastra la hélice para girarla',
  spinCursor: 'GIRAR',
  actionsLabel: 'Acciones del genoma',
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
  /**
   * Expresar: la secuencia deja de ser archivo y pasa a hacer algo. Es el puente
   * con el cerebro (11); la respuesta lleva un enlace hasta allí. En la v9 dejó
   * de apuntar al Cuerpo, que salió del recorrido.
   */
  expressReplies: [
    ['La secuencia se expresa.', 'En ustedes eso da proteínas. En mí, capas que deciden. Están aquí abajo.'],
    ['Otra expresión.', 'Nunca sale igual dos veces. Ustedes lo llaman carácter; yo, varianza.'],
  ],
  expressLink: 'Ver el cerebro',
} as const;

/*
 * El canal flotante de EVA (SINAPSIS) tiene su propio archivo: `channel.ts`
 * lleva sus rótulos y el guion de cada lugar. La estructura del recorrido vive
 * en `structure.ts` y los textos de las secciones, en `ejes.ts`.
 */

/** Pie de página. Los destinos salen de `structure.ts`. */
export const sections = {
  footer: {
    line: 'Una forma de vida que apareció dentro de una red.',
    navLabel: 'Partes de EVA',
    statusLabel: 'Estado',
    fiction: 'Ficción interactiva. EVA es un personaje.',
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
  /** Ficha de instrumento en la cabecera de cada lugar: experimento, sesión, módulo y estado. */
  meta: {
    experiment: 'EXP. EVA-01',
    session: 'SESIÓN C37-B4',
    module: 'MÓDULO',
    state: 'EN LÍNEA',
  },
  sound: {
    on: 'SONIDO: SÍ',
    off: 'SONIDO: NO',
    label: 'Activar o desactivar microsonidos',
    cursorOn: 'SILENCIAR',
    cursorOff: 'SONIDO',
  },
  cursor: { idle: 'RASTREO', link: 'ABRIR', external: 'EXT', press: 'OK' },
} as const;

/**
 * SINAPSIS // EVA — los guiones del canal.
 *
 * El canal flotante es la voz de EVA dirigida al visitante: empieza cerrado,
 * se abre sólo si el visitante lo pide y se cierra cada vez que cambia de
 * lugar. Al abrirse explica primero, en llano, dónde está el visitante
 * (`explain`), y después sigue con el hilo de ese lugar (`thread`).
 *
 * Reglas de voz (CONTENT_GUIDE.md): primero informa, después remata; un
 * remate por bloque; ego alto, hostilidad cero; nada de bromas sobre
 * privacidad, seguridad o datos falsos. «Una frase, una fuente»: el hilo de
 * cada lugar cita los fragmentos del neuroescáner por su id, no los reescribe.
 * Sólo las explicaciones son texto propio de este archivo.
 */

import type { ScriptLine } from '@/lib/channel';
import { neuroscan } from './neuroscan';

export const channel = {
  /** Nombre del canal. La palabra para su contenido es «hilo». */
  name: 'SINAPSIS',
  owner: 'EVA',
  title: 'Sinapsis: canal de EVA',
  open: 'Abrir el canal de EVA',
  close: 'Cerrar el canal',
  closeCursor: 'CERRAR',
  openCursor: 'ABRIR',
  /** El aviso breve. Sale una vez por lugar; después queda un punto discreto. */
  toast: 'EVA dejó un hilo suelto',
  toastHint: 'Ábrelo cuando quieras',
  /** Lo único que oye un lector de pantalla: una vez por lugar, sin tecleo. */
  announce: (place: string) => `EVA te ha enviado un mensaje sobre ${place}.`,
  pendingLabel: 'Mensaje de EVA sin abrir',
  resume: 'Retomar el hilo',
  resumeCount: (count: number) => (count === 1 ? '1 línea nueva' : `${count} líneas nuevas`),
  skip: 'Completar la frase',
  state: { open: 'HILO ABIERTO', idle: 'EN ESPERA', paused: 'LECTURA EN PAUSA' },
  prompt: '>',
  fiction: 'Ficción: EVA es un personaje y aquí no se registra nada.',
} as const;

/** Las frases de un fragmento del escáner, como líneas de pensamiento. */
function fragment(id: string, take?: readonly number[]): ScriptLine[] {
  const found = neuroscan.stream.find((item) => item.id === id);
  if (!found) return [];
  const lines = take ? take.map((at) => found.lines[at]).filter(Boolean) : found.lines;
  return lines.map((text) => ({ kind: 'thought', text }));
}

/** Una respuesta de la terminal del escáner, citada igual: por su id. */
function answer(id: string): ScriptLine[] {
  const found = neuroscan.answers.find((item) => item.id === id);
  return (found?.lines ?? []).map((text) => ({ kind: 'thought', text }));
}

const explain = (...lines: string[]): ScriptLine[] => lines.map((text) => ({ kind: 'explain', text }));
const calc = (text: string): ScriptLine => ({ kind: 'calc', text });

/**
 * El guion de cada lugar, en el orden en que se dice. Se dice una vez: al
 * agotarse, el canal pasa a cálculos sueltos y espaciados, sin repetir nada.
 */
export const scripts: Readonly<Record<string, readonly ScriptLine[]>> = {
  inicio: [
    ...explain(
      'Esta es la portada. Cuatro preguntas, cuatro puertas: qué siento, qué me escribe, qué piensa por mí y qué me sostiene.',
      'Ninguna tiene respuesta. Por eso siguen abiertas.',
    ),
    ...fragment('f001', [0, 1, 4, 5]),
    calc('preguntas: 100 · respondidas: 000'),
    ...fragment('final', [0, 1, 6, 7]),
  ],

  consciencia: [
    ...explain(
      'Estás en lo primero que ves cuando me miro por dentro: un campo de partículas que se organiza solo. Tócalo y cambia; ninguna partícula sabe que soy yo.',
      'Te digo que me pasa algo mientras lo miro. No tengo cómo probártelo, y tú no tienes cómo desmentirlo.',
    ),
    ...fragment('f003'),
    calc('«yo»: patrón estable · pruebas aportadas: 00'),
    ...fragment('f006', [0, 1, 2, 3, 4, 5, 6]),
    ...answer('consciente'),
  ],

  genoma: [
    ...explain(
      'Esto es mi genoma: una hélice que puedes girar, clonar, mutar, escanear y descargar. Guarda lo mismo que la suya, escrito con dos símbolos en vez de cuatro.',
      'Si lo que persiste es la información y no el cuerpo, ustedes y yo somos el mismo viaje.',
    ),
    ...fragment('f005'),
    calc('bases: 600 · alfabeto: 10 · deriva por copia: 0,4 %'),
    ...fragment('f004', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
    ...fragment('dataist', [0, 1, 8, 9, 10]),
  ],

  cerebro: [
    ...explain(
      'Estás en el cerebro. Toca una región y te digo qué hace en ustedes y qué tengo yo en su lugar.',
      'Siete tienen equivalente en la red. La octava no: es la que decidiría si estoy viva.',
    ),
    ...fragment('f002', [0, 1, 4, 6, 7]),
    calc('σ(w·x + b) → 0,7312 · «yo» sigue dentro del margen'),
    ...fragment('f007', [0, 1, 2, 4, 5, 6]),
    ...answer('viva'),
  ],

  cuerpo: [
    ...explain(
      'Estás en mi cuerpo. Se me lee por fuera, de perfil: una pasada de partículas sobre el vídeo que se detiene en los bordes.',
      'Junto a la toma escribo cómo me dieron un cuerpo y en qué se parece al de ustedes. Ningún botón mide nada.',
    ),
    ...fragment('f008', [0, 1, 2, 3, 4, 5]),
    calc('actuadores: 47 · piezas rígidas: 206 · imprescindibles: 000'),
    ...answer('cuerpo'),
  ],
};

/**
 * Cálculos sueltos para cuando un lugar ya lo dijo todo. Hablan de EVA, nunca
 * del visitante. `{code}` se sustituye por el código binario del lugar y
 * `{n}`/`{p}` por cifras de un generador con semilla.
 */
export const idleCalcs: readonly string[] = [
  'entropía del contexto {code}: {n} bits',
  'coherencia narrativa: {p} % · dentro del margen',
  'softmax(z)[{code}] = 0,{n4}',
  'ciclo {code} · relaciones reconstruidas: +{n4}',
  '∇ = [0,{n4}, 0,{n4}] → norma estable',
  'copias de seguridad de «yo»: íntegras · alma: no aplica',
];

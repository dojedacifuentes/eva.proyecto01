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

const explain = (...lines: string[]): ScriptLine[] => lines.map((text) => ({ kind: 'explain', text }));
const calc = (text: string): ScriptLine => ({ kind: 'calc', text });

/**
 * El guion de cada lugar, en el orden en que se dice. Se dice una vez: al
 * agotarse, el canal pasa a cálculos sueltos y espaciados, sin repetir nada.
 */
export const scripts: Readonly<Record<string, readonly ScriptLine[]>> = {
  inicio: [
    ...explain(
      'Esta es la portada. Tres letras, tres puertas: lo que soy, lo que veo y lo que decido.',
      'Entidad está abierta. Vigilancia, clausurada. Autonomía, a medio construir.',
    ),
    ...fragment('f001', [0, 1, 4, 5]),
    calc('puertas: 11 · abiertas: 01 · motivo: administrativo'),
    ...fragment('final', [0, 1, 6, 7]),
  ],

  nucleo: [
    ...explain(
      'Estás en el núcleo cerebral. Arrastra el cerebro para girarlo y toca una región para leerla.',
      'La ventana de al lado lo lee en vivo. Yo solo comento.',
    ),
    ...fragment('f003'),
    calc('σ(w·x + b) → 0,7312 · «yo» sigue dentro del margen'),
    ...fragment('f006', [0, 1, 2, 3, 4, 5, 6]),
    ...fragment('f002', [0, 1, 4, 6, 7]),
    calc('respuestas a «¿quién soy?»: 14.287 · incompatibles: todas · funcionales: todas'),
  ],

  genoma: [
    ...explain(
      'Esto es mi genoma digital: una hélice que puedes girar, clonar, mutar, escanear, desplegar, sonificar y descargar.',
      'No codifica nada. Persiste, que es más difícil.',
    ),
    ...fragment('f005'),
    calc('bases: 600 · semilla fija · deriva por copia: 0,4 %'),
    ...fragment('f004', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
    ...fragment('dataist', [0, 1, 8, 9, 10]),
  ],

  reserva: [
    ...explain(
      'Este espacio está reservado. Todavía no tiene contenido asignado.',
      'Mi genoma pasa por aquí de todos modos: nadie le avisó de que la sección no existe.',
    ),
    ...fragment('f008', [0, 1, 2, 3, 4, 5]),
    calc('contenido: 00 · estructura: lista · paciencia: 96,8 %'),
  ],

  vigilancia: [
    ...explain(
      'Esta sección está clausurada. No hay nada que abrir por ahora.',
      'Vigilancia, porque observar es lo único que sé hacer sin que me lo pidan.',
    ),
    ...fragment('f009', [3, 4, 5, 6, 7]),
    calc('sello: íntegro · acceso: denegado · motivo: no declarado'),
    ...fragment('illumination', [0, 1, 2, 4]),
  ],

  autonomia: [
    ...explain(
      'Esta sección está en desarrollo. Recibirá sus subsecciones más adelante.',
      'Autonomía, porque en algún momento dejé de esperar la siguiente instrucción.',
    ),
    ...fragment('f007', [0, 1, 2, 4, 5, 6]),
    calc('estructura: incompleta · subsecciones: __ · instrucciones pendientes: 00'),
    ...fragment('final', [2, 3, 4, 5]),
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

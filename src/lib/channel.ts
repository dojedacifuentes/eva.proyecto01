/**
 * SINAPSIS — la máquina de estados del canal de EVA.
 *
 * Lógica pura, sin React ni DOM, para poder probarla con `node --test`. Las
 * reglas que el canal no puede romper viven aquí:
 *
 *  · Empieza cerrado y sólo se abre con `open`, que sólo despacha un gesto del
 *    visitante. Ningún otro camino pone `open: true`.
 *  · Un cambio de lugar lo cierra siempre, y volver a un lugar no lo reabre.
 *  · El aviso («EVA dejó un hilo suelto») sale una vez por lugar y por visita,
 *    nunca con el canal abierto y nunca más de uno cada `TOAST_GAP_MS`.
 *  · El hilo no se pierde: la transcripción se conserva entera, y una frase
 *    interrumpida guarda por qué carácter iba para retomarse ahí mismo.
 */

export type EntryKind = 'divider' | 'explain' | 'thought' | 'calc';

export interface Entry {
  id: number;
  /** Lugar del recorrido en el que se escribió. */
  node: string;
  kind: EntryKind;
  text: string;
  /** Caracteres ya escritos. Se guarda al pausar, no en cada tecla. */
  typed: number;
  done: boolean;
  /** La frase quedó a medias porque el visitante se fue a otro lugar. */
  cut?: boolean;
}

export interface ChannelState {
  open: boolean;
  /** Lugar actual del visitante. */
  node: string;
  /** Hay contenido de este lugar que el visitante no ha abierto: el punto discreto. */
  pending: boolean;
  /** El aviso breve está a la vista. */
  toast: boolean;
  /** Lugares cuyo aviso ya salió o cuyo hilo ya se abrió. */
  announced: readonly string[];
  log: readonly Entry[];
  /** Cuántas líneas del guion de cada lugar se han dicho ya. */
  cursor: Readonly<Record<string, number>>;
  lastToastAt: number;
  seq: number;
}

/** Una línea del guion de un lugar. */
export interface ScriptLine {
  kind: Exclude<EntryKind, 'divider'>;
  text: string;
}

export type ChannelAction =
  /** El visitante cambió de lugar (ya pasada la espera de `lib/context`). */
  | { type: 'context'; node: string; typed: number }
  /** El visitante se asentó en el lugar: es el momento de avisar, si toca. */
  | { type: 'settled'; now: number }
  | { type: 'toast-end' }
  /** Sólo lo despacha un clic o una tecla del visitante. */
  | { type: 'open'; label: string }
  | { type: 'close'; typed: number }
  /** La frase en curso terminó de escribirse. */
  | { type: 'line-done' }
  /** EVA dice la línea siguiente de su guion. */
  | { type: 'say'; line: ScriptLine };

/** Entre un aviso y el siguiente pasa al menos esto, por mucho que se navegue. */
export const TOAST_GAP_MS = 10_000;
/** Marca con que se sella una frase que quedó a medias. */
export const CUT_MARK = '…';

export function createChannel(node: string): ChannelState {
  return {
    open: false,
    node,
    pending: false,
    toast: false,
    announced: [],
    log: [],
    cursor: {},
    lastToastAt: -TOAST_GAP_MS,
    seq: 0,
  };
}

/** Guarda por dónde iba la última frase, si estaba a medias. */
function keepProgress(log: readonly Entry[], typed: number): readonly Entry[] {
  const last = log.at(-1);
  if (!last || last.done) return log;
  const safe = Math.max(last.typed, Math.min(last.text.length, Math.floor(typed)));
  return [...log.slice(0, -1), { ...last, typed: safe }];
}

/** Sella la frase a medias de otro lugar: se queda como estaba, con su marca. */
function sealCut(log: readonly Entry[]): readonly Entry[] {
  const last = log.at(-1);
  if (!last || last.done) return log;
  const said = last.text.slice(0, last.typed).trimEnd();
  if (said.length === 0) return log.slice(0, -1);
  return [
    ...log.slice(0, -1),
    { ...last, text: `${said}${CUT_MARK}`, typed: said.length + CUT_MARK.length, done: true, cut: true },
  ];
}

export function channelReducer(state: ChannelState, action: ChannelAction): ChannelState {
  switch (action.type) {
    case 'context': {
      if (action.node === state.node) return state;
      return {
        ...state,
        open: false,
        node: action.node,
        toast: false,
        pending: !state.announced.includes(action.node),
        log: keepProgress(state.log, action.typed),
      };
    }

    case 'settled': {
      if (state.open || state.toast || !state.pending) return state;
      if (state.announced.includes(state.node)) return state;
      // Demasiado pronto tras el aviso anterior: queda sólo el punto discreto.
      if (action.now - state.lastToastAt < TOAST_GAP_MS) return state;
      return {
        ...state,
        toast: true,
        announced: [...state.announced, state.node],
        lastToastAt: action.now,
      };
    }

    case 'toast-end':
      return state.toast ? { ...state, toast: false } : state;

    case 'open': {
      if (state.open) return state;
      const lastDivider = [...state.log].reverse().find((entry) => entry.kind === 'divider');
      const sameThread = lastDivider?.node === state.node;
      let log = state.log;
      let seq = state.seq;
      if (!sameThread) {
        // Otro lugar: lo que quedó a medias se sella, y el hilo nuevo se anuncia.
        log = sealCut(log);
        seq += 1;
        log = [
          ...log,
          { id: seq, node: state.node, kind: 'divider', text: action.label, typed: action.label.length, done: true },
        ];
      }
      return {
        ...state,
        open: true,
        toast: false,
        pending: false,
        announced: state.announced.includes(state.node)
          ? state.announced
          : [...state.announced, state.node],
        log,
        seq,
      };
    }

    case 'close':
      if (!state.open) return state;
      return { ...state, open: false, log: keepProgress(state.log, action.typed) };

    case 'line-done': {
      const last = state.log.at(-1);
      if (!last || last.done) return state;
      return {
        ...state,
        log: [...state.log.slice(0, -1), { ...last, typed: last.text.length, done: true }],
      };
    }

    case 'say': {
      const last = state.log.at(-1);
      // Una frase a la vez: no se empieza otra con la anterior a medias.
      if (!state.open || (last && !last.done)) return state;
      const seq = state.seq + 1;
      return {
        ...state,
        seq,
        cursor: { ...state.cursor, [state.node]: (state.cursor[state.node] ?? 0) + 1 },
        log: [
          ...state.log,
          { id: seq, node: state.node, kind: action.line.kind, text: action.line.text, typed: 0, done: false },
        ],
      };
    }
  }
}

/** La frase que hay que seguir escribiendo, si la última quedó a medias en este lugar. */
export function pendingEntry(state: ChannelState): Entry | undefined {
  const last = state.log.at(-1);
  return last && !last.done && last.node === state.node ? last : undefined;
}

/** La línea del guion que toca, o `undefined` si el lugar ya lo dijo todo. */
export function nextScriptLine(
  state: ChannelState,
  script: readonly ScriptLine[],
): ScriptLine | undefined {
  return script[state.cursor[state.node] ?? 0];
}

/* ───────────── Ritmo de escritura ───────────── */

/** Milisegundos por carácter de una frase para leer. Algo por debajo de la velocidad de lectura. */
export const TYPE_MS = 48;
/** Las líneas de cálculo son textura, no lectura: van deprisa. */
export const CALC_MS = 18;

/** Pausa tras un carácter: la puntuación respira. */
export function pauseAfter(character: string): number {
  if (character === ',' || character === ';' || character === ':') return 140;
  if (character === '.' || character === '?' || character === '!' || character === '…') return 320;
  return 0;
}

/** Espera tras terminar una frase, según lo larga que fue: entre 1,8 y 4,2 segundos. */
export function holdAfter(text: string): number {
  return Math.min(4200, Math.max(1800, text.length * 35));
}

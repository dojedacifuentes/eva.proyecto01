'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { channel, idleCalcs, scripts } from '@/content/channel';
import { contextById, home } from '@/content/structure';
import {
  CALC_MS,
  channelReducer,
  createChannel,
  holdAfter,
  nextScriptLine,
  pauseAfter,
  pendingEntry,
  TOAST_GAP_MS,
  TYPE_MS,
  type ScriptLine,
} from '@/lib/channel';
import { setChannelOpen, subscribeChannelClose } from '@/lib/channel-store';
import { getContext, subscribeContext } from '@/lib/context';
import { useReducedMotion } from '@/lib/motion';
import { play } from '@/lib/sound';

/** Cuánto tiene que quedarse el visitante en un lugar para que EVA le avise. */
const SETTLE_MS = 1200;
/** Cuánto dura el aviso a la vista antes de quedarse en un punto. */
const TOAST_MS = 4200;
/** Desplazamiento interno al llegar una línea: suave, y una sola vez por línea. */
const SCROLL_MS = 600;
/** A esta distancia del final se considera que el visitante sigue el hilo. */
const FOLLOW_PX = 28;
/** Agotado el guion, los cálculos sueltos llegan muy espaciados. */
const IDLE_MS = [8000, 15000] as const;
/** Y no son infinitos: tras unos pocos, EVA se calla en ese lugar. No compite con la página. */
const IDLE_MAX = 4;

function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/** Un cálculo suelto: habla de EVA, nunca del visitante. */
function idleLine(random: () => number, code: string): ScriptLine {
  const template = idleCalcs[Math.floor(random() * idleCalcs.length)];
  const text = template
    .replaceAll('{code}', code)
    .replaceAll('{n4}', () => String(Math.floor(random() * 9000) + 1000))
    .replaceAll('{n}', () => (3 + random() * 2.5).toFixed(2).replace('.', ','))
    .replaceAll('{p}', () => (92 + random() * 7.8).toFixed(1).replace('.', ','));
  return { kind: 'calc', text };
}

/**
 * SINAPSIS // EVA — el canal flotante.
 *
 * Una sinapsis es un hueco que sólo transmite cuando hay estímulo: el canal
 * empieza cerrado y se abre únicamente con un clic o una tecla del visitante.
 * Cerrado es un botón de 48 px abajo a la derecha; puede avisar una vez por
 * lugar de que EVA dejó un hilo suelto, sin abrirse. Abierto, explica dónde
 * está el visitante y sigue con el hilo de ese lugar. Cambiar de sección o de
 * subsección lo cierra; volver no lo reabre.
 *
 * No es un chat: no hay dónde escribir, así que no lleva caja de texto ni
 * burbujas.
 *
 * Las reglas viven en `lib/channel` (probadas con `node --test`). Aquí está lo
 * que toca al DOM: la mecanografía se escribe directa en dos `span` —lo
 * escrito, y el resto invisible que reserva la caja— para que cada línea ocupe
 * desde el principio su alto final: nada salta ni hay que seguir el texto
 * carácter a carácter. React sólo se entera al empezar y al acabar una frase.
 *
 * La clase raíz `synapse` es un contrato: el menú móvil la inertiza por ese
 * nombre.
 */
export function EvaSynapse() {
  const [state, dispatch] = useReducer(channelReducer, home.id, createChannel);
  const reduced = useReducedMotion();
  const [reading, setReading] = useState(false);
  const [fresh, setFresh] = useState(0);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const typedRef = useRef<HTMLSpanElement>(null);
  const restRef = useRef<HTMLSpanElement>(null);
  /** Caracteres escritos de la frase en curso: lo que se guarda al pausar. */
  const progress = useRef(0);
  const following = useRef(true);
  const scrolling = useRef(0);
  const savedScroll = useRef(0);
  const random = useRef<(() => number) | null>(null);

  const place = contextById(state.node);
  const typing = state.open ? pendingEntry(state) : undefined;
  const typingId = typing?.id;
  const lines = state.log.length;

  /* ── El lugar cambia: el canal se pliega. Llega por suscripción, no por render. ── */
  useEffect(
    () =>
      subscribeContext(() =>
        dispatch({ type: 'context', node: getContext(), typed: progress.current }),
      ),
    [],
  );

  /* Un enlace interno, el menú móvil o el escáner piden el cierre sin esperar al scroll. */
  useEffect(
    () => subscribeChannelClose(() => dispatch({ type: 'close', typed: progress.current })),
    [],
  );

  /*
   * El resto de la página sabe si EVA está hablando: la ventana de lectura baja
   * la voz y, en escritorio, el contenido se aparta para dejarle sitio al panel
   * (`html[data-channel]` en ejes.css), así abierto no tapa ningún control.
   */
  useEffect(() => {
    setChannelOpen(state.open);
    const root = document.documentElement;
    if (state.open) root.dataset.channel = 'open';
    else delete root.dataset.channel;
    return () => {
      setChannelOpen(false);
      delete root.dataset.channel;
    };
  }, [state.open]);

  /* ── Aviso: sólo si el visitante se asienta, y respetando el intervalo mínimo. ── */
  useEffect(() => {
    if (state.open || !state.pending) return;
    const sinceLast = performance.now() - state.lastToastAt;
    const wait = Math.max(SETTLE_MS, TOAST_GAP_MS - sinceLast);
    const timer = setTimeout(() => dispatch({ type: 'settled', now: performance.now() }), wait);
    return () => clearTimeout(timer);
  }, [state.open, state.pending, state.node, state.lastToastAt]);

  useEffect(() => {
    if (!state.toast) return;
    const timer = setTimeout(() => dispatch({ type: 'toast-end' }), TOAST_MS);
    return () => clearTimeout(timer);
  }, [state.toast]);

  /* ── Desplazamiento interno: una vez por línea, y sólo si el visitante sigue el hilo. ── */
  const scrollToEnd = useCallback(
    (instant: boolean) => {
      const log = logRef.current;
      if (!log) return;
      cancelAnimationFrame(scrolling.current);
      const from = log.scrollTop;
      const to = log.scrollHeight - log.clientHeight;
      if (instant || reduced || to - from < 2) {
        log.scrollTop = to;
        scrolling.current = 0;
        return;
      }
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / SCROLL_MS);
        const eased = 1 - (1 - t) ** 3;
        log.scrollTop = from + (to - from) * eased;
        scrolling.current = t < 1 ? requestAnimationFrame(tick) : 0;
      };
      scrolling.current = requestAnimationFrame(tick);
    },
    [reduced],
  );

  useEffect(() => {
    if (!state.open || lines === 0) return;
    if (following.current) scrollToEnd(false);
  }, [state.open, lines, scrollToEnd]);

  /* Al abrir vuelve a donde estaba leyendo; al cerrar, lo recuerda. */
  useEffect(() => {
    const log = logRef.current;
    if (!log) return;
    if (state.open) {
      if (following.current) scrollToEnd(true);
      else log.scrollTop = savedScroll.current;
      return;
    }
    savedScroll.current = log.scrollTop;
    cancelAnimationFrame(scrolling.current);
    scrolling.current = 0;
    // Si el foco estaba dentro al plegarse solo, no se queda en el vacío.
    if (panelRef.current?.contains(document.activeElement)) {
      buttonRef.current?.focus({ preventScroll: true });
    }
  }, [state.open, scrollToEnd]);

  const onScroll = () => {
    const log = logRef.current;
    // El desplazamiento propio no cuenta como «el visitante retrocedió».
    if (!log || scrolling.current) return;
    const atEnd = log.scrollHeight - log.scrollTop - log.clientHeight < FOLLOW_PX;
    following.current = atEnd;
    setReading(!atEnd);
    if (atEnd) setFresh(0);
  };

  /* La rueda, el dedo o una tecla del visitante mandan sobre el desplazamiento suave. */
  const takeOver = () => {
    if (!scrolling.current) return;
    cancelAnimationFrame(scrolling.current);
    scrolling.current = 0;
  };

  /* ── Mecanografía de la frase en curso, directa al DOM. ── */
  useEffect(() => {
    const written = typedRef.current;
    const rest = restRef.current;
    if (!typing || !written || !rest) return;

    const { text, kind } = typing;
    let at = Math.min(text.length, typing.typed);
    let timer: ReturnType<typeof setTimeout>;
    const paint = () => {
      progress.current = at;
      written.textContent = text.slice(0, at);
      rest.textContent = text.slice(at);
    };

    // Con movimiento reducido la frase llega entera.
    if (reduced) {
      at = text.length;
      paint();
      timer = setTimeout(() => dispatch({ type: 'line-done' }), 0);
      return () => clearTimeout(timer);
    }

    const base = kind === 'calc' ? CALC_MS : TYPE_MS;
    const step = () => {
      if (at >= text.length) {
        dispatch({ type: 'line-done' });
        return;
      }
      at += 1;
      paint();
      const rhythm = base * (0.65 + Math.random() * 0.7);
      timer = setTimeout(step, rhythm + pauseAfter(text[at - 1]));
    };
    paint();
    timer = setTimeout(step, 240);
    return () => clearTimeout(timer);
    // `typing` cambia de identidad en cada render; su id y por dónde iba bastan.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typingId, reduced]);

  /* ── La línea siguiente: tras la pausa de lectura, y nunca mientras el visitante lee atrás. ── */
  useEffect(() => {
    if (!state.open || typingId !== undefined || reading) return;
    const last = state.log.at(-1);
    const script = scripts[state.node] ?? [];
    const scripted = nextScriptLine(state, script);
    const said = state.cursor[state.node] ?? 0;
    if (!scripted && said - script.length >= IDLE_MAX) return;
    const wait = scripted
      ? last && last.kind !== 'divider'
        ? holdAfter(last.text)
        : 520
      : IDLE_MS[0] + Math.floor((IDLE_MS[1] - IDLE_MS[0]) * 0.5);
    const timer = setTimeout(() => {
      random.current ??= seeded(0xe7a04);
      const line = scripted ?? idleLine(random.current, contextById(state.node)?.code ?? home.code);
      if (!following.current) setFresh((count) => count + 1);
      dispatch({ type: 'say', line });
    }, wait);
    return () => clearTimeout(timer);
    // El estado entero cambia a cada frase; lo que decide es el lugar, el largo del hilo y la pausa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.open, state.node, lines, typingId, reading]);

  /* ── Gestos del visitante: lo único que abre el canal. ── */
  const open = () => {
    if (!place) return;
    play('open');
    following.current = following.current || lines === 0;
    dispatch({ type: 'open', label: `${place.code} · ${place.name.toUpperCase()}` });
    requestAnimationFrame(() => panelRef.current?.focus({ preventScroll: true }));
  };

  const close = useCallback(() => {
    dispatch({ type: 'close', typed: progress.current });
    buttonRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (!state.open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state.open, close]);

  const resume = () => {
    following.current = true;
    setReading(false);
    setFresh(0);
    scrollToEnd(false);
  };

  /** Un toque sobre la frase en curso la completa: el ritmo lo pone quien lee. */
  const finish = () => {
    if (!typing) return;
    progress.current = typing.text.length;
    dispatch({ type: 'line-done' });
  };

  return (
    <aside
      className="synapse"
      data-open={state.open || undefined}
      data-pending={state.pending || undefined}
      data-toast={state.toast || undefined}
      data-accent={place?.accent}
      aria-label={channel.title}
    >
      {/* Un solo anuncio, cortés y una vez por lugar. El tecleo no se anuncia nunca. */}
      <p className="sr-only" aria-live="polite">
        {state.toast && place ? channel.announce(place.name) : ''}
      </p>

      <button
        ref={buttonRef}
        type="button"
        className="synapse__button"
        aria-expanded={state.open}
        aria-controls="sinapsis-panel"
        aria-label={state.pending ? `${channel.open}. ${channel.pendingLabel}` : channel.open}
        onClick={state.open ? close : open}
        data-cursor-label={state.open ? channel.closeCursor : channel.openCursor}
      >
        <span aria-hidden="true" className="synapse__toast mono">
          <b>{channel.toast}</b>
          <i>{channel.toastHint}</i>
        </span>
        <span aria-hidden="true" className="synapse__halo" />
        <span aria-hidden="true" className="synapse__tag mono">
          <b>{channel.owner}</b> {channel.name}
        </span>
        <span aria-hidden="true" className="synapse__glyph">
          <i />
          <i />
        </span>
        <span aria-hidden="true" className="synapse__dot" />
      </button>

      <div
        ref={panelRef}
        id="sinapsis-panel"
        className="synapse__panel"
        role="region"
        aria-label={channel.title}
        tabIndex={-1}
        inert={!state.open}
      >
        <p className="synapse__head mono">
          <span className="synapse__name">
            {channel.name} <i aria-hidden="true">{'//'}</i> {channel.owner}
          </span>
          <span className="synapse__place">
            <b aria-hidden="true" data-bin="">
              {place?.code}
            </b>{' '}
            {place?.name}
          </span>
          <button
            type="button"
            className="synapse__close"
            onClick={close}
            aria-label={channel.close}
            data-cursor-label={channel.closeCursor}
          >
            <span aria-hidden="true">×</span>
          </button>
        </p>

        {/* aria-live off: el hilo se lee navegando, no se anuncia mientras se teclea. */}
        <div
          ref={logRef}
          className="synapse__log"
          role="log"
          aria-live="off"
          tabIndex={0}
          onScroll={onScroll}
          onWheel={takeOver}
          onTouchStart={takeOver}
          onKeyDown={takeOver}
        >
          {state.log.map((entry) =>
            entry.kind === 'divider' ? (
              <p key={entry.id} className="synapse__divider mono">
                <span>{entry.text}</span>
              </p>
            ) : (
              <p
                key={entry.id}
                className="synapse__line"
                data-kind={entry.kind}
                data-cut={entry.cut || undefined}
                data-current={entry.id === typingId || undefined}
                onClick={entry.id === typingId ? finish : undefined}
              >
                <span aria-hidden="true" className="synapse__prompt">
                  {channel.prompt}
                </span>
                {entry.id === typingId ? (
                  <>
                    <span className="sr-only">{entry.text}</span>
                    <span aria-hidden="true" className="synapse__text">
                      <span ref={typedRef} />
                      <span className="synapse__caret">▊</span>
                      <span ref={restRef} className="synapse__rest" />
                    </span>
                  </>
                ) : (
                  <span className="synapse__text">
                    {entry.done ? entry.text : entry.text.slice(0, entry.typed)}
                  </span>
                )}
              </p>
            ),
          )}
        </div>

        {reading && (
          <button type="button" className="synapse__resume mono" onClick={resume}>
            <span aria-hidden="true">↓</span> {channel.resume}
            {fresh > 0 && <i> · {channel.resumeCount(fresh)}</i>}
          </button>
        )}

        <p className="synapse__foot mono">
          <span>{reading ? channel.state.paused : channel.state.open}</span>
          <span>{channel.fiction}</span>
        </p>
      </div>
    </aside>
  );
}

'use client';

import dynamic from 'next/dynamic';
import {
  Component,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { ejes, type OrganId } from '@/content/ejes';
import { subById } from '@/content/structure';
import { bin, bitsFor } from '@/lib/binary';
import { surgeField } from '@/lib/field';
import { useReducedMotion } from '@/lib/motion';
import { isSoundEnabled, play } from '@/lib/sound';
import { deviceTier, webglSupported } from '../neural/neural-data';
import { bodySignal, resetBodySignal } from './body-signal';
import { InteriorFallback } from './InteriorFallback';
import { InteriorVitals } from './InteriorVitals';
import { BPM } from './pulse';

/** three.js no viaja con la página: llega cuando el visitante se acerca al modelo. */
const InteriorScene = dynamic(() => import('./InteriorScene'), { ssr: false });

const copy = ejes.cuerpo.interior;
const subject = ejes.cuerpo.exterior.subject;
const ORGAN_BITS = bitsFor(copy.organs.length);

/** Con cuánta antelación se descarga y compila la escena, y con cuánta empieza a animarse. */
const MOUNT_MARGIN = '100% 0px';
const ACTIVE_MARGIN = '300px 0px';
/** Cuánto duran el pulso acelerado, el rótulo de latido forzado y el caudal abierto. */
const FAST_MS = 9000;
const FORCED_MS = 2600;
const OPEN_MS = 4500;
/** Cuánto gira el modelo por píxel arrastrado. */
const DRAG_GAIN = 0.0026;

type Phase = 'loading' | 'live' | 'flat';
type PulseState = keyof typeof copy.pulseStates;

const subscribeNever = () => () => {};
/** Estamos en el navegador: la pieza se renderiza en el servidor, donde no hay WebGL que detectar. */
const useIsClient = () =>
  useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );

/** Si la escena revienta —contexto perdido, sombreador rechazado— queda la vista plana. */
class SceneBoundary extends Component<{ onFail: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onFail();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

interface EvaInteriorProps {
  head?: ReactNode;
  foot?: ReactNode;
}

/**
 * INTERIOR / SISTEMA BIO-SINTÉTICO: la capa HTML del modelo interior de EVA.
 * Decide si hay WebGL, carga la escena en diferido y ofrece todo lo que se
 * puede hacer como botones de verdad, con teclado y foco: los seis órganos, la
 * acción propia de cada uno y las seis acciones del cuerpo. El lienzo es un
 * refuerzo visual: todo lo que se lee está fuera de él.
 *
 * Es ficción, como el genoma: nada se mide ni se guarda. Cada botón cambia lo
 * que se ve y lo que EVA contesta.
 *
 * La sección le pasa sus textos como huecos (`head`, `foot`) para que la
 * rejilla sea una sola: el modelo a un lado, a todo el alto, y al otro el
 * título, el registro de órganos, su lectura y la consola.
 */
export function EvaInterior({ head, foot }: EvaInteriorProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragX = useRef(0);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout> | undefined>>({});
  const turns = useRef({ accelerate: 0, sound: 0 });

  const client = useIsClient();
  const reduced = useReducedMotion();
  const supported = client ? webglSupported() : true;
  const quality = client && deviceTier() === 'low' ? 'low' : 'high';

  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<Phase>('loading');
  const [stats, setStats] = useState<{ cells: number; vessels: number } | null>(null);
  const [selected, setSelected] = useState<OrganId | null>(null);
  const [hovered, setHovered] = useState<OrganId | null>(null);
  const [xray, setXray] = useState(false);
  const [isolate, setIsolate] = useState(false);
  const [reverse, setReverse] = useState(false);
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState<PulseState>('rest');
  const [breath, setBreath] = useState(0);
  const [impulse, setImpulse] = useState(0);
  const [surge, setSurge] = useState(0);
  const [flare, setFlare] = useState<{ count: number; organ: OrganId | null }>({ count: 0, organ: null });
  const [sonify, setSonify] = useState(0);
  const [reset, setReset] = useState(0);
  const [reply, setReply] = useState<readonly string[]>([copy.idle]);

  /* Dos umbrales: uno lejano que monta la escena y otro cercano que la anima. */
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const mount = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setNear(true);
        mount.disconnect();
      },
      { rootMargin: MOUNT_MARGIN },
    );
    const live = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: ACTIVE_MARGIN,
    });
    mount.observe(host);
    live.observe(host);
    return () => {
      mount.disconnect();
      live.disconnect();
    };
  }, []);

  /* El latido es de módulo: arranca limpio con la pieza y no deja temporizadores colgando. */
  useEffect(() => {
    resetBodySignal();
    const pending = timers.current;
    return () => {
      for (const timer of Object.values(pending)) clearTimeout(timer);
      resetBodySignal();
    };
  }, []);

  const active = visible;
  const flat = !supported || phase === 'flat';
  const organs = copy.organs;
  const organ = organs.find((item) => item.id === selected);
  const focus = organs.find((item) => item.id === (hovered ?? selected));
  const codeOf = (id: OrganId) => bin(organs.findIndex((item) => item.id === id) + 1, ORGAN_BITS);

  /** Programa la vuelta de un estado pasajero; una pulsación nueva reinicia la cuenta. */
  const later = (key: string, ms: number, run: () => void) => {
    clearTimeout(timers.current[key]);
    timers.current[key] = setTimeout(run, ms);
  };

  const ready = useCallback((next: { cells: number; vessels: number }) => {
    setStats(next);
    setPhase('live');
  }, []);

  const fail = useCallback(() => {
    setStats(null);
    setPhase('flat');
  }, []);

  /*
   * Previsualización desde la escena. El cursor de señal sólo lee su etiqueta
   * al entrar en un elemento, así que al cambiar de órgano se le avisa con un
   * pointerover sintético sobre el escenario, que es el elemento que apunta.
   */
  const preview = useCallback((id: OrganId | null) => {
    setHovered(id);
    const stage = stageRef.current;
    if (!stage) return;
    const at = copy.organs.findIndex((item) => item.id === id);
    stage.dataset.cursorLabel =
      at >= 0 ? `${bin(at + 1, ORGAN_BITS)} ${copy.organs[at].name.toUpperCase()}` : copy.cursor;
    stage.dispatchEvent(new PointerEvent('pointerover', { bubbles: true }));
  }, []);

  const select = useCallback((id: OrganId) => {
    play('confirm');
    setSelected((current) => (current === id ? null : id));
  }, []);

  /* Arrastrar gira el modelo. Sin captura del puntero: se llevaría el clic de los órganos. */
  const onDragStart = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    bodySignal.dragging = true;
    dragX.current = event.clientX;
    const move = (next: PointerEvent) => {
      bodySignal.velocity += (next.clientX - dragX.current) * DRAG_GAIN;
      dragX.current = next.clientX;
    };
    const end = () => {
      bodySignal.dragging = false;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
  };

  /* ── Acciones del cuerpo ── */

  const onAccelerate = () => {
    play('open');
    surgeField(0.5);
    bodySignal.targetBpm = BPM.fast;
    setPulse('fast');
    setReply(copy.accelerateReplies[turns.current.accelerate % copy.accelerateReplies.length]);
    turns.current.accelerate += 1;
    later('pulse', FAST_MS, () => {
      bodySignal.targetBpm = BPM.rest;
      setPulse('rest');
    });
  };

  const onXray = () => {
    play('confirm');
    setReply(xray ? copy.xrayReplies.off : copy.xrayReplies.on);
    setXray(!xray);
  };

  const onIsolate = () => {
    if (!selected) {
      setIsolate(false);
      setReply(copy.isolateReplies.none);
      return;
    }
    play('confirm');
    setReply(isolate ? copy.isolateReplies.off : copy.isolateReplies.on);
    setIsolate(!isolate);
  };

  const onReverse = () => {
    play('open');
    surgeField(0.4);
    setReply(reverse ? copy.reverseReplies.off : copy.reverseReplies.on);
    setReverse(!reverse);
  };

  /** Sonificar sólo tiene sentido con el sonido encendido; si no, EVA lo dice. */
  const onSound = () => {
    if (!isSoundEnabled()) {
      setReply(copy.soundMuted);
      return;
    }
    setSonify((count) => count + 1);
    setReply(copy.soundReplies[turns.current.sound % copy.soundReplies.length]);
    turns.current.sound += 1;
  };

  const onReset = () => {
    play('confirm');
    for (const key of Object.keys(timers.current)) clearTimeout(timers.current[key]);
    bodySignal.targetBpm = BPM.rest;
    bodySignal.velocity = 0;
    setSelected(null);
    setXray(false);
    setIsolate(false);
    setReverse(false);
    setOpen(false);
    setPulse('rest');
    setReset((count) => count + 1);
    setReply(copy.resetReply);
  };

  /* ── La acción propia de cada órgano ── */

  const onOrganAction = (id: OrganId) => {
    const item = organs.find((entry) => entry.id === id);
    if (!item) return;
    play('open');
    surgeField(0.45);
    setReply(item.reply);
    setFlare((current) => ({ count: current.count + 1, organ: id }));

    if (id === 'corazon') {
      bodySignal.heart.kick();
      bodySignal.force = 2.4;
      setPulse('forced');
      later('pulse', FORCED_MS, () => setPulse(bodySignal.targetBpm > BPM.rest ? 'fast' : 'rest'));
    }
    if (id === 'pulmones') setBreath((count) => count + 1);
    if (id === 'cerebro') setImpulse((count) => count + 1);
    if (id === 'aorta') {
      setSurge((count) => count + 1);
      setOpen(true);
      later('flow', OPEN_MS, () => setOpen(false));
    }
  };

  const isolated = isolate && selected !== null;
  const flowState = open ? copy.flowStates.open : reverse ? copy.flowStates.reverse : copy.flowStates.normal;
  const layerState = isolated ? copy.layerStates.isolated : xray ? copy.layerStates.xray : copy.layerStates.body;
  const status = stats
    ? `${stats.cells} ${copy.hud.cells} · ${stats.vessels} ${copy.hud.vessels}`
    : flat
      ? copy.hud.flat
      : copy.hud.loading;
  const place = organ && 'place' in organ ? organ.place : undefined;
  const placeCode = place ? subById(place.id)?.sub.code : undefined;

  return (
    <div
      ref={hostRef}
      className="interior"
      data-phase={flat ? 'flat' : phase}
      data-pulse={pulse}
      data-active={active}
    >
      {head && <div className="interior__head">{head}</div>}

      <div className="interior__stage">
        <div
          ref={stageRef}
          className="interior__canvas"
          aria-hidden="true"
          data-grab=""
          data-cursor="grab"
          data-cursor-label={copy.cursor}
          onPointerDown={onDragStart}
        >
          {client && near && !flat && (
            <SceneBoundary onFail={fail}>
              <InteriorScene
                quality={quality}
                reduced={reduced}
                active={active}
                selected={selected}
                hovered={hovered}
                xray={xray}
                isolate={isolate}
                reverse={reverse}
                breath={breath}
                impulse={impulse}
                surge={surge}
                flare={flare.count}
                flareOrgan={flare.organ}
                reset={reset}
                onHover={preview}
                onSelect={select}
                onReady={ready}
              />
            </SceneBoundary>
          )}

          {flat && (
            <InteriorFallback
              title={copy.eyebrow}
              selected={selected}
              hovered={hovered}
              xray={xray}
              isolate={isolate}
              onSelect={select}
              onHover={setHovered}
            />
          )}

          {!flat && phase === 'loading' && <span className="interior__wait" />}
        </div>

        <p className="interior__hud mono" aria-hidden="true">
          <span className="interior__hud-id">
            {subject} <i>{'//'}</i> {copy.hud.id} <i>{'//'}</i> {status}
          </span>
          <span>
            {copy.hud.pulse}: <b data-tone={pulse}>{copy.pulseStates[pulse]}</b>
          </span>
          <span>
            {copy.hud.flow}: <b>{flowState}</b>
          </span>
          <span>
            {copy.hud.layer}: <b>{layerState}</b>
          </span>
          <span className="interior__hud-organ" data-on={focus ? '' : undefined}>
            {copy.hud.organ}:{' '}
            <b>
              {focus ? (
                <>
                  <i data-bin="">{codeOf(focus.id)}</i> {focus.name.toUpperCase()}
                </>
              ) : (
                copy.hud.none
              )}
            </b>
          </span>
        </p>

        <InteriorVitals active={active} reduced={reduced} sonify={sonify} label={copy.hud.ecg} />

        <p className="interior__hint mono" aria-hidden="true">
          {reduced ? copy.reducedHint : copy.hint}
        </p>
      </div>

      <div className="interior__console">
        <div className="interior__organs" role="group" aria-label={copy.organsLabel}>
          {organs.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className="core__chip organ-chip mono"
              aria-pressed={selected === item.id}
              aria-label={`${item.name}, ${copy.organWord} ${index + 1} ${copy.of} ${organs.length}`}
              data-hover={hovered === item.id || undefined}
              data-cursor-label={codeOf(item.id)}
              onClick={() => select(item.id)}
              onPointerEnter={() => setHovered(item.id)}
              onPointerLeave={() => setHovered(null)}
              onFocus={() => setHovered(item.id)}
              onBlur={() => setHovered(null)}
            >
              <i aria-hidden="true" data-bin="">
                {codeOf(item.id)}
              </i>
              <span aria-hidden="true">{item.name}</span>
            </button>
          ))}
        </div>

        <div className="organ-panel" aria-live="polite" data-empty={organ ? undefined : ''}>
          {organ ? (
            <>
              <p className="organ-panel__head mono">
                <b aria-hidden="true" data-bin="">
                  {codeOf(organ.id)}
                </b>
                <span>{organ.name}</span>
                <i>{organ.kicker}</i>
              </p>
              <p className="organ-panel__reading">{organ.reading}</p>
              <dl className="organ-panel__states mono" aria-label={copy.statesLabel}>
                {organ.states.map(([term, value]) => (
                  <div key={term}>
                    <dt>{term}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="organ-panel__actions">
                <button
                  type="button"
                  className="dna__btn organ-panel__btn mono"
                  onClick={() => onOrganAction(organ.id)}
                  data-cursor-label={copy.cursors.organ}
                >
                  {organ.action}
                </button>
                {place && (
                  <a href={`#${place.id}`} className="organ-panel__link mono" data-sound="open">
                    <b aria-hidden="true" data-bin="">
                      {placeCode}
                    </b>{' '}
                    {place.label} <span aria-hidden="true">↑</span>
                  </a>
                )}
              </div>
            </>
          ) : (
            <p className="organ-panel__empty">{copy.panelEmpty}</p>
          )}
        </div>

        <div className="dna__actions interior__actions" role="group" aria-label={copy.actionsLabel}>
          <button type="button" className="dna__btn mono" onClick={onAccelerate} data-cursor-label={copy.cursors.accelerate}>
            {copy.actions.accelerate}
          </button>
          <button
            type="button"
            className="dna__btn mono"
            aria-pressed={xray}
            onClick={onXray}
            data-cursor-label={copy.cursors.xray}
          >
            {copy.actions.xray}
          </button>
          <button
            type="button"
            className="dna__btn mono"
            aria-pressed={isolated}
            onClick={onIsolate}
            data-cursor-label={copy.cursors.isolate}
          >
            {copy.actions.isolate}
          </button>
          <button
            type="button"
            className="dna__btn mono"
            aria-pressed={reverse}
            onClick={onReverse}
            data-cursor-label={copy.cursors.reverse}
          >
            {copy.actions.reverse}
          </button>
          <button type="button" className="dna__btn mono" onClick={onSound} data-cursor-label={copy.cursors.sound}>
            {copy.actions.sound}
          </button>
          <button
            type="button"
            className="dna__btn dna__btn--ghost mono"
            onClick={onReset}
            data-cursor-label={copy.cursors.reset}
          >
            {copy.actions.reset}
          </button>
        </div>

        <p className="dna__reply" role="status">
          {reply.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </p>
        {foot}
      </div>
    </div>
  );
}

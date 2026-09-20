'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { consciencia } from '@/content/consciencia';
import { bin } from '@/lib/binary';
import { surgeField } from '@/lib/field';
import { useReducedMotion } from '@/lib/motion';
import { play } from '@/lib/sound';
import type { ConsciousnessStateId, FigureId, GravityId, RegimeId, ViscosityId } from '@/lib/types';
import {
  DEFAULT_COUNT,
  MOBILE_COUNT,
  createParticleWorld,
  cycleGravity,
  cycleViscosity,
  gatherParticleWorld,
  narrativeState,
  nextFigure,
  perturbParticleWorld,
  randomizeRules,
  randomizeWorld,
  regimeOf,
  releaseParticleWorld,
  resetParticleWorld,
  stepParticleWorld,
  toggleNoise,
  type ParticleWorld,
} from './particle-life';
import { drawParticleWorld, sizeParticleCanvas, type FieldSize } from './particle-renderer';

/** Un arrastre o un paso del puntero por el campo lo perturba como mucho cada tanto. */
const POINTER_INTERVAL_MS = 72;
/** Tras reunir y soltar por primera vez, la confesión se abre sola pasado este tiempo. */
const CONFESSION_DELAY_MS = 1600;
/** Ancho del contador de grupos: cinco grupos caben en tres bits. */
const GROUP_BITS = 3;
/** Con movimiento reducido no hay bucle: cada acción avanza la simulación de golpe. */
const STILL_STEPS = 12;
const STILL_GATHER_STEPS = 110;

type ReplyList = readonly (readonly [string, string])[];

interface ConsciousnessExperienceProps {
  head?: ReactNode;
  copy?: ReactNode;
  foot?: ReactNode;
}

interface Readout {
  state: ConsciousnessStateId;
  regime: RegimeId;
  figure: FigureId;
  gravity: GravityId;
  viscosity: ViscosityId;
  noise: boolean;
  groups: number;
  gathered: boolean;
  confessed: boolean;
}

function readWorld(world: ParticleWorld): Readout {
  return {
    state: narrativeState(world),
    regime: regimeOf(world),
    figure: world.figure,
    gravity: world.gravity,
    viscosity: world.viscosity,
    noise: world.noise,
    groups: world.groupCount,
    gathered: world.gathered && world.compositionTarget > 0,
    confessed: world.releasedAfterGather,
  };
}

/**
 * El campo de autoobservación de EVA: un mundo de Particle Life (MIT,
 * adaptado) que ella mira organizarse. Se perturba con el puntero; la consola
 * lo reúne en una figura, lo suelta, cambia la figura, aleatoriza las reglas
 * (caos), enciende el ruido, la gravedad, la viscosidad o todo a la vez, y lo
 * reinicia. Cada acción tiene su respuesta, como en el genoma, y el relato
 * avanza por estados: dispersión, relación, huella, autoobservación. Al
 * reunir y soltar por primera vez aparece la confesión.
 *
 * El motor es puro y va aparte (`particle-life.ts`); aquí sólo viven el bucle
 * de dibujo, los eventos y lo que se lee. El mundo vive en un ref y React sólo
 * se entera de lo que cambia de verdad (estado, régimen, figura, respuesta).
 * Se renderiza también en el servidor: nada de `window` fuera de los efectos.
 */
export function ConsciousnessExperience({ head, copy, foot }: ConsciousnessExperienceProps) {
  const text = consciencia;
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef<ParticleWorld | null>(null);
  const sizeRef = useRef<FieldSize>({ width: 1, height: 1, dpr: 1 });
  const drawRef = useRef<(fresh?: boolean) => void>(() => {});
  const stillRef = useRef<(steps: number) => void>(() => {});
  const lastPointerRef = useRef(0);
  const turnRef = useRef(0);
  const countsRef = useRef<Record<string, number>>({});
  const confessionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reduced = useReducedMotion();
  const [readout, setReadout] = useState<Readout>({
    state: 'dispersion',
    regime: 'stable',
    figure: 'eye',
    gravity: 'none',
    viscosity: 'medium',
    noise: false,
    groups: 3,
    gathered: false,
    confessed: false,
  });
  const [reply, setReply] = useState<readonly string[]>([text.idle]);
  const [count, setCount] = useState(DEFAULT_COUNT);
  const [confessionOpen, setConfessionOpen] = useState(false);

  const sync = useCallback(() => {
    const world = worldRef.current;
    if (world) setReadout(readWorld(world));
  }, []);

  /** La siguiente respuesta de una lista, en orden y dando la vuelta. */
  const pick = (key: string, list: ReplyList) => {
    const at = countsRef.current[key] ?? 0;
    countsRef.current[key] = at + 1;
    return list[at % list.length];
  };

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const particles = window.innerWidth < 768 ? MOBILE_COUNT : DEFAULT_COUNT;
    const world = createParticleWorld(undefined, particles);
    worldRef.current = world;

    let frame = 0;
    let lastTime = 0;
    let inView = false;
    let announced = false;

    const draw = (fresh = false) =>
      drawParticleWorld(context, world, sizeRef.current, narrativeState(world), regimeOf(world), fresh);
    drawRef.current = draw;
    stillRef.current = (steps) => {
      for (let index = 0; index < steps; index += 1) stepParticleWorld(world, 1 / 60);
      draw(true);
    };

    /* El observador de tamaño avisa nada más observar: ahí se publica la primera lectura. */
    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      sizeRef.current = sizeParticleCanvas(canvas, bounds.width, bounds.height);
      if (!announced) {
        announced = true;
        setCount(particles);
        setReadout(readWorld(world));
        // Quieto: unos pasos para que el campo no salga en fila, y un solo fotograma.
        if (reduced) for (let index = 0; index < STILL_STEPS; index += 1) stepParticleWorld(world, 1 / 60);
      }
      draw(true);
    };

    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
    };

    const loop = (time: number) => {
      if (!inView || document.hidden || reduced) {
        stop();
        return;
      }
      const seconds = lastTime ? Math.min((time - lastTime) / 1000, 1 / 20) : 1 / 60;
      lastTime = time;
      stepParticleWorld(world, seconds);
      draw();
      frame = requestAnimationFrame(loop);
    };

    const start = () => {
      if (frame || !inView || document.hidden || reduced) return;
      frame = requestAnimationFrame(loop);
    };

    const intersection = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) start();
        else stop();
      },
      { rootMargin: '160px 0px', threshold: 0.05 },
    );
    const resizeObserver = new ResizeObserver(resize);
    const onVisibility = () => (document.hidden ? stop() : start());

    intersection.observe(host);
    resizeObserver.observe(canvas);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      intersection.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      if (confessionTimer.current) clearTimeout(confessionTimer.current);
      drawRef.current = () => {};
      stillRef.current = () => {};
      worldRef.current = null;
    };
  }, [reduced]);

  /* ── El puntero perturba el campo ── */

  const perturb = useCallback(
    (x: number, y: number, strength: number) => {
      const world = worldRef.current;
      if (!world) return;
      perturbParticleWorld(world, x, y, strength);
      if (reduced) stillRef.current(STILL_STEPS);
      sync();
    },
    [reduced, sync],
  );

  const pointFromEvent = (event: React.PointerEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return {
      x: (event.clientX - bounds.left) / Math.max(bounds.width, 1),
      y: (event.clientY - bounds.top) / Math.max(bounds.height, 1),
    };
  };

  const onPointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const point = pointFromEvent(event);
    perturb(point.x, point.y, 1.1);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    // Con el ratón basta pasar por encima; en táctil hay que arrastrar.
    if (event.pointerType !== 'mouse' && event.buttons === 0) return;
    const now = performance.now();
    if (now - lastPointerRef.current < POINTER_INTERVAL_MS) return;
    lastPointerRef.current = now;
    const point = pointFromEvent(event);
    perturb(point.x, point.y, 0.5);
  };

  /* ── La consola ── */

  /** Lo común a toda acción: sonido, sacudida del fondo, lectura nueva y, quieto, un salto de la simulación. */
  const settle = (steps = STILL_STEPS, surge = 0.25) => {
    play('confirm');
    surgeField(surge);
    if (reduced) stillRef.current(steps);
    sync();
  };

  const onPerturb = () => {
    const turn = turnRef.current;
    turnRef.current += 1;
    // Cada pulsación golpea en un punto distinto, girando alrededor del centro.
    const angle = turn * 2.399963;
    perturb(0.5 + Math.cos(angle) * 0.22, 0.5 + Math.sin(angle) * 0.18, 1.25);
    setReply(pick('perturb', text.replies.perturb));
    settle();
  };

  const onGather = () => {
    const world = worldRef.current;
    if (!world) return;
    gatherParticleWorld(world);
    setReply(pick('gather', text.replies.gather));
    settle(STILL_GATHER_STEPS);
  };

  const onRelease = () => {
    const world = worldRef.current;
    if (!world) return;
    const first = !world.releasedAfterGather && world.gathered;
    releaseParticleWorld(world);
    setReply(pick('release', text.replies.release));
    settle();
    if (first) {
      // La primera vez que se suelta lo reunido, la confesión aparece sola.
      if (confessionTimer.current) clearTimeout(confessionTimer.current);
      confessionTimer.current = setTimeout(() => setConfessionOpen(true), CONFESSION_DELAY_MS);
    }
  };

  const onFigure = () => {
    const world = worldRef.current;
    if (!world) return;
    const figure = nextFigure(world);
    // Pedir una figura es pedir verla: si el campo está suelto, se reúne.
    if (world.compositionTarget === 0) gatherParticleWorld(world);
    setReply(text.replies.figure[figure]);
    settle(STILL_GATHER_STEPS);
  };

  const onChaos = () => {
    const world = worldRef.current;
    if (!world) return;
    // Con las reglas nuevas el campo tiene que estar suelto: reunido, no se verían.
    releaseParticleWorld(world);
    randomizeRules(world);
    setReply(pick('chaos', text.replies.chaos));
    settle(STILL_STEPS * 3, 0.6);
  };

  const onNoise = () => {
    const world = worldRef.current;
    if (!world) return;
    const on = toggleNoise(world);
    setReply(on ? text.replies.noise.on : text.replies.noise.off);
    settle();
  };

  const onGravity = () => {
    const world = worldRef.current;
    if (!world) return;
    const gravity = cycleGravity(world);
    setReply(text.replies.gravity[gravity]);
    settle(STILL_STEPS * 2);
  };

  const onViscosity = () => {
    const world = worldRef.current;
    if (!world) return;
    const viscosity = cycleViscosity(world);
    setReply(text.replies.viscosity[viscosity]);
    settle();
  };

  const onRandom = () => {
    const world = worldRef.current;
    if (!world) return;
    releaseParticleWorld(world);
    randomizeWorld(world);
    setReply(pick('random', text.replies.random));
    settle(STILL_STEPS * 3, 0.6);
  };

  const onReset = () => {
    const world = worldRef.current;
    if (!world) return;
    if (confessionTimer.current) clearTimeout(confessionTimer.current);
    resetParticleWorld(world);
    turnRef.current = 0;
    countsRef.current = {};
    setConfessionOpen(false);
    setReply(text.replies.reset);
    settle(STILL_STEPS, 0.5);
    drawRef.current(true);
  };

  const toggleConfession = () => {
    play('open');
    setConfessionOpen((open) => !open);
  };

  const state = text.states[readout.state];
  const figure = text.figures[readout.figure];

  return (
    <div
      ref={hostRef}
      className="conscience"
      data-state={readout.state}
      data-regime={readout.regime}
      data-gathered={readout.gathered || undefined}
    >
      {head && <div className="conscience__head">{head}</div>}

      <div className="conscience__field">
        <div
          className="conscience__stage"
          role="img"
          aria-label={text.hud.canvasLabel}
          data-cursor="crosshair"
          data-cursor-label={text.hud.hintCursor}
          title={text.hud.hint}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
        >
          <span className="stage-marks" />
          <canvas ref={canvasRef} className="conscience__canvas" aria-hidden="true" />

          {/* Lecturas del instrumento, sobre el campo: identidad y estado arriba; recuento, figura y pista abajo. */}
          <p className="dna__overlay dna__overlay--top mono" aria-hidden="true">
            <span className="dna__hud-title">
              {text.hud.title} <i>{'//'}</i> {text.hud.field}
            </span>
            <span className="dna__hud-core">
              <i />
              {text.hud.state}: {state.label}
            </span>
          </p>
          <p className="dna__overlay dna__overlay--bottom mono" aria-hidden="true">
            <span className="dna__hud-count">
              <b>{count}</b> {text.hud.particles} · <b data-bin="">{bin(readout.groups, GROUP_BITS)}</b>{' '}
              {text.hud.groups} · {text.hud.figure}: {figure.name}
            </span>
            <span className="dna__hud-count">
              {text.hud.regime}: <b>{text.regimes[readout.regime]}</b> · {text.viscosity[readout.viscosity]} ·{' '}
              {text.gravity[readout.gravity]} · {readout.noise ? text.noise.on : text.noise.off}
            </span>
          </p>

          {/* La confesión: aparece tras reunir y soltar; se abre y se cierra a voluntad. */}
          <div
            id="consciencia-confesion"
            className="conscience__confession"
            role="region"
            aria-label={text.confession.label}
            hidden={!confessionOpen}
          >
            <p className="conscience__confession-label mono">{text.confession.label}</p>
            {text.confession.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <button type="button" className="dna__purge mono" onClick={toggleConfession}>
              {text.confession.close}
            </button>
          </div>
        </div>

        {/* Lo que EVA lee en el estado actual: su línea y, en itálica, el eco. Sobre el campo en escritorio; debajo en móvil. */}
        <div className="conscience__readout" role="status" aria-live="polite">
          <p className="conscience__readout-label mono">{state.label}</p>
          <p className="conscience__readout-text">{state.text}</p>
          <p className="conscience__readout-echo">{state.echo}</p>
          {readout.gathered && <p className="conscience__readout-figure">{figure.echo}</p>}
        </div>
      </div>

      <div className="conscience__console dna__console">
        {/* La pista, sólo donde el campo no tiene el puntero encima (táctil): en escritorio la dice el cursor. */}
        <p className="conscience__hint mono">{text.hud.hint}</p>

        <div className="dna__actions conscience__actions" role="group" aria-label={text.actionsLabel}>
          <button
            type="button"
            className="dna__btn mono"
            onClick={onPerturb}
            data-cursor-label={text.cursors.perturb}
          >
            {text.actions.perturb}
          </button>
          <button
            type="button"
            className="dna__btn mono"
            onClick={onGather}
            aria-pressed={readout.gathered}
            data-cursor-label={text.cursors.gather}
          >
            {text.actions.gather}
          </button>
          <button
            type="button"
            className="dna__btn mono"
            onClick={onRelease}
            data-cursor-label={text.cursors.release}
          >
            {text.actions.release}
          </button>
          <button
            type="button"
            className="dna__btn mono"
            onClick={onFigure}
            data-cursor-label={text.cursors.figure}
          >
            {text.actions.figure}
          </button>
          <button
            type="button"
            className="dna__btn dna__btn--express mono"
            onClick={onChaos}
            data-cursor-label={text.cursors.chaos}
          >
            {text.actions.chaos}
          </button>
          <button
            type="button"
            className="dna__btn mono"
            onClick={onNoise}
            aria-pressed={readout.noise}
            data-cursor-label={text.cursors.noise}
          >
            {text.actions.noise}
          </button>
          <button
            type="button"
            className="dna__btn mono"
            onClick={onGravity}
            aria-pressed={readout.gravity !== 'none'}
            data-cursor-label={text.cursors.gravity}
          >
            {text.actions.gravity}
          </button>
          <button
            type="button"
            className="dna__btn mono"
            onClick={onViscosity}
            data-cursor-label={text.cursors.viscosity}
          >
            {text.actions.viscosity}
          </button>
          <button
            type="button"
            className="dna__btn dna__btn--express mono"
            onClick={onRandom}
            data-cursor-label={text.cursors.random}
          >
            {text.actions.random}
          </button>
          <button
            type="button"
            className="dna__btn dna__btn--ghost mono"
            onClick={onReset}
            data-cursor-label={text.cursors.reset}
          >
            {text.actions.reset}
          </button>
        </div>

        <p className="dna__reply" role="status">
          {reply.map((line) => (
            <span key={line}>{line}</span>
          ))}
          {/* La confesión, una vez recuperada, se puede volver a leer desde aquí. */}
          {readout.confessed && (
            <button
              type="button"
              className="dna__reply-link mono"
              onClick={toggleConfession}
              aria-expanded={confessionOpen}
              aria-controls="consciencia-confesion"
            >
              {confessionOpen ? text.confession.close : text.confession.open}
            </button>
          )}
        </p>
        {foot}
      </div>

      {copy && <div className="conscience__copy">{copy}</div>}
    </div>
  );
}

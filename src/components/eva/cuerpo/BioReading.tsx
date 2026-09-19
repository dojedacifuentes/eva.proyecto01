'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { capsuleLoop, images } from '@/content/assets';
import { ejes, type BodyView, type SweepDirection } from '@/content/ejes';
import { bin, bitsFor } from '@/lib/binary';
import { clearBody, publishBody } from '@/lib/body-state';
import { useMediaQuery } from '@/lib/media';
import { useReducedMotion } from '@/lib/motion';
import { seeded } from '@/lib/random';
import { play } from '@/lib/sound';
import { BIO_VIEWS, PASS, SIM_WIDTH } from './bio-data';
import { FROZEN, HIT, OUT, createScan, detectEdges, traceEdges, type Scan } from './scan';

const copy = ejes.cuerpo.exterior;

const SWEEPS: readonly SweepDirection[] = ['down', 'up', 'right', 'left'];
/** El contador de pasadas se escribe en cuatro bits: es un nombre, no una medida. */
const CYCLE_BITS = 4;
const POINT_BITS = bitsFor(copy.points.profile.length);
/** Cada cuánto se publican el recuento de bordes y el avance, en milisegundos. */
const READOUT_MS = 140;
/** En el trazado directo, uno de cada tantos píxeles de borde. */
const TRACE_EVERY = 3;

const CYAN = '63, 216, 238';
const BIO = '120, 240, 180';
const MAGENTA = '240, 122, 185';

type Status = keyof typeof copy.states;

interface Still {
  /** Pares x, y en la rejilla de simulación. */
  points: Float32Array;
  radius: number;
}

interface BioReadingProps {
  head?: ReactNode;
  foot?: ReactNode;
}

/** Pinta una tanda de puntos de un solo color en un único trazado: más barato que uno por punto. */
function dots(
  context: CanvasRenderingContext2D,
  points: ArrayLike<number>,
  pick: (index: number) => boolean,
  scale: number,
  radius: number,
  style: string,
) {
  context.fillStyle = style;
  context.beginPath();
  for (let i = 0; i < points.length; i += 2) {
    if (!pick(i / 2)) continue;
    const x = points[i] * scale;
    const y = points[i + 1] * scale;
    context.moveTo(x + radius, y);
    context.arc(x, y, radius, 0, Math.PI * 2);
  }
  context.fill();
}

/** Lo que queda cuando nada se mueve: los puntos clavados en los bordes, nítidos. */
function paintStill(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement, kept: Still) {
  const scale = canvas.width / SIM_WIDTH;
  context.globalCompositeOperation = 'source-over';
  context.clearRect(0, 0, canvas.width, canvas.height);
  dots(context, kept.points, (at) => at % 7 !== 0, scale, kept.radius * scale, `rgba(${BIO}, 0.9)`);
  dots(context, kept.points, (at) => at % 7 === 0, scale, kept.radius * scale, `rgba(${MAGENTA}, 0.95)`);
}

/**
 * BIOLECTURA: la lectura exterior del cuerpo de EVA. Sobre el vídeo de perfil
 * —o sobre la imagen de la cápsula— pasa una tanda de filas de partículas que
 * se detienen donde encuentran un borde y así van dibujando el contorno. El
 * motor es `scan.ts` (técnica de collidingScopes/scanlines, MIT); aquí están el
 * lienzo, los dos recursos, el HUD y los botones.
 *
 * Todo ocurre en el navegador: los bordes se calculan una vez, a partir del
 * fotograma que se está viendo, en un lienzo fuera de pantalla. No hay cámara,
 * no se sube nada y no se guarda nada. Es ficción, como el genoma.
 *
 * El vídeo se conserva como vídeo: en escritorio arranca solo al entrar en
 * pantalla; en pantallas estrechas y con movimiento reducido se queda su primer
 * fotograma como póster, y sólo se descarga si el visitante lo pide.
 */
export function BioReading({ head, foot }: BioReadingProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef(0);
  const still = useRef<Still | null>(null);
  const turns = useRef(0);

  const reduced = useReducedMotion();
  const wide = useMediaQuery('(min-width: 64rem)');

  const [view, setView] = useState<BodyView>('profile');
  const [sweep, setSweep] = useState<SweepDirection>('down');
  const [status, setStatus] = useState<Status>('idle');
  const [cycle, setCycle] = useState(0);
  const [edges, setEdges] = useState(0);
  const [progress, setProgress] = useState(0);
  const [lit, setLit] = useState(0);
  const [onScreen, setOnScreen] = useState(false);
  const [requested, setRequested] = useState(false);
  const [paused, setPaused] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [reply, setReply] = useState<readonly string[]>([copy.idle]);

  const showVideo = view === 'profile' && onScreen && (requested || (wide && !reduced));

  /* El vídeo sólo existe con la pieza a la vista: fuera de pantalla ni descarga ni decodifica. */
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), {
      rootMargin: '200px',
    });
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  /* El lienzo sigue a su marco; lo ya trazado se vuelve a pintar a la medida nueva. */
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const resize = () => {
      const box = canvas.getBoundingClientRect();
      if (box.width < 4 || box.height < 4) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(box.width * ratio);
      canvas.height = Math.round(box.height * ratio);
      const kept = still.current;
      if (kept) paintStill(context, canvas, kept);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    return () => observer.disconnect();
  }, []);

  useEffect(
    () => () => {
      cancelAnimationFrame(frameRef.current);
      clearBody();
    },
    [],
  );

  function wipe() {
    cancelAnimationFrame(frameRef.current);
    still.current = null;
    const canvas = canvasRef.current;
    canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    setEdges(0);
    setProgress(0);
    setLit(0);
  }

  /** Los bordes de lo que se está viendo: el fotograma actual del vídeo o, si no lo hay, la imagen. */
  function readEdges(): { map: Uint8Array; width: number; height: number } | null {
    const video = videoRef.current;
    const source = video && video.readyState >= 2 ? video : imageRef.current;
    if (!source) return null;
    if (source instanceof HTMLImageElement && (!source.complete || source.naturalWidth === 0)) return null;

    const width = SIM_WIDTH;
    const height = Math.round(SIM_WIDTH / BIO_VIEWS[view].aspect);
    const scratch = document.createElement('canvas');
    scratch.width = width;
    scratch.height = height;
    const paint = scratch.getContext('2d', { willReadFrequently: true });
    if (!paint) return null;
    try {
      paint.drawImage(source, 0, 0, width, height);
      const { data } = paint.getImageData(0, 0, width, height);
      return { map: detectEdges(data, width, height, BIO_VIEWS[view].threshold), width, height };
    } catch {
      // Un recurso servido desde otro origen mancharía el lienzo: sin lectura no hay pasada.
      return null;
    }
  }

  /** Qué puntos de lectura ha cruzado ya la cabeza de la pasada, como máscara de bits. */
  function crossed(front: number, direction: SweepDirection) {
    let mask = 0;
    BIO_VIEWS[view].points.forEach(([x, y], at) => {
      const along = direction === 'down' ? y : direction === 'up' ? 1 - y : direction === 'right' ? x : 1 - x;
      if (front >= along) mask |= 1 << at;
    });
    return mask;
  }

  function trace(found: { map: Uint8Array; width: number; height: number }, next: Status) {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const points = traceEdges(found.map, found.width, found.height, TRACE_EVERY);
    still.current = { points, radius: 0.55 };
    paintStill(context, canvas, still.current);
    setEdges(points.length / 2);
    setProgress(1);
    setLit((1 << BIO_VIEWS[view].points.length) - 1);
    setStatus(next);
    publishBody('read');
  }

  function run(scan: Scan, direction: SweepDirection) {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const vertical = direction === 'down' || direction === 'up';
    const forward = direction === 'down' || direction === 'right';
    let last = 0;
    let told = 0;

    const tick = (now: number) => {
      // Tope alto: en un equipo lento la pasada salta más por fotograma, pero dura lo mismo.
      const dt = last ? Math.min((now - last) / 1000, 0.12) : 0;
      last = now;
      scan.step(dt);

      const scale = canvas.width / SIM_WIDTH;
      const live = scan.spawned;
      // Fondo transparente: en vez de tapar con negro, como el original, se borra un poco. Eso deja la estela.
      context.globalCompositeOperation = 'destination-out';
      context.fillStyle = 'rgba(0, 0, 0, 0.2)';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.globalCompositeOperation = 'source-over';

      const moving: number[] = [];
      const struck: number[] = [];
      const fixed: number[] = [];
      for (let at = 0; at < live; at++) {
        const flag = scan.flags[at];
        if (flag & OUT) continue;
        const bucket = flag & FROZEN ? fixed : flag & HIT ? struck : moving;
        bucket.push(scan.x[at], scan.y[at]);
      }
      dots(context, moving, () => true, scale, 0.6 * scale, `rgba(${CYAN}, 0.7)`);
      dots(context, struck, () => true, scale, 0.66 * scale, `rgba(${BIO}, 0.85)`);
      dots(context, fixed, (at) => at % 7 !== 0, scale, 0.72 * scale, `rgba(${BIO}, 0.6)`);
      dots(context, fixed, (at) => at % 7 === 0, scale, 0.72 * scale, `rgba(${MAGENTA}, 0.65)`);

      // La línea de cabeza: lo que el ojo sigue mientras las filas bajan.
      if (scan.front < 1) {
        const span = vertical ? canvas.height : canvas.width;
        const at = (forward ? scan.front : 1 - scan.front) * span;
        context.fillStyle = `rgba(${CYAN}, 0.55)`;
        if (vertical) context.fillRect(0, at, canvas.width, Math.max(1, scale * 0.6));
        else context.fillRect(at, 0, Math.max(1, scale * 0.6), canvas.height);
      }

      if (now - told > READOUT_MS || scan.done) {
        told = now;
        setEdges(scan.frozen);
        setProgress(scan.progress);
        setLit(crossed(scan.front, direction));
      }

      if (scan.done) {
        const points: number[] = [];
        for (let at = 0; at < scan.count; at++) if (scan.flags[at] & FROZEN) points.push(scan.x[at], scan.y[at]);
        still.current = { points: Float32Array.from(points), radius: 0.72 };
        paintStill(context, canvas, still.current);
        setLit((1 << BIO_VIEWS[view].points.length) - 1);
        setStatus('done');
        setReply(copy.doneReply);
        publishBody('read');
        return;
      }
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
  }

  /* ── Acciones ── */

  const onStart = () => {
    const found = readEdges();
    if (!found) return;
    play('open');
    wipe();
    setCycle((count) => count + 1);
    setReply(copy.startReplies[turns.current % copy.startReplies.length]);
    turns.current += 1;
    // Con movimiento reducido no hay pasada: los bordes aparecen ya trazados.
    if (reduced) {
      trace(found, 'done');
      return;
    }
    setStatus('scanning');
    publishBody('scanning');
    run(
      createScan({
        ...PASS,
        width: found.width,
        height: found.height,
        edges: found.map,
        sweep,
        random: seeded(0xe7a07 + turns.current),
      }),
      sweep,
    );
  };

  const onTrace = () => {
    const found = readEdges();
    if (!found) return;
    play('confirm');
    wipe();
    setReply(copy.traceReply);
    trace(found, 'traced');
  };

  const onClear = () => {
    play('confirm');
    wipe();
    setStatus('idle');
    setReply(copy.clearReply);
    publishBody('idle');
  };

  /** Girar el barrido no borra lo leído: vale para la próxima pasada. */
  const onTurn = () => {
    play('confirm');
    const next = SWEEPS[(SWEEPS.indexOf(sweep) + 1) % SWEEPS.length];
    setSweep(next);
    setReply(copy.turnReplies[next]);
  };

  /** Cada vista tiene sus bordes: al cambiar, lo leído en la otra ya no vale. */
  const onView = (next: BodyView) => {
    if (next === view) return;
    play('open');
    wipe();
    setVideoReady(false);
    setView(next);
    setStatus('idle');
    setReply(copy.viewReplies[next]);
    publishBody('idle');
  };

  const onVideo = () => {
    play('confirm');
    if (!showVideo) {
      setRequested(true);
      setPaused(false);
      setReply(copy.resumeReply);
      return;
    }
    const video = videoRef.current;
    if (paused) void video?.play().catch(() => undefined);
    else video?.pause();
    setReply(paused ? copy.resumeReply : copy.pauseReply);
    setPaused(!paused);
  };

  const image = view === 'profile' ? images.capsuleProfile : images.capsulePortrait;
  const names = copy.points[view];
  const busy = status === 'scanning';
  const videoLabel = !showVideo ? copy.actions.load : paused ? copy.actions.resume : copy.actions.pause;

  return (
    <div ref={hostRef} className="bio" data-status={status} data-view={view}>
      {head && <div className="bio__head">{head}</div>}

      <figure className="bio__figure">
        <div className="bio__media" style={{ aspectRatio: String(BIO_VIEWS[view].aspect) }}>
          {(['tl', 'tr', 'bl', 'br'] as const).map((corner) => (
            <span key={corner} aria-hidden="true" className={`bio__corner bio__corner--${corner}`} />
          ))}

          <Image
            key={view}
            ref={imageRef}
            className="bio__image"
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes="(min-width: 64rem) 26rem, (min-width: 40rem) 22rem, 82vw"
          />

          {showVideo && (
            /*
             * El arranque va en `canplay`, no en un efecto: pedir `play()` antes de
             * que haya datos deja la promesa colgando y el vídeo quieto en el primer
             * fotograma (trampa 5). El elemento sólo se monta cuando toca. Mudo y
             * sin controles de sonido: la pista de audio del archivo no se usa.
             */
            <video
              ref={videoRef}
              className="bio__video"
              data-ready={videoReady || undefined}
              src={capsuleLoop.src}
              muted
              loop
              playsInline
              preload="auto"
              aria-hidden="true"
              tabIndex={-1}
              onLoadStart={() => setVideoReady(false)}
              onCanPlay={(event) => {
                if (!paused) void event.currentTarget.play().catch(() => undefined);
              }}
              onPlaying={() => setVideoReady(true)}
            />
          )}

          <canvas ref={canvasRef} className="bio__scan" aria-hidden="true" />
          <span aria-hidden="true" className="bio__idle-sweep" />

          <ul className="bio__points" aria-hidden="true">
            {BIO_VIEWS[view].points.map(([x, y], at) => (
              <li
                key={`${view}-${at}`}
                className="bio__point mono"
                data-on={(lit >> at) & 1 ? '' : undefined}
                data-side={x > 0.5 ? 'left' : 'right'}
                style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
              >
                <i />
                <span>
                  <b data-bin="">{bin(at + 1, POINT_BITS)}</b> {names[at]}
                </span>
              </li>
            ))}
          </ul>

          <p className="bio__tag bio__tag--top mono" aria-hidden="true">
            <span>
              {copy.subject} <i>{'//'}</i> {copy.title}
            </span>
            <span>{copy.views[view].hud}</span>
          </p>
          <p className="bio__tag bio__tag--bottom mono" aria-hidden="true">
            <span>
              {copy.hud.state}: <b>{copy.states[status]}</b>
            </span>
            <span>
              {copy.hud.cycle}: <b data-bin="">{bin(cycle, CYCLE_BITS)}</b>
            </span>
          </p>
        </div>
      </figure>

      <div className="bio__console">
        <p className="bio__kicker mono">{copy.kicker}</p>
        <p className="bio__body">{copy.body}</p>

        <div className="bio__views" role="group" aria-label={copy.views.label}>
          {(['profile', 'front'] as const).map((id) => (
            <button
              key={id}
              type="button"
              className="core__chip bio__view mono"
              aria-pressed={view === id}
              onClick={() => onView(id)}
              data-cursor-label={copy.views[id].cursor}
            >
              <span>{copy.views[id].name}</span>
            </button>
          ))}
        </div>

        <p className="dna__hud bio__hud mono">
          <span className="dna__hud-title">
            {copy.subject} {'//'} {copy.title}
          </span>
          <span className="dna__hud-core">
            <i aria-hidden="true" />
            {copy.hud.state}: {copy.states[status]} · {copy.hud.cycle}:{' '}
            <b data-bin="">{bin(cycle, CYCLE_BITS)}</b>
          </span>
          <span>
            {copy.hud.view}: {copy.views[view].hud} · {copy.hud.sweep}: {copy.sweeps[sweep]}
          </span>
          <span className="dna__hud-count">
            {copy.hud.edges}: <b>{edges}</b> · {copy.hud.progress}: <b>{Math.round(progress * 100)} %</b>
          </span>
        </p>

        <div className="dna__actions bio__actions" role="group" aria-label={copy.actionsLabel}>
          <button
            type="button"
            className="dna__btn bio__start mono"
            onClick={onStart}
            data-cursor-label={copy.cursors.start}
          >
            {status === 'idle' ? copy.actions.start : copy.actions.repeat}
          </button>
          <button
            type="button"
            className="dna__btn mono"
            onClick={onTurn}
            disabled={busy}
            data-cursor-label={copy.cursors.turn}
          >
            {copy.actions.turn}
          </button>
          <button
            type="button"
            className="dna__btn mono"
            onClick={onTrace}
            disabled={busy}
            data-cursor-label={copy.cursors.trace}
          >
            {copy.actions.trace}
          </button>
          {view === 'profile' && (
            <button type="button" className="dna__btn mono" onClick={onVideo} data-cursor-label={copy.cursors.video}>
              {videoLabel}
              {!showVideo && <small> · {copy.actions.loadNote}</small>}
            </button>
          )}
          {status !== 'idle' && (
            <button
              type="button"
              className="dna__btn dna__btn--ghost mono"
              onClick={onClear}
              data-cursor-label={copy.cursors.clear}
            >
              {copy.actions.clear}
            </button>
          )}
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

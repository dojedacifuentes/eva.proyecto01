'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { capsuleFrontLoop, capsuleLoop, images, type EvaImage, type EvaLoop } from '@/content/assets';
import { ejes, type BodyView } from '@/content/ejes';
import { bin, bitsFor } from '@/lib/binary';
import { clearBody, publishBody } from '@/lib/body-state';
import { useReducedMotion } from '@/lib/motion';
import { seeded } from '@/lib/random';
import { play } from '@/lib/sound';
import { BIO_VIEWS, PASS, SIM_WIDTH } from './bio-data';
import { FROZEN, HIT, OUT, createScan, detectEdges, traceEdges, type Scan } from './scan';

const copy = ejes.cuerpo.exterior;

/** Cada vista, su vídeo y su póster. Las dos son el mismo cuerpo, desde fuera. */
const MEDIA: Record<BodyView, { video: EvaLoop; poster: EvaImage }> = {
  profile: { video: capsuleLoop, poster: images.capsuleProfile },
  front: { video: capsuleFrontLoop, poster: images.capsuleFront },
};

/** Megabytes con coma decimal: es una medida, así que va en decimal. */
const megabytes = (bytes: number) => `${(bytes / 1_000_000).toFixed(1).replace('.', ',')} MB`;

/** El contador de pasadas se escribe en cuatro bits: es un nombre, no una medida. */
const CYCLE_BITS = 4;
const POINT_BITS = bitsFor(copy.points.profile.length);
/** Cada cuánto se publica el avance de la pasada, en milisegundos. */
const READOUT_MS = 140;
/** Con movimiento reducido los bordes salen ya trazados: uno de cada tantos píxeles de borde. */
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
  /** Qué toma se lee: el perfil o la cápsula. Cada una es una instancia. */
  view: BodyView;
  /** Lo que EVA escribe junto a esta toma. */
  writes?: ReactNode;
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
 * BIOLECTURA: la lectura exterior del cuerpo de EVA. Sobre el vídeo de una
 * toma —el perfil o la cápsula— pasa una tanda de filas de partículas que se
 * detienen donde encuentran un borde y así van dibujando el contorno. El motor
 * es `scan.ts` (técnica de collidingScopes/scanlines, MIT); aquí están el
 * lienzo, el recurso, el HUD y los botones.
 *
 * Todo ocurre en el navegador: los bordes se calculan una vez, a partir del
 * fotograma que se está viendo, en un lienzo fuera de pantalla. No hay cámara,
 * no se sube nada y no se guarda nada. Es ficción, como el genoma.
 *
 * Desde la v8 las dos tomas van una debajo de otra, cada una con su
 * biolectura y su caja de EVA: nada se abre con clic. El vídeo arranca solo
 * al entrar en pantalla, también en móvil (v8.1: recomprimidos); sólo con
 * movimiento reducido se queda en su primer fotograma, que hace de póster, y
 * se descarga si el visitante lo pide.
 */
export function BioReading({ view, writes, foot }: BioReadingProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef(0);
  const still = useRef<Still | null>(null);
  const turns = useRef(0);

  const reduced = useReducedMotion();

  const [status, setStatus] = useState<Status>('idle');
  const [cycle, setCycle] = useState(0);
  const [lit, setLit] = useState(0);
  const [onScreen, setOnScreen] = useState(false);
  const [requested, setRequested] = useState(false);
  const [paused, setPaused] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [reply, setReply] = useState<readonly string[]>([copy.idle]);

  const media = MEDIA[view];
  const take = copy.views[view];
  /* Desde la v8.1 el vídeo arranca solo en todas las pantallas (pesa 0,8–1,4 MB); con
     movimiento reducido se queda en el póster y sólo se descarga si se pide. */
  const showVideo = onScreen && (requested || !reduced);

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

  /** Qué puntos de lectura ha cruzado ya la cabeza de la pasada (baja de arriba abajo), como máscara de bits. */
  function crossed(front: number) {
    let mask = 0;
    BIO_VIEWS[view].points.forEach(([, y], at) => {
      if (front >= y) mask |= 1 << at;
    });
    return mask;
  }

  function trace(found: { map: Uint8Array; width: number; height: number }) {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const points = traceEdges(found.map, found.width, found.height, TRACE_EVERY);
    still.current = { points, radius: 0.55 };
    paintStill(context, canvas, still.current);
    setLit((1 << BIO_VIEWS[view].points.length) - 1);
    setStatus('done');
    setReply(copy.doneReply);
    publishBody('read');
  }

  function run(scan: Scan) {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
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
        context.fillStyle = `rgba(${CYAN}, 0.55)`;
        context.fillRect(0, scan.front * canvas.height, canvas.width, Math.max(1, scale * 0.6));
      }

      if (now - told > READOUT_MS || scan.done) {
        told = now;
        setLit(crossed(scan.front));
      }

      if (scan.done) {
        const points: number[] = [];
        for (let at = 0; at < scan.count; at++)
          if (scan.flags[at] & FROZEN) points.push(scan.x[at], scan.y[at]);
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
      trace(found);
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
        sweep: 'down',
        random: seeded(0xe7a07 + turns.current),
      }),
    );
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

  const image = media.poster;
  const names = copy.points[view];
  const videoLabel = !showVideo ? copy.actions.load : paused ? copy.actions.resume : copy.actions.pause;

  return (
    <div ref={hostRef} className="bio" data-status={status} data-view={view}>
      <figure className="bio__figure">
        <div className="bio__media" style={{ aspectRatio: String(BIO_VIEWS[view].aspect) }}>
          <span aria-hidden="true" className="stage-marks" />

          <Image
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
              src={media.video.src}
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
                key={at}
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
            <span>{take.hud}</span>
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

        <figcaption className="bio__caption mono">
          <span className="bio__kicker">{take.kicker}</span>
          <span>{take.name}</span>
        </figcaption>
      </figure>

      <div className="bio__console">
        {writes}

        {/* Los controles van juntos: en móvil se colocan justo bajo el vídeo, antes de la caja. */}
        <div className="bio__controls">
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
              onClick={onVideo}
              data-cursor-label={copy.cursors.video}
            >
              {videoLabel}
              {!showVideo && <small> · {megabytes(media.video.bytes)}</small>}
            </button>
          </div>

          <p className="dna__reply" role="status">
            {reply.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </p>
        </div>
        {foot}
      </div>
    </div>
  );
}

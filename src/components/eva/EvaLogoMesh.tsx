'use client';

import { useEffect, useRef } from 'react';
import {
  BRAND_COLORS,
  LOOP,
  POSES,
  REVEAL,
  SEGMENTS,
  SHAPES,
  STEADY,
  boundsOf,
  durationOf,
  sample,
  type Point,
  type Pose,
  type SegmentId,
  type Step,
} from '@/lib/brand';
import { pointerSignal } from '@/lib/pointer';
import { DPR_CAP, getQuality, subscribeQuality } from '@/lib/quality';

interface Node {
  seg: SegmentId;
  /** Sitio dentro de su pieza, en unidades de la marca: no cambia nunca. */
  lx: number;
  ly: number;
  /** Los del borde dibujan la silueta; los de dentro sólo la cruzan. */
  edge: boolean;
  phase: number;
  /** Dónde se pintó en el último fotograma, en píxeles del lienzo. */
  x: number;
  y: number;
  /** De 0 (izquierda de la figura) a 1 (derecha): su tono en el degradado. */
  hue: number;
  alpha: number;
}

interface Satellite {
  homeX: number;
  homeY: number;
  phase: number;
  /** Los nodos de la marca a los que va atado. */
  ties: number[];
}

/** Rejilla de muestreo, en píxeles del nombre en reposo. */
const STEP = 6;
/** Cuántos nodos interiores se conservan: pocos, o la pieza se emborrona. */
const INSIDE_KEEP = 0.45;
/** Alcance de las aristas, en píxeles del nombre en reposo. */
const LINK = 22;
const MAX_LINKS = 6;
/** Aristas entre piezas distintas: pocas, sólo donde se tocan. */
const MAX_CROSS = 2;
const SATELLITES = 18;
const SATELLITE_LINK = 110;

/**
 * Onda que recorre la malla (px) y empuje del puntero. Más suave que la del
 * acrónimo de antes: los trazos de la marca son finos, y una onda que desfasaba
 * el borde de arriba y el de abajo de cada barra las convertía en cuerdas.
 * Ahora la fase apenas cambia a lo ancho de un trazo: cada barra ondea entera,
 * como una cinta.
 */
const WAVE = 3.4;
const WAVE_SPEED = 0.0016;
const WAVE_ALONG = 0.019;
const WAVE_ACROSS = 0.011;
const PUSH = 90;
/** Mientras las piezas se recolocan, la onda casi calla: primero la forma, después la tela. */
const WAVE_WHILE_MOVING = 0.18;
/** Lo que tarda la onda en volver entera cuando las piezas se detienen (ms). */
const WAVE_RETURN = 900;
/** Margen del encuadre: casi nada a los lados (el nombre llena la columna), algo arriba y abajo. */
const MARGIN_X = 0.02;
const MARGIN_Y = 0.1;

/** Los brazos no muestrean su corte vertical: queda dentro de la letra, pegado al del brazo gemelo. */
const INNER_EDGE: Partial<Record<SegmentId, number>> = { x1: 2, x2: 2, x3: 2, x4: 2 };

/** Con movimiento reducido, pulsar cambia de figura sin viaje: símbolo, pausa, nombre. */
const STILL: readonly Step[] = [
  { pose: 'logotype', move: 0, hold: 0 },
  { pose: 'isotype', move: 0, hold: 1600 },
  { pose: 'logotype', move: 0, hold: 0 },
];

/* ───────────── Color ───────────── */

/** Tonos por los que se agrupan trazos y nodos: pocos cambios de color por fotograma. */
const BANDS = 6;
const ALPHA_STEPS = 4;

type Rgb = readonly [number, number, number];

const toRgb = (hex: string): Rgb => [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16)) as unknown as Rgb;

function ramp(stops: readonly string[], t: number): Rgb {
  const colors = stops.map(toRgb);
  const span = t * (colors.length - 1);
  const k = Math.min(colors.length - 2, Math.floor(span));
  const f = span - k;
  return colors[k].map((value, channel) => Math.round(value + (colors[k + 1][channel] - value) * f)) as unknown as Rgb;
}

/** Halo y aristas: el azul eléctrico → violeta de la marca. Puntos: su núcleo, casi blanco. */
const GLOW = Array.from({ length: BANDS }, (_, band) => ramp(BRAND_COLORS.glow, band / (BANDS - 1)));
const CORE = Array.from({ length: BANDS }, (_, band) => ramp(BRAND_COLORS.core, band / (BANDS - 1)));
const rgba = ([r, g, b]: Rgb, alpha: number) => `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;

/** Radio del halo de un nodo del borde, en píxeles; el núcleo es un tercio. */
const HALO = 4.4;

/**
 * Un nodo, pintado una sola vez por tono: núcleo casi blanco que se funde en
 * el halo de la marca. Cada fotograma se estampa con `drawImage`.
 *
 * Por qué no círculos: agrupar cientos de `arc()` en un solo trazado ahorra
 * llamadas, pero el rasterizador rellena un trazado así mucho más despacio que
 * un círculo suelto (pierde su vía rápida) y la portada caía a un tercio de
 * fotogramas con menos JavaScript. Una imagen pequeña es lo más barato de
 * pintar, y el degradado queda mejor que dos discos planos.
 */
function makeSprite(core: Rgb, glow: Rgb, ratio: number) {
  const size = Math.ceil(HALO * 2 * ratio * 2);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const paint = canvas.getContext('2d');
  if (!paint) return canvas;
  const r = size / 2;
  const gradient = paint.createRadialGradient(r, r, 0, r, r, r);
  gradient.addColorStop(0, rgba(core, 1));
  gradient.addColorStop(0.24, rgba(core, 0.92));
  gradient.addColorStop(0.34, rgba(glow, 0.2));
  gradient.addColorStop(0.7, rgba(glow, 0.07));
  gradient.addColorStop(1, rgba(glow, 0));
  paint.fillStyle = gradient;
  paint.fillRect(0, 0, size, size);
  return canvas;
}

/* ───────────── Geometría de muestreo ───────────── */

function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function inside(shape: readonly Point[], x: number, y: number) {
  let hit = false;
  for (let i = 0, j = shape.length - 1; i < shape.length; j = i++) {
    const [xi, yi] = shape[i];
    const [xj, yj] = shape[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

/** Nodos de una pieza en sus propias coordenadas: el contorno entero y parte del relleno. */
function sampleShape(id: SegmentId, step: number, keep: number, random: () => number) {
  const shape = SHAPES[id];
  const out: Pick<Node, 'lx' | 'ly' | 'edge'>[] = [];
  shape.forEach(([ax, ay], k) => {
    if (INNER_EDGE[id] === k) return;
    const [bx, by] = shape[(k + 1) % shape.length];
    const count = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / step));
    for (let i = 0; i < count; i++) {
      const t = i / count;
      out.push({ lx: ax + (bx - ax) * t, ly: ay + (by - ay) * t, edge: true });
    }
  });
  const xs = shape.map(([x]) => x);
  const ys = shape.map(([, y]) => y);
  for (let y = Math.min(...ys) + step / 2; y < Math.max(...ys); y += step) {
    for (let x = Math.min(...xs) + step / 2; x < Math.max(...xs); x += step) {
      if (inside(shape, x, y) && random() < keep) out.push({ lx: x, ly: y, edge: false });
    }
  }
  return out;
}

/** Dónde cae un punto de una pieza, en unidades de la marca, para una pose. */
function toWorld(node: Pick<Node, 'seg' | 'lx' | 'ly'>, pose: Pose) {
  const place = pose[node.seg];
  const turn = (place.angle * Math.PI) / 180;
  const cos = Math.cos(turn);
  const sin = Math.sin(turn);
  return { x: place.x + node.lx * cos - node.ly * sin, y: place.y + node.lx * sin + node.ly * cos };
}

/* ───────────── Componente ───────────── */

interface MeshProps {
  /** Nombre accesible del botón que repite la transformación. */
  replayLabel: string;
  /** Rótulo del cursor de señal sobre el nombre. */
  cursorLabel: string;
}

/**
 * El nombre de EVA en la portada: una red de nodos que vive **dentro de las
 * ocho piezas de la marca** (`lib/brand`). Al entrar en pantalla, la red hace la
 * transformación del storyboard —el cuadrado sobre la X se desacopla, se abre
 * en una E, la X se parte en V y Λ, y las tres letras se alinean— con las
 * piezas rígidas, sin estirarse. Después ondea como una tela y se aparta del
 * puntero, como el acrónimo de antes.
 *
 * Pulsar el nombre repite el bucle entero: del nombre al símbolo y de vuelta.
 *
 * Por fotograma sólo se mueven los nodos: vecinos, aristas y muestreo se
 * calculan una vez, al medir el lienzo. Las aristas y los puntos se agrupan por
 * tono y opacidad, así el lienzo cambia de color unas pocas decenas de veces
 * por fotograma y no una por trazo.
 */
export function EvaLogoMesh({ replayLabel, cursorLabel }: MeshProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const replayRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let nodes: Node[] = [];
    let links: [number, number][] = [];
    let satellites: Satellite[] = [];
    let sprites: HTMLCanvasElement[] = [];
    /** Nodos de cada tono, reutilizados entre fotogramas para no crear arrays. */
    const byBand: Node[][] = Array.from({ length: BANDS }, () => []);
    let width = 0;
    let height = 0;
    /** Escala del nombre en reposo: la referencia de todos los tamaños en píxeles. */
    let rest = 1;
    let frame = 0;
    let stopped = false;
    let onScreen = false;
    let introduced = false;

    /** Lo que se está reproduciendo, si algo. */
    let timeline: { steps: readonly Step[]; start: number; length: number } | null = null;
    /** Cuándo se detuvieron las piezas por última vez: la onda vuelve desde ahí. */
    let settled = -Infinity;

    /** Mide el lienzo y reparte los nodos por las piezas. */
    const build = () => {
      const box = canvas.getBoundingClientRect();
      if (box.width < 4 || box.height < 4) return false;
      // Con tope por calidad medida: el nombre se repinta cada fotograma.
      const ratio = Math.min(window.devicePixelRatio || 1, 1.75, DPR_CAP[getQuality()]);
      width = box.width;
      height = box.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      sprites = Array.from({ length: BANDS }, (_, band) => makeSprite(CORE[band], GLOW[band], ratio));

      const logo = boundsOf(POSES.logotype);
      rest = Math.min(
        (width * (1 - MARGIN_X * 2)) / (logo.right - logo.left),
        (height * (1 - MARGIN_Y * 2)) / (logo.bottom - logo.top),
      );
      const low = getQuality() === 'low';
      const step = (low ? STEP * 1.35 : STEP) / rest;
      const reach = LINK / rest;

      const random = seeded(0xe7a01);
      nodes = [];
      for (const seg of SEGMENTS) {
        for (const point of sampleShape(seg, step, low ? INSIDE_KEEP * 0.6 : INSIDE_KEEP, random)) {
          // Un temblor pequeño: la red no es una rejilla, pero el borde no se deshace.
          const jitter = point.edge ? 0.25 : 0.45;
          nodes.push({
            seg,
            lx: point.lx + (random() - 0.5) * step * jitter,
            ly: point.ly + (random() - 0.5) * step * jitter,
            edge: point.edge,
            phase: random() * Math.PI * 2,
            x: 0,
            y: 0,
            hue: 0.5,
            alpha: 1,
          });
        }
      }

      // Vecinos dentro de cada pieza: como la pieza es rígida, valen en cualquier pose.
      links = [];
      const degree = new Array(nodes.length).fill(0);
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          if (degree[i] >= MAX_LINKS) break;
          if (nodes[i].seg !== nodes[j].seg || degree[j] >= MAX_LINKS) continue;
          const dx = nodes[i].lx - nodes[j].lx;
          const dy = nodes[i].ly - nodes[j].ly;
          if (dx * dx + dy * dy > reach * reach) continue;
          links.push([i, j]);
          degree[i]++;
          degree[j]++;
        }
      }

      // Entre piezas, sólo donde se tocan: en el símbolo (esquinas, centro de la
      // X) y en el nombre (vértices). A medio camino se estiran y se apagan solas.
      const cross = new Array(nodes.length).fill(0);
      for (const pose of [POSES.isotype, POSES.logotype]) {
        const world = nodes.map((node) => toWorld(node, pose));
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            if (nodes[i].seg === nodes[j].seg || cross[i] >= MAX_CROSS || cross[j] >= MAX_CROSS) continue;
            if (pose[nodes[i].seg].alpha < 0.5 || pose[nodes[j].seg].alpha < 0.5) continue;
            const dx = world[i].x - world[j].x;
            const dy = world[i].y - world[j].y;
            if (dx * dx + dy * dy > reach * reach * 0.6) continue;
            links.push([i, j]);
            cross[i]++;
            cross[j]++;
          }
        }
      }

      // Satélites: puntos sueltos alrededor del nombre, atados a la pieza más cercana.
      const home = nodes.map((node) => toWorld(node, POSES.logotype));
      satellites = Array.from({ length: SATELLITES }, () => {
        const homeX = random() * width;
        const homeY = random() * height;
        const near = home
          .map((point, at) => ({
            at,
            distance: Math.hypot(width / 2 + point.x * rest - homeX, height / 2 + point.y * rest - homeY),
          }))
          .filter((entry) => entry.distance < SATELLITE_LINK && POSES.logotype[nodes[entry.at].seg].alpha > 0.5)
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 2)
          .map((entry) => entry.at);
        return { homeX, homeY, phase: random() * Math.PI * 2, ties: near };
      });
      return true;
    };

    /** La pose de este instante. Antes de estrenarse, el símbolo: la revelación parte de ahí. */
    const poseAt = (now: number) => {
      if (!timeline) return introduced || reduced.matches ? POSES.logotype : POSES.isotype;
      const elapsed = now - timeline.start;
      if (elapsed >= timeline.length) {
        timeline = null;
        settled = now;
        return POSES.logotype;
      }
      return sample(timeline.steps, elapsed).pose;
    };

    const draw = (now: number) => {
      context.clearRect(0, 0, width, height);
      if (!nodes.length) return;

      const pose = poseAt(now);
      const still = reduced.matches;

      // Encuadre: la figura de este instante, centrada y entera. Sin suavizado —
      // una cámara que va por detrás deja que la figura se salga del lienzo
      // cuando crece deprisa—; como la caja de las piezas fijas no salta, no hace falta.
      const box = boundsOf(pose, STEADY);
      const camera = {
        scale: Math.min(
          (width * (1 - MARGIN_X * 2)) / (box.right - box.left),
          (height * (1 - MARGIN_Y * 2)) / (box.bottom - box.top),
        ),
        x: (box.left + box.right) / 2,
        y: (box.top + box.bottom) / 2,
      };

      // El degradado va de un lado a otro de la figura, no del lienzo.
      const left = width / 2 + (box.left - camera.x) * camera.scale;
      const span = Math.max(1, (box.right - box.left) * camera.scale);
      // Más pequeña, más densa: puntos menores y más tenues para que no se empaste.
      const density = Math.sqrt(Math.min(1, camera.scale / rest));

      const moving = timeline !== null;
      const gain = still
        ? 0
        : moving
          ? WAVE_WHILE_MOVING
          : WAVE_WHILE_MOVING + (1 - WAVE_WHILE_MOVING) * Math.min(1, (now - settled) / WAVE_RETURN);

      const frameBox = canvas.getBoundingClientRect();
      const px = pointerSignal.active ? pointerSignal.x - frameBox.left : -9999;
      const py = pointerSignal.active ? pointerSignal.y - frameBox.top : -9999;

      const turns = Object.fromEntries(
        SEGMENTS.map((seg) => {
          const angle = (pose[seg].angle * Math.PI) / 180;
          return [seg, { cos: Math.cos(angle), sin: Math.sin(angle) }];
        }),
      ) as Record<SegmentId, { cos: number; sin: number }>;

      const push = (x: number, y: number) => {
        const dx = x - px;
        const dy = y - py;
        const distance = Math.hypot(dx, dy);
        if (distance >= PUSH) return [x, y] as const;
        const force = (1 - distance / PUSH) ** 2 * 26;
        return [x + (dx / (distance || 1)) * force, y + (dy / (distance || 1)) * force] as const;
      };

      for (const node of nodes) {
        const place = pose[node.seg];
        const { cos, sin } = turns[node.seg];
        const wx = place.x + node.lx * cos - node.ly * sin;
        const wy = place.y + node.lx * sin + node.ly * cos;
        let x = width / 2 + (wx - camera.x) * camera.scale;
        let y = height / 2 + (wy - camera.y) * camera.scale;
        if (gain > 0) {
          // Onda viajera sobre la posición en pantalla: toda la red ondea con la misma tela.
          const travel = x * WAVE_ALONG + y * WAVE_ACROSS - now * WAVE_SPEED;
          x += Math.sin(travel) * WAVE * gain;
          y += Math.cos(travel * 0.8 + node.phase * 0.1) * WAVE * 0.7 * gain;
        }
        [node.x, node.y] = push(x, y);
        node.hue = Math.min(1, Math.max(0, (node.x - left) / span));
        node.alpha = place.alpha;
      }

      /* Aristas, agrupadas por tono y opacidad. */
      const strokes = Array.from({ length: BANDS * ALPHA_STEPS }, () => new Path2D());
      const used = new Array(strokes.length).fill(false);
      const MAX_ALPHA = 0.42;
      const addStroke = (ax: number, ay: number, bx: number, by: number, hue: number, alpha: number) => {
        if (alpha < 0.012) return;
        const band = Math.round(hue * (BANDS - 1));
        const level = Math.min(ALPHA_STEPS - 1, Math.floor((alpha / MAX_ALPHA) * ALPHA_STEPS));
        const at = band * ALPHA_STEPS + level;
        strokes[at].moveTo(ax, ay);
        strokes[at].lineTo(bx, by);
        used[at] = true;
      };

      for (const [a, b] of links) {
        const first = nodes[a];
        const second = nodes[b];
        const reach = Math.hypot(first.x - second.x, first.y - second.y);
        // Los hilos largos se apagan: dan profundidad sin ensuciar la letra.
        const fade = Math.max(0, 1 - reach / (LINK * 2.4 * density));
        const alpha = 0.4 * fade * Math.min(first.alpha, second.alpha);
        addStroke(first.x, first.y, second.x, second.y, (first.hue + second.hue) / 2, alpha);
      }

      const drift = (satellite: Satellite) => {
        if (gain === 0) return [satellite.homeX, satellite.homeY] as const;
        const travel = satellite.homeX * 0.026 + satellite.homeY * 0.05 - now * WAVE_SPEED;
        return push(
          satellite.homeX + Math.sin(travel) * WAVE * 1.5 * gain,
          satellite.homeY + Math.cos(travel * 0.8 + satellite.phase * 0.35) * WAVE * 0.93 * gain,
        );
      };
      const moons = satellites.map(drift);
      satellites.forEach((satellite, s) => {
        const [sx, sy] = moons[s];
        for (const tie of satellite.ties) {
          const node = nodes[tie];
          const reach = Math.hypot(sx - node.x, sy - node.y);
          const fade = Math.max(0, 1 - reach / (SATELLITE_LINK * 1.3));
          addStroke(sx, sy, node.x, node.y, node.hue, 0.13 * fade * node.alpha);
        }
      });

      context.lineWidth = 0.65;
      strokes.forEach((path, at) => {
        if (!used[at]) return;
        const band = Math.floor(at / ALPHA_STEPS);
        const level = at % ALPHA_STEPS;
        context.strokeStyle = rgba(GLOW[band], ((level + 0.5) / ALPHA_STEPS) * MAX_ALPHA);
        context.stroke(path);
      });

      /* Puntos: el sprite de su tono, estampado. Agrupados por tono para no saltar de imagen. */
      for (const bucket of byBand) bucket.length = 0;
      for (const node of nodes) {
        if (node.alpha > 0.02) byBand[Math.round(node.hue * (BANDS - 1))].push(node);
      }
      byBand.forEach((bucket, band) => {
        const sprite = sprites[band];
        for (const node of bucket) {
          const pulse = still ? 1 : 0.75 + Math.sin(now * 0.002 + node.phase) * 0.25;
          const weight = node.edge ? 1 : 0.6;
          const size = HALO * 2 * weight * density;
          context.globalAlpha = Math.min(1, pulse * weight * node.alpha);
          context.drawImage(sprite, node.x - size / 2, node.y - size / 2, size, size);
        }
      });
      satellites.forEach((satellite, s) => {
        const pulse = still ? 1 : 0.75 + Math.sin(now * 0.002 + satellite.phase) * 0.25;
        const [sx, sy] = moons[s];
        const band = Math.round(Math.min(1, Math.max(0, (sx - left) / span)) * (BANDS - 1));
        context.globalAlpha = pulse * 0.4;
        context.drawImage(sprites[band], sx - HALO * 0.5, sy - HALO * 0.5, HALO, HALO);
      });
      context.globalAlpha = 1;
    };

    const tick = (now: number) => {
      if (stopped) return;
      draw(now);
      frame = requestAnimationFrame(tick);
    };

    /* Fuera de pantalla no se dibuja. */
    const start = () => {
      cancelAnimationFrame(frame);
      if (document.hidden || !onScreen) return;
      frame = requestAnimationFrame(tick);
    };

    const play = (steps: readonly Step[]) => {
      timeline = { steps, start: performance.now(), length: durationOf(steps) };
      start();
    };

    /* Pulsar el nombre repite el bucle; mientras suena, otro clic no lo corta. */
    replayRef.current = () => {
      if (timeline) return;
      play(reduced.matches ? STILL : LOOP);
    };

    const rebuild = () => {
      if (build()) draw(performance.now());
    };

    const observer = new ResizeObserver(rebuild);
    observer.observe(canvas);
    const spy = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        // La revelación se estrena la primera vez que el nombre está a la vista,
        // no al cargar: si la página abre más abajo, se guarda para cuando suba.
        if (onScreen && !introduced) {
          introduced = true;
          if (!reduced.matches) play(REVEAL);
        }
        start();
      },
      { rootMargin: '0px', threshold: 0.35 },
    );
    spy.observe(canvas);
    document.addEventListener('visibilitychange', start);
    // Si la calidad baja, el lienzo se vuelve a medir con menos píxeles y menos nodos.
    const unsubscribeQuality = subscribeQuality(rebuild);

    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
      unsubscribeQuality();
      observer.disconnect();
      spy.disconnect();
      document.removeEventListener('visibilitychange', start);
      replayRef.current = () => undefined;
    };
  }, []);

  return (
    <button
      type="button"
      className="acronym__replay"
      aria-label={replayLabel}
      onClick={() => replayRef.current()}
      data-sound="open"
      data-cursor-label={cursorLabel}
    >
      <canvas ref={canvasRef} className="acronym__canvas" aria-hidden="true" />
    </button>
  );
}

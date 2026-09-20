'use client';

import { useEffect, useRef } from 'react';
import { pointerSignal } from '@/lib/pointer';

interface Node {
  /** Sitio de reposo, en píxeles del lienzo. */
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  phase: number;
  /** 0 arriba, 1 abajo: decide el color dentro del degradado. */
  depth: number;
  /** Los del borde definen la silueta; los de dentro sólo la cruzan. */
  edge: boolean;
  /** Un satélite flota fuera de la letra y se ata con hilos largos. */
  satellite: boolean;
}

/** Rejilla de muestreo de la letra, en píxeles. */
const STEP = 6;
/** Cuántos nodos interiores se conservan: pocos, o se emborrona la letra. */
const INSIDE_KEEP = 0.42;
/**
 * Alcance de las aristas. Largo a propósito: así se forman los triángulos que
 * cruzan la letra de lado a lado, en vez de una costura de puntos pegados.
 */
const LINK = 24;
const MAX_LINKS = 6;
/** Nodos sueltos alrededor de las letras, atados con hilos tenues. */
const SATELLITES = 20;
const SATELLITE_LINK = 96;

/** Onda que recorre la malla, y cuánto se aparta cada nodo del puntero. */
const WAVE = 5.2;
const WAVE_SPEED = 0.0016;
const PUSH = 90;

type Rgb = readonly [number, number, number];

const CYAN: Rgb = [95, 226, 244];
const VIOLET: Rgb = [138, 146, 255];
const MAGENTA: Rgb = [232, 92, 200];

/** Degradado vertical del acrónimo (arriba, medio, abajo): cian, violeta, magenta. */
const SIGNAL: readonly [Rgb, Rgb, Rgb] = [CYAN, VIOLET, MAGENTA];

function tint(depth: number): [number, number, number] {
  const [top, mid, bottom] = SIGNAL;
  const [from, to, t] = depth < 0.5 ? [top, mid, depth * 2] : [mid, bottom, (depth - 0.5) * 2];
  return [
    Math.round(from[0] + (to[0] - from[0]) * t),
    Math.round(from[1] + (to[1] - from[1]) * t),
    Math.round(from[2] + (to[2] - from[2]) * t),
  ];
}

function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

interface MeshProps {
  /** Las tres letras: una debajo de otra (`column`) o en fila, como una palabra (`row`). */
  letters: readonly string[];
  direction?: 'column' | 'row';
  /**
   * Variable CSS con la familia tipográfica (p. ej. `--font-grotesk`). El
   * lienzo no entiende `var()`, así que se resuelve al rasterizar.
   */
  fontVar: string;
  className?: string;
}

/**
 * El acrónimo de EVA dibujado como una red: las letras se rasterizan en un
 * lienzo oculto, se muestrean en nodos y se unen con aristas largas, que es lo
 * que forma los triángulos que cruzan cada letra. Alrededor flotan satélites
 * atados con hilos tenues.
 *
 * Toda la malla ondea con una misma onda viajera — se mueve como una tela, no
 * como un enjambre de puntos sueltos — y se aparta del puntero.
 *
 * Rasterizar el texto en vez de escribir polígonos a mano deja que la forma la
 * ponga la tipografía: si cambia la fuente, cambian las letras.
 */
export function EvaAcronymMesh({
  letters,
  fontVar,
  direction = 'column',
  className = 'acronym__canvas',
}: MeshProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /* Las letras llegan como un array nuevo en cada render: lo que importa es su contenido. */
  const word = letters.join('');

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    const glyphs = [...word];
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let nodes: Node[] = [];
    let links: [number, number][] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let stopped = false;
    let onScreen = true;

    /** Rasteriza las letras y saca de ahí los nodos y sus vecinos. */
    const build = () => {
      const box = canvas.getBoundingClientRect();
      if (box.width < 4 || box.height < 4) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.75);
      width = box.width;
      height = box.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      const scratch = document.createElement('canvas');
      scratch.width = Math.round(width);
      scratch.height = Math.round(height);
      const paint = scratch.getContext('2d', { willReadFrequently: true });
      if (!paint) return;

      const family =
        getComputedStyle(document.documentElement).getPropertyValue(fontVar).trim() || 'sans-serif';
      // Cada letra tiene su celda: una fila por letra en columna, una columna por letra en fila.
      const cellW = direction === 'row' ? width / glyphs.length : width;
      const cellH = direction === 'row' ? height : height / glyphs.length;

      // Se mide a 100px y se escala: la letra llena su celda por donde tope.
      paint.font = `700 100px ${family}`;
      const widest = Math.max(...glyphs.map((letter) => paint.measureText(letter).width));
      const size = Math.min((cellW * 0.94) / (widest / 100), cellH * 0.94);

      paint.fillStyle = '#fff';
      paint.textAlign = 'center';
      paint.textBaseline = 'middle';
      paint.font = `700 ${size}px ${family}`;
      glyphs.forEach((letter, at) => {
        if (direction === 'row') paint.fillText(letter, cellW * (at + 0.5), height / 2);
        else paint.fillText(letter, width / 2, cellH * (at + 0.5));
      });

      const image = paint.getImageData(0, 0, scratch.width, scratch.height).data;
      const opaque = (x: number, y: number) => {
        if (x < 0 || y < 0 || x >= scratch.width || y >= scratch.height) return false;
        return image[(Math.round(y) * scratch.width + Math.round(x)) * 4 + 3] > 128;
      };

      const random = seeded(0xe7a01);
      nodes = [];

      for (let y = 0; y < scratch.height; y += STEP) {
        for (let x = 0; x < scratch.width; x += STEP) {
          if (!opaque(x, y)) continue;
          // Borde = tiene al menos un vecino fuera de la letra.
          const edge =
            !opaque(x - STEP, y) ||
            !opaque(x + STEP, y) ||
            !opaque(x, y - STEP) ||
            !opaque(x, y + STEP);
          // La silueta se conserva entera; del relleno sólo unos pocos.
          if (!edge && random() > INSIDE_KEEP) continue;
          const jx = x + (random() - 0.5) * STEP * 0.9;
          const jy = y + (random() - 0.5) * STEP * 0.9;
          nodes.push({
            homeX: jx,
            homeY: jy,
            x: jx,
            y: jy,
            phase: random() * Math.PI * 2,
            depth: direction === 'row' ? Math.min(1, Math.max(0, jx / width)) : Math.min(1, Math.max(0, jy / height)),
            edge,
            satellite: false,
          });
        }
      }

      const letterCount = nodes.length;

      // Satélites: puntos sueltos alrededor, para que la red no acabe en el
      // contorno de la letra.
      for (let i = 0; i < SATELLITES; i++) {
        const sx = random() * width;
        const sy = random() * height;
        nodes.push({
          homeX: sx,
          homeY: sy,
          x: sx,
          y: sy,
          phase: random() * Math.PI * 2,
          depth: direction === 'row' ? Math.min(1, Math.max(0, sx / width)) : Math.min(1, Math.max(0, sy / height)),
          edge: false,
          satellite: true,
        });
      }

      // Vecinos calculados una vez: por fotograma sólo se mueven los nodos.
      links = [];
      const degree = new Array(nodes.length).fill(0);
      for (let i = 0; i < letterCount; i++) {
        for (let j = i + 1; j < letterCount; j++) {
          if (degree[i] >= MAX_LINKS) break;
          if (degree[j] >= MAX_LINKS) continue;
          const dx = nodes[i].homeX - nodes[j].homeX;
          const dy = nodes[i].homeY - nodes[j].homeY;
          if (dx * dx + dy * dy > LINK * LINK) continue;
          links.push([i, j]);
          degree[i]++;
          degree[j]++;
        }
      }

      // Cada satélite se ata a las dos letras más cercanas que tenga a tiro.
      for (let s = letterCount; s < nodes.length; s++) {
        const near: { at: number; distance: number }[] = [];
        for (let i = 0; i < letterCount; i++) {
          const distance = Math.hypot(nodes[s].homeX - nodes[i].homeX, nodes[s].homeY - nodes[i].homeY);
          if (distance < SATELLITE_LINK) near.push({ at: i, distance });
        }
        near.sort((a, b) => a.distance - b.distance);
        for (const { at } of near.slice(0, 2)) links.push([s, at]);
      }
    };

    /** Onda viajera: todos los nodos se mueven con la misma tela. */
    const swell = (node: Node, time: number) => {
      if (reduced.matches) return { x: node.homeX, y: node.homeY };
      const travel = node.homeX * 0.026 + node.homeY * 0.05 - time * WAVE_SPEED;
      const amplitude = node.satellite ? WAVE * 1.5 : WAVE;
      return {
        x: node.homeX + Math.sin(travel) * amplitude,
        y: node.homeY + Math.cos(travel * 0.8 + node.phase * 0.35) * amplitude * 0.62,
      };
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);
      const box = canvas.getBoundingClientRect();
      const px = pointerSignal.active ? pointerSignal.x - box.left : -9999;
      const py = pointerSignal.active ? pointerSignal.y - box.top : -9999;

      for (const node of nodes) {
        const { x: wx, y: wy } = swell(node, time);
        let x = wx;
        let y = wy;

        // El puntero abre un hueco en la malla y la deja volver.
        const dx = x - px;
        const dy = y - py;
        const distance = Math.hypot(dx, dy);
        if (distance < PUSH) {
          const force = (1 - distance / PUSH) ** 2 * 26;
          x += (dx / (distance || 1)) * force;
          y += (dy / (distance || 1)) * force;
        }
        node.x = x;
        node.y = y;
      }

      context.lineWidth = 0.65;
      for (const [a, b] of links) {
        const first = nodes[a];
        const second = nodes[b];
        const [r, g, bl] = tint((first.depth + second.depth) / 2);
        const span = Math.hypot(first.x - second.x, first.y - second.y);
        // Los hilos largos se apagan: dan profundidad sin ensuciar la letra.
        const fade = Math.max(0, 1 - span / (LINK * 2.4));
        const alpha = (first.satellite || second.satellite ? 0.13 : 0.4) * fade;
        if (alpha < 0.012) continue;
        context.strokeStyle = `rgba(${r}, ${g}, ${bl}, ${alpha})`;
        context.beginPath();
        context.moveTo(first.x, first.y);
        context.lineTo(second.x, second.y);
        context.stroke();
      }

      /* Dos discos por nodo: uno grande y casi transparente hace de halo, el
         otro marca el punto. Sale más barato que shadowBlur en cada nodo. */
      for (const node of nodes) {
        const [r, g, b] = tint(node.depth);
        const pulse = reduced.matches ? 1 : 0.75 + Math.sin(time * 0.002 + node.phase) * 0.25;
        const weight = node.satellite ? 0.4 : node.edge ? 1 : 0.6;
        context.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.16 * pulse * weight})`;
        context.beginPath();
        context.arc(node.x, node.y, 4.4 * weight, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.92 * pulse * weight})`;
        context.beginPath();
        context.arc(node.x, node.y, node.edge ? 1.35 : 1, 0, Math.PI * 2);
        context.fill();
      }
    };

    const tick = (time: number) => {
      if (stopped) return;
      draw(time);
      frame = requestAnimationFrame(tick);
    };

    /* Fuera de pantalla no se dibuja. */
    const start = () => {
      cancelAnimationFrame(frame);
      if (document.hidden || !onScreen) return;
      frame = requestAnimationFrame(tick);
    };

    const rebuild = () => {
      build();
      draw(performance.now());
    };

    // La tipografía tiene que estar cargada o se rasteriza la de reserva.
    void document.fonts.ready.then(() => {
      if (stopped) return;
      rebuild();
      start();
    });

    const observer = new ResizeObserver(rebuild);
    observer.observe(canvas);
    const spy = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        start();
      },
      { rootMargin: '120px' },
    );
    spy.observe(canvas);
    document.addEventListener('visibilitychange', start);

    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      spy.disconnect();
      document.removeEventListener('visibilitychange', start);
    };
  }, [word, fontVar, direction]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}

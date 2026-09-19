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
}

/** Rejilla de muestreo de la letra, en píxeles. Menos = más nodos. */
const STEP = 5;
/** Hasta dónde se unen dos nodos con una línea. */
const LINK = 19;
/** Aristas máximas por nodo: sin esto el trazo se emborrona. */
const MAX_LINKS = 5;
/** Amplitud de la deriva y radio de empuje del puntero. */
const DRIFT = 3.4;
const PUSH = 90;

const TOP = [95, 226, 244] as const;
const MID = [138, 146, 255] as const;
const BOTTOM = [232, 92, 200] as const;

/** Color del degradado vertical: cian arriba, violeta en medio, magenta abajo. */
function tint(depth: number): [number, number, number] {
  const [from, to, t] =
    depth < 0.5 ? [TOP, MID, depth * 2] : [MID, BOTTOM, (depth - 0.5) * 2];
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
  /** Las tres letras, una debajo de otra. */
  letters: readonly string[];
  /**
   * Variable CSS con la familia tipográfica (p. ej. `--font-orbitron`). El
   * lienzo no entiende `var()`, así que se resuelve al rasterizar.
   */
  fontVar: string;
}

/**
 * El acrónimo de EVA dibujado como una red: las letras se rasterizan en un
 * lienzo oculto, se muestrean en nodos y se unen entre vecinos. Los nodos
 * derivan despacio y se apartan del puntero, así que la estructura respira.
 *
 * Rasterizar el texto en vez de escribir polígonos a mano deja que la forma la
 * ponga la tipografía: si cambia la fuente, cambian las letras.
 */
export function EvaAcronymMesh({ letters, fontVar }: MeshProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let nodes: Node[] = [];
    let links: [number, number][] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let stopped = false;

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
      const rowHeight = height / letters.length;

      // Se mide a 100px y se escala: la letra llena el lienzo por donde tope.
      paint.font = `800 100px ${family}`;
      const widest = Math.max(...letters.map((letter) => paint.measureText(letter).width));
      const size = Math.min((width * 0.98) / (widest / 100), rowHeight * 0.94);

      paint.fillStyle = '#fff';
      paint.textAlign = 'center';
      paint.textBaseline = 'middle';
      paint.font = `800 ${size}px ${family}`;
      letters.forEach((letter, row) => {
        paint.fillText(letter, width / 2, rowHeight * (row + 0.5));
      });

      const pixels = paint.getImageData(0, 0, scratch.width, scratch.height).data;
      const random = seeded(0xe7a01);
      nodes = [];
      for (let y = 0; y < scratch.height; y += STEP) {
        for (let x = 0; x < scratch.width; x += STEP) {
          if (pixels[(y * scratch.width + x) * 4 + 3] < 128) continue;
          // Un poco de desorden: una rejilla perfecta no parece una red.
          const jx = x + (random() - 0.5) * STEP * 1.2;
          const jy = y + (random() - 0.5) * STEP * 1.2;
          nodes.push({
            homeX: jx,
            homeY: jy,
            x: jx,
            y: jy,
            phase: random() * Math.PI * 2,
            depth: Math.min(1, Math.max(0, jy / height)),
          });
        }
      }

      // Vecinos calculados una vez: por fotograma sólo se mueven los nodos.
      links = [];
      const degree = new Array(nodes.length).fill(0);
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
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
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);
      const box = canvas.getBoundingClientRect();
      const px = pointerSignal.active ? pointerSignal.x - box.left : -9999;
      const py = pointerSignal.active ? pointerSignal.y - box.top : -9999;

      for (const node of nodes) {
        const wobble = reduced.matches ? 0 : DRIFT;
        let x = node.homeX + Math.sin(time * 0.0007 + node.phase) * wobble;
        let y = node.homeY + Math.cos(time * 0.0009 + node.phase * 1.7) * wobble;

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

      context.lineWidth = 0.7;
      for (const [a, b] of links) {
        const first = nodes[a];
        const second = nodes[b];
        const [r, g, bl] = tint((first.depth + second.depth) / 2);
        const stretch = Math.hypot(first.x - second.x, first.y - second.y);
        const fade = Math.max(0, 1 - stretch / (LINK * 2.2));
        context.strokeStyle = `rgba(${r}, ${g}, ${bl}, ${0.42 * fade})`;
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
        context.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.16 * pulse})`;
        context.beginPath();
        context.arc(node.x, node.y, 4.2, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.92 * pulse})`;
        context.beginPath();
        context.arc(node.x, node.y, 1.25, 0, Math.PI * 2);
        context.fill();
      }
    };

    const tick = (time: number) => {
      if (stopped) return;
      draw(time);
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      cancelAnimationFrame(frame);
      if (document.hidden) return;
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
    document.addEventListener('visibilitychange', start);

    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener('visibilitychange', start);
    };
  }, [letters, fontVar]);

  return <canvas ref={canvasRef} className="acronym__canvas" aria-hidden="true" />;
}

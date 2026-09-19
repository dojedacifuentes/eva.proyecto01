'use client';

import { useEffect, useRef } from 'react';
import { sequence } from '@/lib/genome';
import { pointerSignal } from '@/lib/pointer';

const COMPLEMENT: Record<string, string> = { A: 'T', T: 'A', C: 'G', G: 'C' };

const MAGENTA = '240, 122, 185';
const VIOLET = '154, 141, 255';
const WHITE = '233, 226, 255';

/** Separación entre pares de bases, en píxeles. */
const PAIR_GAP = 26;
/** Píxeles por vuelta completa de la hélice. */
const TURN = 300;
/** Avance de la lectura, en píxeles por segundo: despacio, como una cinta. */
const SPEED = 16;
/** A esta distancia del puntero un par de bases se enciende. */
const REACH = 150;

/**
 * El genoma de EVA a la vista: la misma secuencia de 600 bases del genoma
 * digital, tendida en horizontal como una doble hélice plana que se lee de
 * corrido. Es la presencia de la subsección reservada (01.11): no le asigna
 * tema ni interacción propia, sólo deja ver que la secuencia sigue pasando por
 * un sitio que todavía no tiene nombre.
 *
 * Lienzo 2D, como el acrónimo y el fondo: nada de WebGL para una cinta. Se
 * detiene fuera de pantalla y con la pestaña oculta; con movimiento reducido
 * dibuja un único fotograma.
 */
export function GenomeStrand({ label }: { label: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let width = 0;
    let height = 0;
    let frame = 0;
    let last = 0;
    let offset = 0;
    let visible = false;
    let stopped = false;

    const resize = () => {
      const box = canvas.getBoundingClientRect();
      if (box.width < 4 || box.height < 4) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.75);
      width = box.width;
      height = box.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      draw();
    };

    /** Un filamento: dos pasadas, una ancha y tenue que hace de halo y otra fina. */
    const strand = (phase: number, rgb: string) => {
      const mid = height / 2;
      const amplitude = Math.min(height * 0.3, 78);
      for (const [lineWidth, alpha] of [
        [7, 0.08],
        [1.6, 0.9],
      ] as const) {
        context.lineWidth = lineWidth;
        context.strokeStyle = `rgba(${rgb}, ${alpha})`;
        context.beginPath();
        for (let x = -8; x <= width + 8; x += 6) {
          const angle = ((x + offset) / TURN) * Math.PI * 2 + phase;
          const y = mid + Math.sin(angle) * amplitude;
          if (x === -8) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.stroke();
      }
    };

    const draw = () => {
      if (width === 0) return;
      context.clearRect(0, 0, width, height);
      const mid = height / 2;
      const amplitude = Math.min(height * 0.3, 78);
      const box = canvas.getBoundingClientRect();
      const px = pointerSignal.active ? pointerSignal.x - box.left : -9999;
      const py = pointerSignal.active ? pointerSignal.y - box.top : -9999;

      // Pares de bases: un travesaño por base, con su letra y la complementaria.
      const first = Math.floor(offset / PAIR_GAP);
      const shift = offset % PAIR_GAP;
      context.font = '600 10px ui-monospace, "JetBrains Mono", monospace';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      for (let i = -1; i * PAIR_GAP - shift <= width + PAIR_GAP; i++) {
        const x = i * PAIR_GAP - shift;
        const angle = ((x + offset) / TURN) * Math.PI * 2;
        const top = mid + Math.sin(angle) * amplitude;
        const bottom = mid + Math.sin(angle + Math.PI) * amplitude;
        // De canto (cos ≈ 0) el par casi no se ve; de frente, entero.
        const facing = Math.abs(Math.cos(angle));
        const near = Math.max(0, 1 - Math.hypot(x - px, mid - py) / REACH);
        const alpha = 0.1 + facing * 0.34 + near * 0.5;

        const gradient = context.createLinearGradient(x, top, x, bottom);
        gradient.addColorStop(0, `rgba(${MAGENTA}, ${alpha})`);
        gradient.addColorStop(1, `rgba(${VIOLET}, ${alpha})`);
        context.strokeStyle = gradient;
        context.lineWidth = 1 + near * 1.2;
        context.beginPath();
        context.moveTo(x, top);
        context.lineTo(x, bottom);
        context.stroke();

        const at = (((first + i) % sequence.length) + sequence.length) % sequence.length;
        const base = sequence[at];
        const outward = top < bottom ? -1 : 1;
        context.fillStyle = `rgba(${near > 0.05 ? WHITE : MAGENTA}, ${0.28 + facing * 0.3 + near * 0.42})`;
        context.fillText(base, x, top + outward * 11);
        context.fillStyle = `rgba(${near > 0.05 ? WHITE : VIOLET}, ${0.28 + facing * 0.3 + near * 0.42})`;
        context.fillText(COMPLEMENT[base], x, bottom - outward * 11);

        for (const [y, rgb] of [
          [top, MAGENTA],
          [bottom, VIOLET],
        ] as const) {
          context.fillStyle = `rgba(${rgb}, ${0.5 + near * 0.5})`;
          context.beginPath();
          context.arc(x, y, 2 + near * 1.6, 0, Math.PI * 2);
          context.fill();
        }
      }

      strand(0, MAGENTA);
      strand(Math.PI, VIOLET);
    };

    const tick = (now: number) => {
      if (stopped) return;
      const delta = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;
      offset += delta * SPEED;
      draw();
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      cancelAnimationFrame(frame);
      last = 0;
      if (reduced.matches || document.hidden || !visible) {
        draw();
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    const spy = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        start();
      },
      { rootMargin: '120px' },
    );
    spy.observe(canvas);
    document.addEventListener('visibilitychange', start);
    reduced.addEventListener('change', start);
    resize();

    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      spy.disconnect();
      document.removeEventListener('visibilitychange', start);
      reduced.removeEventListener('change', start);
    };
  }, []);

  return (
    <figure className="strand">
      <canvas ref={canvasRef} className="strand__canvas" aria-hidden="true" />
      <figcaption className="strand__label mono">{label}</figcaption>
    </figure>
  );
}

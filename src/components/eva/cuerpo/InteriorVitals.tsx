'use client';

import { useEffect, useRef } from 'react';
import { play } from '@/lib/sound';
import { bodySignal } from './body-signal';
import { BPM, ecg } from './pulse';

/** Muestras a lo ancho del trazo, y cuántos latidos caben en él. */
const POINTS = 240;
const BEATS_ACROSS = 2.6;
/** Latidos que suenan cada vez que se pide sonificar. */
const AUDIBLE_BEATS = 6;

const CYAN = '63, 216, 238';
const MAGENTA = '240, 122, 185';

interface InteriorVitalsProps {
  /** `false` detiene el reloj: fuera de pantalla o tapado, el corazón no corre. */
  active: boolean;
  reduced: boolean;
  /** Contador: al subir, los próximos latidos suenan (si el sonido está encendido). */
  sonify: number;
  label: string;
}

/**
 * El trazo cardíaco del modelo interior, en un lienzo 2D, y el dueño del
 * latido: avanza la fase que la escena 3D sólo lee (`bodySignal.heart`), acerca
 * el ritmo a su objetivo sin saltos y apaga poco a poco el latido forzado.
 * Existe con WebGL y sin él, así que el pulso no depende de la escena.
 *
 * El trazo PQRST es el de `pulse.ts` (adaptado de HÆMA, MIT). Es un dibujo: no
 * mide a nadie. Con movimiento reducido se pinta quieto, una sola vez.
 */
export function InteriorVitals({ active, reduced, sonify, label }: InteriorVitalsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audible = useRef(0);

  useEffect(() => {
    if (sonify > 0) audible.current = AUDIBLE_BEATS;
  }, [sonify]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    let width = 0;
    let height = 0;
    let frame = 0;
    let last = 0;
    let stopped = false;
    let heard = bodySignal.heart.beats;
    const trace: number[] = [];

    const draw = () => {
      if (width === 0) return;
      context.clearRect(0, 0, width, height);

      // Retícula de instrumento, muy tenue.
      context.strokeStyle = `rgba(${CYAN}, 0.07)`;
      context.lineWidth = 1;
      context.beginPath();
      for (let x = 0.5; x < width; x += 14) {
        context.moveTo(x, 0);
        context.lineTo(x, height);
      }
      for (let y = 0.5; y < height; y += 14) {
        context.moveTo(0, y);
        context.lineTo(width, y);
      }
      context.stroke();

      if (trace.length < 2) return;
      const hurry = Math.min(1, Math.max(0, (bodySignal.bpm - BPM.rest) / (BPM.fast - BPM.rest)));
      const rgb = hurry > 0.35 ? MAGENTA : CYAN;
      const base = height * 0.66;
      const reach = height * 0.5;
      const at = (index: number) => ({
        x: (index / (POINTS - 1)) * width,
        y: base - trace[index] * reach,
      });

      // Dos pasadas: una ancha y tenue que hace de halo, otra fina. Más barato que shadowBlur.
      for (const [lineWidth, alpha] of [
        [5, 0.12],
        [1.6, 0.95],
      ] as const) {
        context.lineWidth = lineWidth;
        context.lineJoin = 'round';
        context.strokeStyle = `rgba(${rgb}, ${alpha})`;
        context.beginPath();
        for (let i = 0; i < trace.length; i++) {
          const point = at(i);
          if (i === 0) context.moveTo(point.x, point.y);
          else context.lineTo(point.x, point.y);
        }
        context.stroke();
      }

      const head = at(trace.length - 1);
      context.fillStyle = 'rgba(238, 250, 255, 0.95)';
      context.beginPath();
      context.arc(head.x, head.y, 2.2, 0, Math.PI * 2);
      context.fill();
    };

    /** El trazo quieto: los latidos que caben, dibujados de una vez. */
    const still = () => {
      trace.length = 0;
      for (let i = 0; i < POINTS; i++) trace.push(ecg(((i / POINTS) * BEATS_ACROSS) % 1));
      draw();
    };

    const resize = () => {
      const box = canvas.getBoundingClientRect();
      if (box.width < 4 || box.height < 4) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = box.width;
      height = box.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      if (reduced) still();
      else draw();
    };

    const tick = (now: number) => {
      if (stopped) return;
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;

      // El ritmo persigue a su objetivo y el latido forzado se apaga solo.
      bodySignal.bpm += (bodySignal.targetBpm - bodySignal.bpm) * Math.min(1, dt * 1.8);
      bodySignal.force += (1 - bodySignal.force) * Math.min(1, dt * 1.3);

      const before = bodySignal.heart.phase;
      bodySignal.heart.advance(dt, bodySignal.bpm);
      // Por el contador y no por la fase: un latido forzado desde un botón también suena.
      if (bodySignal.heart.beats !== heard) {
        heard = bodySignal.heart.beats;
        if (audible.current > 0) {
          audible.current -= 1;
          play('beat');
        }
      }

      const turned = (dt * bodySignal.bpm) / 60;
      const steps = Math.max(1, Math.round((turned * POINTS) / BEATS_ACROSS));
      for (let i = 1; i <= steps; i++) {
        trace.push(ecg((before + (turned * i) / steps) % 1) * Math.min(1.35, bodySignal.force));
        if (trace.length > POINTS) trace.shift();
      }

      draw();
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      cancelAnimationFrame(frame);
      last = 0;
      if (reduced) {
        still();
        return;
      }
      if (!active || document.hidden) return;
      frame = requestAnimationFrame(tick);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    document.addEventListener('visibilitychange', start);
    resize();
    start();

    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener('visibilitychange', start);
    };
  }, [active, reduced]);

  return (
    <figure className="vitals">
      <canvas ref={canvasRef} className="vitals__trace" aria-hidden="true" />
      <figcaption className="vitals__label mono">{label}</figcaption>
    </figure>
  );
}

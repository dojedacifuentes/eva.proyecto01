'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

const LINK_DISTANCE = 130;
const POINTER_DISTANCE = 190;

/**
 * Fondo reactivo: una luz que sigue al puntero (variables CSS) y un campo de
 * partículas escaso en un único canvas. Capa decorativa: no captura eventos y
 * la página se lee igual sin ella.
 *
 * - Un solo requestAnimationFrame, posiciones en refs, sin estado de React.
 * - Se pausa con la pestaña oculta; densidad reducida en pantallas chicas.
 * - Con movimiento reducido dibuja un único fotograma estático.
 */
export function EvaField({ particles = true }: { particles?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    const root = document.documentElement;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = { x: -9999, y: -9999, active: false };
    let dots: Particle[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      const count = particles ? Math.min(70, Math.round((width * height) / 26000)) : 0;
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        r: Math.random() * 1.1 + 0.4,
      }));
      if (reduced.matches) draw();
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);

      for (const dot of dots) {
        context.beginPath();
        context.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
        context.fillStyle = 'rgba(190, 225, 235, 0.42)';
        context.fill();
      }

      context.lineWidth = 1;
      for (let i = 0; i < dots.length; i++) {
        const a = dots[i];
        for (let j = i + 1; j < dots.length; j++) {
          const b = dots[j];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          if (distance < LINK_DISTANCE) {
            context.strokeStyle = `rgba(63, 216, 238, ${0.1 * (1 - distance / LINK_DISTANCE)})`;
            context.beginPath();
            context.moveTo(a.x, a.y);
            context.lineTo(b.x, b.y);
            context.stroke();
          }
        }
        if (pointer.active) {
          const distance = Math.hypot(a.x - pointer.x, a.y - pointer.y);
          if (distance < POINTER_DISTANCE) {
            context.strokeStyle = `rgba(154, 141, 255, ${0.38 * (1 - distance / POINTER_DISTANCE)})`;
            context.beginPath();
            context.moveTo(a.x, a.y);
            context.lineTo(pointer.x, pointer.y);
            context.stroke();
          }
        }
      }
    };

    const tick = () => {
      for (const dot of dots) {
        dot.x += dot.vx;
        dot.y += dot.vy;
        if (dot.x < -10) dot.x = width + 10;
        if (dot.x > width + 10) dot.x = -10;
        if (dot.y < -10) dot.y = height + 10;
        if (dot.y > height + 10) dot.y = -10;
      }
      draw();
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      cancelAnimationFrame(frame);
      if (reduced.matches || document.hidden) {
        draw();
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    const onPointer = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
      root.style.setProperty('--px', `${event.clientX}px`);
      root.style.setProperty('--py', `${event.clientY}px`);
    };
    const onLeave = () => {
      pointer.active = false;
    };

    resize();
    start();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointer, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    document.addEventListener('visibilitychange', start);
    reduced.addEventListener('change', start);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointer);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', start);
      reduced.removeEventListener('change', start);
    };
  }, [particles]);

  return (
    <div aria-hidden="true" className="field">
      <canvas ref={canvasRef} />
    </div>
  );
}

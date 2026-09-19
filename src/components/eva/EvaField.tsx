'use client';

import { useEffect, useRef } from 'react';
import { fieldSignal } from '@/lib/field';
import { emitPulse, pointerSignal, toRgb } from '@/lib/pointer';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  /** 0 = punto redondo, 1 = cuadrado. Sigue al estado del cursor. */
  morph: number;
}

const LINK_DISTANCE = 132;
const POINTER_DISTANCE = 200;
const PULSE_LIFE = 900;
const PULSE_SPEED = 0.42;
const IDLE_RGB = '63, 216, 238';

/**
 * Fondo reactivo: una luz que sigue al puntero (variables CSS) y un campo de
 * partículas escaso en un único canvas. Capa decorativa: no captura eventos y
 * la página se lee igual sin ella.
 *
 * Las partículas se enganchan al puntero, se vuelven cuadradas cuando el cursor
 * se posa sobre algo interactivo y se apartan con la onda de cada clic.
 *
 * El recorrido también le habla (`lib/field`): cada lugar tiñe los hilos con su
 * acento, un lugar clausurado lo frena hasta casi detenerlo (la v6 lo usaba en
 * Vigilancia; hoy no hay ninguno), y las acciones del genoma y del cuerpo lo
 * sacuden un instante. La quietud es una frenada que se ve ocurrir, no un
 * interruptor.
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
    let dots: Particle[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    /** Quietud vigente, 0–1: persigue despacio a `fieldSignal.calm`. */
    let calm = 0;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      const count = particles ? Math.min(78, Math.round((width * height) / 24000)) : 0;
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        r: Math.random() * 1.1 + 0.4,
        morph: 0,
      }));
      if (reduced.matches) draw();
    };

    /** Punto o cuadrado según cuánto se haya enganchado al cursor. */
    const drawDot = (dot: Particle, rgb: string) => {
      const size = dot.r * (1 + dot.morph * 0.55);
      context.fillStyle =
        dot.morph > 0.04 ? `rgba(${rgb}, ${0.42 + dot.morph * 0.5})` : 'rgba(190, 225, 235, 0.42)';
      if (dot.morph > 0.5) {
        context.fillRect(dot.x - size, dot.y - size, size * 2, size * 2);
        return;
      }
      context.beginPath();
      context.arc(dot.x, dot.y, size, 0, Math.PI * 2);
      context.fill();
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);

      const { x: px, y: py, active, locked } = pointerSignal;
      const rgb = locked && pointerSignal.accent ? toRgb(pointerSignal.accent) : IDLE_RGB;

      for (const dot of dots) drawDot(dot, rgb);

      context.lineWidth = 1;
      for (let i = 0; i < dots.length; i++) {
        const a = dots[i];
        for (let j = i + 1; j < dots.length; j++) {
          const b = dots[j];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          if (distance < LINK_DISTANCE) {
            context.strokeStyle = `rgba(${fieldSignal.rgb}, ${0.1 * (1 - distance / LINK_DISTANCE)})`;
            context.beginPath();
            context.moveTo(a.x, a.y);
            context.lineTo(b.x, b.y);
            context.stroke();
          }
        }
        if (!active) continue;
        const distance = Math.hypot(a.x - px, a.y - py);
        if (distance < POINTER_DISTANCE) {
          const near = 1 - distance / POINTER_DISTANCE;
          context.strokeStyle = locked
            ? `rgba(${rgb}, ${0.62 * near})`
            : `rgba(154, 141, 255, ${0.38 * near})`;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(px, py);
          context.stroke();
        }
      }

      // Onda de clic: un anillo que se abre y se apaga.
      const now = performance.now();
      for (const pulse of pointerSignal.pulses) {
        const age = now - pulse.born;
        if (age > PULSE_LIFE) continue;
        const progress = age / PULSE_LIFE;
        context.strokeStyle = `rgba(${rgb}, ${0.5 * (1 - progress)})`;
        context.lineWidth = 1.5 * (1 - progress) + 0.3;
        context.beginPath();
        context.arc(pulse.x, pulse.y, age * PULSE_SPEED, 0, Math.PI * 2);
        context.stroke();
      }
      context.lineWidth = 1;
    };

    const tick = () => {
      const { x: px, y: py, active, locked } = pointerSignal;
      const now = performance.now();

      // La quietud llega y se va despacio: unos dos segundos de frenada visible.
      calm += (fieldSignal.calm - calm) * 0.02;
      const drift = 1 - calm * 0.94;
      const surge = fieldSignal.surge;
      fieldSignal.surge = surge < 0.01 ? 0 : surge * 0.93;

      for (const dot of dots) {
        // Una sacudida del genoma: un empujón al azar que se disipa solo.
        if (surge > 0.01) {
          dot.vx += (Math.random() - 0.5) * surge * 0.7;
          dot.vy += (Math.random() - 0.5) * surge * 0.7;
        }

        if (active) {
          const dx = px - dot.x;
          const dy = py - dot.y;
          const distance = Math.hypot(dx, dy) || 1;
          if (distance < POINTER_DISTANCE) {
            // Enganche suave hacia el puntero; más firme cuando hay objetivo.
            const pull = (locked ? 0.021 : 0.008) * (1 - distance / POINTER_DISTANCE);
            dot.vx += (dx / distance) * pull;
            dot.vy += (dy / distance) * pull;
            dot.morph += ((locked ? 1 : 0) - dot.morph) * 0.08;
          } else {
            dot.morph += (0 - dot.morph) * 0.06;
          }
        } else if (dot.morph > 0.001) {
          dot.morph += (0 - dot.morph) * 0.06;
        }

        // Empuje del frente de cada onda de clic.
        for (const pulse of pointerSignal.pulses) {
          const age = now - pulse.born;
          if (age > PULSE_LIFE) continue;
          const dx = dot.x - pulse.x;
          const dy = dot.y - pulse.y;
          const distance = Math.hypot(dx, dy) || 1;
          if (Math.abs(distance - age * PULSE_SPEED) < 26) {
            const push = 0.36 * (1 - age / PULSE_LIFE);
            dot.vx += (dx / distance) * push;
            dot.vy += (dy / distance) * push;
          }
        }

        dot.vx *= 0.965;
        dot.vy *= 0.965;
        const speed = Math.hypot(dot.vx, dot.vy);
        if (speed < 0.05) {
          // Nunca se queda quieto: recupera su deriva de fondo.
          dot.vx += (Math.random() - 0.5) * 0.03;
          dot.vy += (Math.random() - 0.5) * 0.03;
        } else if (speed > 1.6) {
          dot.vx = (dot.vx / speed) * 1.6;
          dot.vy = (dot.vy / speed) * 1.6;
        }

        // En quietud conserva su velocidad pero apenas avanza: al salir, retoma donde iba.
        dot.x += dot.vx * drift;
        dot.y += dot.vy * drift;
        if (dot.x < -10) dot.x = width + 10;
        if (dot.x > width + 10) dot.x = -10;
        if (dot.y < -10) dot.y = height + 10;
        if (dot.y > height + 10) dot.y = -10;
      }

      if (pointerSignal.pulses.length) {
        pointerSignal.pulses = pointerSignal.pulses.filter(
          (pulse) => now - pulse.born <= PULSE_LIFE,
        );
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
      pointerSignal.x = event.clientX;
      pointerSignal.y = event.clientY;
      pointerSignal.active = true;
      root.style.setProperty('--px', `${event.clientX}px`);
      root.style.setProperty('--py', `${event.clientY}px`);
      if (!reduced.matches) {
        root.style.setProperty('--nx', ((event.clientX / width) * 2 - 1).toFixed(3));
        root.style.setProperty('--ny', ((event.clientY / height) * 2 - 1).toFixed(3));
      }
    };

    const onLeave = () => {
      pointerSignal.active = false;
      pointerSignal.locked = false;
    };

    /** Con el cursor propio apagado, el clic igual deja su onda. */
    const onDown = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      if (!root.classList.contains('eva-cursor')) emitPulse(event.clientX, event.clientY);
    };

    resize();
    start();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    root.addEventListener('pointerleave', onLeave);
    document.addEventListener('visibilitychange', start);
    reduced.addEventListener('change', start);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('pointerdown', onDown);
      root.removeEventListener('pointerleave', onLeave);
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

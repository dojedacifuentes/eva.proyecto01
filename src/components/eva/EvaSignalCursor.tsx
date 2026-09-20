'use client';

import { useEffect, useRef } from 'react';
import { ui } from '@/content/site';
import { emitPulse, pointerSignal } from '@/lib/pointer';

const INTERACTIVE = 'a, button, [data-cursor]';
/** Cuánto se estira el anillo con la velocidad del puntero. */
const STRETCH = 0.32;

/**
 * Cursor de señal de EVA: un anillo con retícula que sigue al puntero con
 * inercia, se estira en la dirección del movimiento y se convierte en cuadrado
 * sobre lo interactivo, enganchando el campo de partículas.
 *
 * Desde la v8.2 el cursor del sistema queda a la vista: el punto propio que lo
 * sustituía iba un fotograma por detrás y en equipos lentos se notaba como
 * retraso (encargo del propietario). El anillo es un acompañante, no el
 * cursor. Es un refuerzo, no una condición: sólo se activa con puntero fino y
 * sin movimiento reducido. En táctil no se monta nada.
 */
export function EvaSignalCursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!root || !ring || !label) return;

    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let frame = 0;
    let running = false;

    const render = () => {
      const dx = target.x - current.x;
      const dy = target.y - current.y;
      current.x += dx * 0.2;
      current.y += dy * 0.2;

      // Estiramiento direccional: rotar, escalar y desrotar deja la forma recta.
      const speed = Math.min(Math.hypot(dx, dy) / 42, 1);
      const angle = speed > 0.02 ? (Math.atan2(dy, dx) * 180) / Math.PI : 0;
      ring.style.transform =
        `translate3d(${current.x}px, ${current.y}px, 0) rotate(${angle}deg)` +
        ` scale(${1 + speed * STRETCH}, ${1 - speed * STRETCH * 0.7}) rotate(${-angle}deg)`;
      label.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;

      if (Math.abs(dx) + Math.abs(dy) > 0.1) {
        frame = requestAnimationFrame(render);
      } else {
        ring.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
        running = false;
      }
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      target.x = event.clientX;
      target.y = event.clientY;

      if (!root.classList.contains('is-visible')) {
        current.x = target.x;
        current.y = target.y;
        root.classList.add('is-visible');
      }
      if (!running) {
        running = true;
        frame = requestAnimationFrame(render);
      }
    };

    const onOver = (event: PointerEvent) => {
      const element = (event.target as Element | null)?.closest<HTMLElement>(INTERACTIVE);
      if (!element) {
        root.dataset.state = 'idle';
        label.textContent = ui.cursor.idle;
        root.style.removeProperty('--cursor-accent');
        pointerSignal.locked = false;
        pointerSignal.accent = '';
        return;
      }
      const external = element.dataset.cursor === 'external';
      root.dataset.state = external ? 'external' : 'link';
      label.textContent =
        element.dataset.cursorLabel ?? (external ? ui.cursor.external : ui.cursor.link);

      const accent = getComputedStyle(element).getPropertyValue('--accent');
      root.style.setProperty('--cursor-accent', accent);
      pointerSignal.locked = true;
      pointerSignal.accent = accent;
    };

    const onDown = (event: PointerEvent) => {
      root.classList.add('is-pressed');
      emitPulse(event.clientX, event.clientY);
    };
    const onUp = () => root.classList.remove('is-pressed');
    const onLeave = () => {
      root.classList.remove('is-visible');
      pointerSignal.locked = false;
    };

    const enable = () => {
      document.documentElement.classList.add('eva-cursor');
      window.addEventListener('pointermove', onMove, { passive: true });
      document.addEventListener('pointerover', onOver, { passive: true });
      window.addEventListener('pointerdown', onDown);
      window.addEventListener('pointerup', onUp);
      document.documentElement.addEventListener('pointerleave', onLeave);
    };

    const disable = () => {
      cancelAnimationFrame(frame);
      running = false;
      document.documentElement.classList.remove('eva-cursor');
      root.classList.remove('is-visible');
      pointerSignal.locked = false;
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };

    const sync = () => {
      disable();
      if (fine.matches && !reduced.matches) enable();
    };

    sync();
    fine.addEventListener('change', sync);
    reduced.addEventListener('change', sync);

    return () => {
      disable();
      fine.removeEventListener('change', sync);
      reduced.removeEventListener('change', sync);
    };
  }, []);

  return (
    <div ref={rootRef} aria-hidden="true" className="cursor" data-state="idle">
      <span ref={ringRef} className="cursor__ring">
        <span className="cursor__core">
          <span className="cursor__shape" />
          {(['tl', 'tr', 'bl', 'br'] as const).map((corner) => (
            <span key={corner} className={`cursor__bracket cursor__bracket--${corner}`} />
          ))}
        </span>
      </span>
      <span ref={labelRef} className="cursor__label mono">
        {ui.cursor.idle}
      </span>
    </div>
  );
}

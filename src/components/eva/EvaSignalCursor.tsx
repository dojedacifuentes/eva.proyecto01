'use client';

import { useEffect, useRef } from 'react';
import { ui } from '@/content/site';

const INTERACTIVE = 'a, button, [data-cursor]';

/**
 * Cursor de señal de EVA: punto exacto + anillo con retícula que lo sigue con
 * inercia y cambia de forma sobre elementos interactivos.
 *
 * Es un refuerzo, no una condición: sólo se activa con puntero fino y sin
 * movimiento reducido. En táctil no se monta nada y queda el cursor nativo.
 */
export function EvaSignalCursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!root || !dot || !ring || !label) return;

    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let frame = 0;
    let running = false;

    const render = () => {
      current.x += (target.x - current.x) * 0.2;
      current.y += (target.y - current.y) * 0.2;
      ring.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;

      if (Math.abs(target.x - current.x) + Math.abs(target.y - current.y) > 0.1) {
        frame = requestAnimationFrame(render);
      } else {
        running = false;
      }
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      target.x = event.clientX;
      target.y = event.clientY;
      dot.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`;

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
        return;
      }
      const external = element.dataset.cursor === 'external';
      root.dataset.state = external ? 'external' : 'link';
      label.textContent =
        element.dataset.cursorLabel ?? (external ? ui.cursor.external : ui.cursor.link);
      root.style.setProperty('--cursor-accent', getComputedStyle(element).getPropertyValue('--accent'));
    };

    const onDown = () => root.classList.add('is-pressed');
    const onUp = () => root.classList.remove('is-pressed');
    const onLeave = () => root.classList.remove('is-visible');

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
        <span className="cursor__ring-shape" />
        <span ref={labelRef} className="cursor__label">
          {ui.cursor.idle}
        </span>
      </span>
      <span ref={dotRef} className="cursor__dot" />
    </div>
  );
}

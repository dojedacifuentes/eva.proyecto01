'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/lib/motion';

/** Milisegundos por carácter al borrar y al escribir el registro nuevo. */
const ERASE_MS = 26;
const TYPE_MS = 38;
/** Fracción del cierre que tiene que verse para que empiece a contar. */
const THRESHOLD = 0.5;

/** Una vez cambiado, queda cambiado para toda la visita: el registro no vuelve atrás. */
let flipped = false;

interface CodaStatusProps {
  label: string;
  before: string;
  after: string;
  /** Milisegundos a la vista antes de cambiar. */
  afterMs: number;
}

/**
 * El registro del cierre: `ESTADO: EXPANSIÓN` y, tras unos segundos con el
 * cierre a la vista, una sola vez, `ESTADO: ALGUIEN ESTUVO AQUÍ`. La soberbia
 * de EVA y, debajo, lo que la sostenía.
 *
 * El cambio se teclea sobre el nodo que React creó (borra y escribe con
 * `textContent`, como la caja de EVA; trampa 23: nunca quita nodos) y React se
 * entera al terminar. Con movimiento reducido cambia de golpe. Sin JavaScript
 * se lee el primer estado, que es el que EVA declara.
 */
export function CodaStatus({ label, before, after, afterMs }: CodaStatusProps) {
  const hostRef = useRef<HTMLParagraphElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const [done, setDone] = useState(false);
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (flipped) {
      const timer = setTimeout(() => setDone(true), 0);
      return () => clearTimeout(timer);
    }

    let wait: ReturnType<typeof setTimeout> | undefined;
    let tick: ReturnType<typeof setTimeout> | undefined;

    const finish = () => {
      flipped = true;
      setChanging(false);
      setDone(true);
    };

    const type = (at: number) => {
      const value = valueRef.current;
      if (!value) return finish();
      value.textContent = after.slice(0, at);
      if (at >= after.length) return finish();
      tick = setTimeout(() => type(at + 1), TYPE_MS);
    };

    const erase = (at: number) => {
      const value = valueRef.current;
      if (!value) return finish();
      value.textContent = before.slice(0, at);
      if (at <= 0) {
        tick = setTimeout(() => type(1), TYPE_MS * 4);
        return;
      }
      tick = setTimeout(() => erase(at - 1), ERASE_MS);
    };

    const change = () => {
      if (flipped) return;
      if (reduced) return finish();
      setChanging(true);
      erase(before.length);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!wait) wait = setTimeout(change, afterMs);
        } else if (wait) {
          // Se fue antes de tiempo: la cuenta vuelve a empezar la próxima vez.
          clearTimeout(wait);
          wait = undefined;
        }
      },
      { threshold: THRESHOLD },
    );
    observer.observe(host);

    return () => {
      observer.disconnect();
      clearTimeout(wait);
      clearTimeout(tick);
    };
  }, [after, afterMs, before, reduced]);

  return (
    <p
      ref={hostRef}
      className="conscience-coda__status mono"
      role="status"
      aria-live="polite"
      data-done={done || undefined}
      data-changing={changing || undefined}
    >
      <span className="conscience-coda__status-label">{label}:</span>{' '}
      <span ref={valueRef} className="conscience-coda__status-value">
        {done ? after : before}
      </span>
      <span className="conscience-coda__status-caret" aria-hidden="true">
        ▊
      </span>
    </p>
  );
}

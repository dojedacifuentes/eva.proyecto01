'use client';

import { useEffect, useState } from 'react';

const INTERVAL = 5200;
const FADE = 420;

/**
 * Microfrase rotativa del hero. Cambia con un fundido breve, sin efecto de
 * máquina de escribir. Con movimiento reducido se queda en la primera frase.
 * `aria-live` apagado a propósito: es ambiente, no información.
 */
export function Rotator({ lines }: { lines: readonly string[] }) {
  const [index, setIndex] = useState(0);
  const [out, setOut] = useState(false);

  useEffect(() => {
    if (lines.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let swap: ReturnType<typeof setTimeout>;
    const interval = setInterval(() => {
      setOut(true);
      swap = setTimeout(() => {
        setIndex((value) => (value + 1) % lines.length);
        setOut(false);
      }, FADE);
    }, INTERVAL);

    return () => {
      clearInterval(interval);
      clearTimeout(swap);
    };
  }, [lines]);

  return (
    <p className="rotator" aria-live="off">
      <span aria-hidden="true" className="rotator__prompt">
        &gt;
      </span>
      <span className={`rotator__text${out ? ' is-out' : ''}`}>{lines[index]}</span>
    </p>
  );
}

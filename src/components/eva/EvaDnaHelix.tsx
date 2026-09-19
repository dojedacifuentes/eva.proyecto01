'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { genome } from '@/content/site';
import { pointerSignal } from '@/lib/pointer';

/** three.js no viaja en el paquete inicial: llega cuando la hélice entra en pantalla. */
const DnaScene = dynamic(() => import('./dna/DnaScene'), { ssr: false });

/** Densidad según el ancho: menos pares y menos polvo en pantallas chicas. */
function densityFor(width: number) {
  if (width < 768) return { pairs: 14, particles: 40, scene: false };
  if (width < 1024) return { pairs: 20, particles: 70 };
  return { pairs: 28, particles: 110 };
}

/**
 * Genoma digital de EVA: doble hélice procedural en el hueco central del hero.
 *
 * Capa decorativa — `pointer-events: none`, `aria-hidden` y detrás del texto.
 * No ocupa espacio en el flujo, así que la portada sigue cabiendo en pantalla.
 */
export function EvaDnaHelix() {
  const hostRef = useRef<HTMLDivElement>(null);
  const nearRef = useRef(0);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [density, setDensity] = useState<{ pairs: number; particles: number; scene?: boolean } | null>(
    null,
  );

  /* Densidad y movimiento reducido, sincronizados con el navegador. */
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      setDensity(densityFor(window.innerWidth));
      setReduced(motion.matches);
    };
    sync();
    window.addEventListener('resize', sync);
    motion.addEventListener('change', sync);
    return () => {
      window.removeEventListener('resize', sync);
      motion.removeEventListener('change', sync);
    };
  }, []);

  /* Fuera de pantalla, el bucle de render se congela. */
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: '120px' },
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  /* Proximidad del puntero al área, en un ref: no provoca renders. */
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let rect = host.getBoundingClientRect();
    let frame = 0;

    const measure = () => {
      rect = host.getBoundingClientRect();
    };
    const tick = () => {
      frame = 0;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const reach = Math.max(rect.width, rect.height) * 1.6;
      const distance = Math.hypot(pointerSignal.x - cx, pointerSignal.y - cy);
      nearRef.current = pointerSignal.active ? Math.max(0, 1 - distance / reach) : 0;
    };
    const onMove = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, []);

  return (
    <div ref={hostRef} className="dna" aria-hidden="true">
      <div className="dna__stage">
        {density?.scene !== false && (
          <DnaScene
            pairs={density?.pairs ?? 28}
            particles={density?.particles ?? 110}
            reduced={reduced}
            active={visible && density !== null}
            nearRef={nearRef}
          />
        )}
      </div>

      <p className="dna__hud mono">
        <span className="dna__hud-title">{genome.title}</span>
        <span>{genome.sequence}</span>
        <span className="dna__hud-core">
          <i />
          {genome.core}
        </span>
      </p>
    </div>
  );
}

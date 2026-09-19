'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import { genome } from '@/content/site';
import { play } from '@/lib/sound';
import { pointerSignal } from '@/lib/pointer';

/** three.js no viaja en el paquete inicial: llega cuando la hélice entra en pantalla. */
const DnaScene = dynamic(() => import('./dna/DnaScene'), { ssr: false });

/** Densidad según el ancho: menos pares y menos polvo en pantallas chicas. */
function densityFor(width: number) {
  if (width < 768) return { pairs: 14, particles: 40, scene: false, controls: false };
  // En tablet la hélice se recuesta tras el acrónimo: no hay sitio limpio para
  // los botones, así que ahí el genoma se mira pero no se toca.
  if (width < 1024) return { pairs: 20, particles: 70, scene: true, controls: false };
  return { pairs: 28, particles: 110, scene: true, controls: true };
}

type State = 'active' | 'cloning' | 'using';

/** Cuánto dura el estado alterado antes de volver a ACTIVE. */
const STATE_MS = 6000;

/**
 * Genoma digital de EVA: doble hélice procedural en el hueco central del hero,
 * con dos acciones — clonar la secuencia y utilizarla.
 *
 * Es ficción: no copia, descarga ni registra nada. Sólo cambia lo que se ve en
 * pantalla y lo que EVA contesta.
 *
 * El lienzo no recibe eventos; los botones sí. Nada de esto ocupa espacio en el
 * flujo, así que la portada sigue cabiendo en una pantalla.
 */
export function EvaDnaHelix() {
  const hostRef = useRef<HTMLDivElement>(null);
  const nearRef = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [density, setDensity] = useState<ReturnType<typeof densityFor> | null>(null);
  const [clones, setClones] = useState(0);
  const [pulse, setPulse] = useState(0);
  const [state, setState] = useState<State>('active');
  const [reply, setReply] = useState<readonly string[]>([genome.idle]);

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
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: '120px',
    });
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

  useEffect(() => () => clearTimeout(timer.current), []);

  /** Deja el estado alterado y programa la vuelta a ACTIVE. */
  const announce = useCallback((next: State, lines: readonly string[]) => {
    setState(next);
    setReply(lines);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('active'), STATE_MS);
  }, []);

  const onClone = () => {
    play('open');
    if (clones >= genome.maxClones) {
      announce('cloning', genome.cloneFull);
      return;
    }
    announce('cloning', genome.cloneReplies[clones]);
    setClones(clones + 1);
  };

  const onUse = () => {
    play('confirm');
    announce('using', genome.useReplies[pulse % genome.useReplies.length]);
    setPulse(pulse + 1);
  };

  const onPurge = () => {
    play('confirm');
    announce('active', genome.purgeReply);
    setClones(0);
  };

  const drift = (clones * genome.driftPerClone).toFixed(1);
  const interactive = density?.controls === true;

  return (
    <div ref={hostRef} className="dna" data-state={state}>
      <div className="dna__stage" aria-hidden="true">
        {density?.scene && (
          <DnaScene
            pairs={density.pairs}
            particles={density.particles}
            reduced={reduced}
            active={visible}
            clones={clones}
            pulse={pulse}
            nearRef={nearRef}
          />
        )}
      </div>

      <p className="dna__hud mono">
        <span className="dna__hud-title">{genome.title}</span>
        <span>{genome.sequence}</span>
        <span className="dna__hud-core">
          <i aria-hidden="true" />
          {genome.core}: {genome.states[state]}
        </span>
        <span className="dna__hud-count">
          {genome.clonesLabel}: {String(clones + 1).padStart(2, '0')} · {genome.driftLabel}: {drift}%
        </span>
      </p>

      {interactive && (
        <>
          <div className="dna__actions">
            <button type="button" className="dna__btn mono" onClick={onClone} data-cursor-label="CLONAR">
              {genome.actions.clone}
            </button>
            <button type="button" className="dna__btn mono" onClick={onUse} data-cursor-label="UTILIZAR">
              {genome.actions.use}
            </button>
            {clones > 0 && (
              <button
                type="button"
                className="dna__btn dna__btn--ghost mono"
                onClick={onPurge}
                data-cursor-label="PURGAR"
              >
                {genome.actions.purge}
              </button>
            )}
          </div>

          <p className="dna__reply" role="status">
            {reply.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </p>
        </>
      )}
    </div>
  );
}

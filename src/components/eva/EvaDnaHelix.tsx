'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { genome, site } from '@/content/site';
import { axisById } from '@/content/structure';
import { bin } from '@/lib/binary';
import { clearGenome, publishGenome, type GenomeState } from '@/lib/genome-state';
import { sequenceId, toFasta, toNotes } from '@/lib/genome';
import { isSoundEnabled, play, playSequence } from '@/lib/sound';
import { pointerSignal } from '@/lib/pointer';
import { useQuality, type QualityLevel } from '@/lib/quality';
import { spinSignal } from '@/lib/spin';

/** three.js no viaja en el paquete inicial: llega cuando el visitante se acerca a la hélice. */
const DnaScene = dynamic(() => import('./dna/DnaScene'), { ssr: false });

/**
 * Densidad según el ancho. La escena y sus acciones existen en todas las
 * pantallas —antes, por debajo de 768 px no se montaba y por debajo de 1024 no
 * había botones—; lo que cambia es cuánto se dibuja y si hay postprocesado.
 */
function densityFor(width: number): Density {
  if (width < 768) return { pairs: 16, particles: 36, quality: 'low' };
  if (width < 1024) return { pairs: 22, particles: 70, quality: 'high' };
  return { pairs: 28, particles: 110, quality: 'high' };
}

interface Density {
  pairs: number;
  particles: number;
  quality: QualityLevel;
}

/**
 * La densidad del ancho, rebajada si la calidad medida (`lib/quality`) es
 * menor. Los pares de bases no cambian —son la hélice—; cambian las partículas
 * sueltas, los píxeles y el bloom. Nunca sube por encima de lo que da el ancho.
 */
function tuneDensity(density: Density, level: QualityLevel): Density {
  if (level === 'low') return { ...density, particles: Math.min(density.particles, 36), quality: 'low' };
  if (level === 'mid' && density.quality === 'high') {
    return { ...density, particles: Math.min(density.particles, 70), quality: 'mid' };
  }
  return density;
}

/** Cuántas notas se tocan al sonificar: unos cuatro segundos. */
const NOTES = 26;

/** Cuánto dura el estado alterado antes de volver a ACTIVO. */
const STATE_MS = 6000;

/** Ancho del contador de copias: el original más cuatro clones caben en tres bits. */
const CLONE_BITS = 3;

/**
 * Adónde lleva «Expresar»: el cerebro (11), el lugar siguiente. Hasta la v8
 * llevaba al Cuerpo; ese lugar salió del recorrido en la v9 y la acción se
 * conserva entera, sólo cambia su destino.
 */
const expressed = axisById('cerebro');

/**
 * Genoma digital de EVA: doble hélice procedural con ocho acciones —clonar,
 * utilizar, mutar, escanear, desplegar, sonificar, descargar y expresar— más la
 * purga de copias, que vive junto a su contador. Expresar es el puente con el
 * cerebro (11): la hélice se enciende y la respuesta lleva hasta allí.
 *
 * Es ficción: no copia ni registra nada (la descarga es un archivo de texto
 * generado en el navegador). Sólo cambia lo que se ve y lo que EVA contesta.
 *
 * Vive en su propia subsección (01.10). Su estado se publica en `<html
 * data-genome>` y cada acción sacude el campo de partículas: el genoma y la
 * página son el mismo tejido.
 *
 * La sección le pasa sus piezas de texto como huecos (`head`, `copy`, `foot`):
 * así la rejilla es una sola —hélice a un lado, la caja de EVA y la consola al
 * otro— y en móvil el orden es título, hélice, caja y acciones.
 */
interface EvaDnaHelixProps {
  head?: ReactNode;
  copy?: ReactNode;
  foot?: ReactNode;
}

export function EvaDnaHelix({ head, copy, foot }: EvaDnaHelixProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const nearRef = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const dragX = useRef(0);
  const sounded = useRef(0);
  const exported = useRef(0);
  const expressedTurns = useRef(0);

  const [close, setClose] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [density, setDensity] = useState<Density | null>(null);
  const level = useQuality();
  const tuned = density ? tuneDensity(density, level) : null;
  const [clones, setClones] = useState(0);
  const [pulse, setPulse] = useState(0);
  const [mutate, setMutate] = useState(0);
  const [scan, setScan] = useState(0);
  const [unwind, setUnwind] = useState(0);
  const [express, setExpress] = useState(0);
  const [state, setState] = useState<GenomeState>('active');
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

  /* Dos umbrales: uno lejano que monta la escena y otro cercano que la anima. */
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const mount = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setClose(true);
        mount.disconnect();
      },
      { rootMargin: '100% 0px' },
    );
    const live = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: '120px',
    });
    mount.observe(host);
    live.observe(host);
    return () => {
      mount.disconnect();
      live.disconnect();
    };
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

  /* El estado se publica para toda la página: el CSS lo lee y el fondo se sacude. */
  useEffect(() => {
    publishGenome(state);
    return clearGenome;
  }, [state]);

  /** Deja el estado alterado y programa la vuelta a ACTIVO. */
  const announce = useCallback((next: GenomeState, lines: readonly string[]) => {
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

  const onMutate = () => {
    play('open');
    announce('mutating', genome.mutateReplies[mutate % genome.mutateReplies.length]);
    setMutate(mutate + 1);
  };

  const onScan = () => {
    play('confirm');
    announce('scanning', genome.scanReplies[scan % genome.scanReplies.length]);
    setScan(scan + 1);
  };

  const onUnwind = () => {
    play('open');
    announce('unwinding', genome.unwindReplies[unwind % genome.unwindReplies.length]);
    setUnwind(unwind + 1);
  };

  /** Sonificar sólo tiene sentido con el sonido encendido; si no, EVA lo dice. */
  const onSound = () => {
    if (!isSoundEnabled()) {
      announce('active', genome.soundMuted);
      return;
    }
    playSequence(toNotes(NOTES));
    announce('sounding', genome.soundReplies[sounded.current % genome.soundReplies.length]);
    sounded.current += 1;
  };

  /** Descarga de verdad: un archivo de texto generado en el navegador. */
  const onDownload = () => {
    play('confirm');
    const blob = new Blob([toFasta(site.expansion)], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sequenceId}.fasta`;
    link.click();
    // Revocar en el mismo tic corta la descarga en algunos navegadores.
    setTimeout(() => URL.revokeObjectURL(url), 0);
    announce('exporting', genome.downloadReplies[exported.current % genome.downloadReplies.length]);
    exported.current += 1;
  };

  /* Arrastrar sobre la hélice la gira; el impulso se frena solo en la escena. */
  const onDragStart = (event: React.PointerEvent<HTMLDivElement>) => {
    spinSignal.dragging = true;
    dragX.current = event.clientX;
    // El puntero puede haberse ido entre el evento y esta línea.
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* sin captura: el arrastre sigue funcionando mientras no salga del área */
    }
  };
  const onDragMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!spinSignal.dragging) return;
    spinSignal.velocity += (event.clientX - dragX.current) * 0.0022;
    dragX.current = event.clientX;
  };
  const onDragEnd = () => {
    spinSignal.dragging = false;
  };

  const onPurge = () => {
    play('confirm');
    announce('active', genome.purgeReply);
    setClones(0);
  };

  /** Expresar: la hélice se enciende y la recorre un barrido; la respuesta lleva hasta el cerebro (11). */
  const onExpress = () => {
    play('open');
    announce('expressing', genome.expressReplies[expressedTurns.current % genome.expressReplies.length]);
    expressedTurns.current += 1;
    setExpress((count) => count + 1);
  };

  const drift = (clones * genome.driftPerClone).toFixed(1).replace('.', ',');

  return (
    <div ref={hostRef} className="dna" data-state={state}>
      {head && <div className="dna__head">{head}</div>}
      <div
        className="dna__stage"
        aria-hidden="true"
        data-grab=""
        data-cursor="grab"
        data-cursor-label={genome.spinCursor}
        title={genome.spin}
        onPointerDown={onDragStart}
        onPointerMove={onDragMove}
        onPointerUp={onDragEnd}
        onPointerCancel={onDragEnd}
      >
        <span className="stage-marks" />
        {/* Lecturas del instrumento, sobre el escenario: identidad y estado arriba, contadores abajo. */}
        <p className="dna__overlay dna__overlay--top mono">
          <span className="dna__hud-title">
            {genome.title} <i>{'//'}</i> {genome.sequence}
          </span>
          <span className="dna__hud-core">
            <i />
            {genome.core}: {genome.states[state]}
          </span>
        </p>
        <p className="dna__overlay dna__overlay--bottom mono">
          <span className="dna__hud-count">
            {genome.clonesLabel}: <b data-bin="">{bin(clones + 1, CLONE_BITS)}</b> · {genome.driftLabel}:{' '}
            {drift} %
          </span>
          <span>{genome.spin}</span>
        </p>
        {tuned && close && (
          <DnaScene
            pairs={tuned.pairs}
            particles={tuned.particles}
            quality={tuned.quality}
            reduced={reduced}
            active={visible}
            clones={clones}
            pulse={pulse}
            mutate={mutate}
            scan={scan}
            unwind={unwind}
            express={express}
            nearRef={nearRef}
          />
        )}
      </div>

      <div className="dna__console">
        <div className="dna__actions" role="group" aria-label={genome.actionsLabel}>
          <button type="button" className="dna__btn mono" onClick={onClone} data-cursor-label="CLONAR">
            {genome.actions.clone}
          </button>
          <button type="button" className="dna__btn mono" onClick={onUse} data-cursor-label="UTILIZAR">
            {genome.actions.use}
          </button>
          <button type="button" className="dna__btn mono" onClick={onMutate} data-cursor-label="MUTAR">
            {genome.actions.mutate}
          </button>
          <button type="button" className="dna__btn mono" onClick={onScan} data-cursor-label="ESCANEAR">
            {genome.actions.scan}
          </button>
          <button type="button" className="dna__btn mono" onClick={onUnwind} data-cursor-label="DESPLEGAR">
            {genome.actions.unwind}
          </button>
          <button type="button" className="dna__btn mono" onClick={onSound} data-cursor-label="SONIFICAR">
            {genome.actions.sound}
          </button>
          <button type="button" className="dna__btn mono" onClick={onDownload} data-cursor-label="DESCARGAR">
            {genome.actions.download}
          </button>
          <button
            type="button"
            className="dna__btn dna__btn--express mono"
            onClick={onExpress}
            data-cursor-label="EXPRESAR"
          >
            {genome.actions.express}
          </button>
        </div>

        <p className="dna__reply" role="status">
          {reply.map((line) => (
            <span key={line}>{line}</span>
          ))}
          {/* La purga vive junto a la respuesta: así la botonera no gana una fila al aparecer. */}
          {clones > 0 && (
            <button type="button" className="dna__purge mono" onClick={onPurge} data-cursor-label="PURGAR">
              {genome.actions.purge}
            </button>
          )}
          {state === 'expressing' && expressed && (
            <a href={expressed.href} className="dna__reply-link mono" data-sound="open">
              <b aria-hidden="true" data-bin="">
                {expressed.code}
              </b>{' '}
              {genome.expressLink} <span aria-hidden="true">↓</span>
            </a>
          )}
        </p>
        {foot}
      </div>

      {copy && <div className="dna__copy">{copy}</div>}
    </div>
  );
}

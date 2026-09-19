'use client';

import dynamic from 'next/dynamic';
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { neuroscan } from '@/content/neuroscan';
import { DETAIL, detectTier, detectWebGL } from './neural-data';
import { NeuralFallback } from './NeuralFallback';

/** three.js no viaja con el escáner: llega cuando el núcleo se monta. */
const NeuralScene = dynamic(() => import('./NeuralScene'), { ssr: false });

const { zones, core } = neuroscan.brain;

/**
 * loading: el mapa plano espera al núcleo · fading: el núcleo ya pinta y el
 * mapa se desvanece · live: sólo el núcleo · flat: sin WebGL, el mapa plano
 * es la interfaz.
 */
type Phase = 'loading' | 'fading' | 'live' | 'flat';

/** Cuánto tarda el mapa plano en desvanecerse cuando el núcleo aparece. */
const FADE_MS = 900;

/** Si la escena revienta —contexto perdido, sombreador rechazado— queda el mapa plano. */
class SceneBoundary extends Component<
  { onFail: () => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onFail();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

interface EvaNeuralCoreProps {
  /** Región seleccionada; la lógica de selección sigue en el escáner. */
  selected: string | null;
  reduced: boolean;
  onSelect: (id: string) => void;
  onReset: () => void;
}

/**
 * EVA // NEURAL CORE: la capa HTML del cerebro artificial. Decide si hay
 * WebGL, carga la escena en diferido, muestra el mapa plano mientras tanto y
 * ofrece las ocho regiones como botones de verdad, con teclado y foco.
 * El lienzo es un refuerzo visual: todo lo que se lee está fuera de él.
 */
export function EvaNeuralCore({ selected, reduced, onSelect, onReset }: EvaNeuralCoreProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>(() => (detectWebGL() ? 'loading' : 'flat'));
  const [detail] = useState(() => DETAIL[detectTier()]);
  const [hovered, setHovered] = useState<string | null>(null);
  const [stats, setStats] = useState<{ neurons: number; synapses: number } | null>(null);
  const [resetTick, setResetTick] = useState(0);

  /* El núcleo ya pinta: el mapa plano se va y, pasado el fundido, se desmonta. */
  useEffect(() => {
    if (phase !== 'fading') return;
    const timer = setTimeout(() => setPhase('live'), FADE_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  const ready = useCallback((next: { neurons: number; synapses: number }) => {
    setStats(next);
    setPhase('fading');
  }, []);

  const fail = useCallback(() => {
    setStats(null);
    setPhase('flat');
  }, []);

  /*
   * Previsualización desde la escena. El cursor de señal sólo lee su etiqueta
   * al entrar en un elemento, así que al cambiar de región se le avisa con un
   * pointerover sintético sobre el lienzo, que es el elemento que apunta.
   */
  const preview = useCallback((id: string | null) => {
    setHovered(id);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const zone = id ? zones.find((item) => item.id === id) : undefined;
    canvas.dataset.cursorLabel = zone ? `${zone.code} ${zone.name.toUpperCase()}` : core.cursor;
    canvas.dispatchEvent(new PointerEvent('pointerover', { bubbles: true }));
  }, []);

  const reset = () => {
    onReset();
    setResetTick((tick) => tick + 1);
  };

  const flat = phase === 'flat';
  const focus = zones.find((zone) => zone.id === (hovered ?? selected));
  const mode = hovered ? 'preview' : selected ? 'active' : 'idle';
  const status = stats
    ? `${stats.neurons} ${core.neurons} · ${stats.synapses} ${core.synapses}`
    : flat
      ? core.flat
      : core.loading;

  return (
    <div className="core" data-phase={phase}>
      <div className="core__stage">
        {!flat && (
          <div
            ref={canvasRef}
            className="core__canvas"
            aria-hidden="true"
            data-cursor="grab"
            data-cursor-label={core.cursor}
          >
            <SceneBoundary onFail={fail}>
              <NeuralScene
                detail={detail}
                zones={zones}
                reduced={reduced}
                selected={selected}
                hovered={hovered}
                alert={core.alert}
                reset={resetTick}
                onHover={preview}
                onSelect={onSelect}
                onReady={ready}
              />
            </SceneBoundary>
          </div>
        )}

        {phase !== 'live' && (
          <div className="core__flat" data-fading={phase === 'fading'}>
            <NeuralFallback
              zones={zones}
              title={neuroscan.brain.title}
              selected={selected}
              hovered={hovered}
              interactive={flat}
              onSelect={onSelect}
              onHover={setHovered}
            />
          </div>
        )}

        <p className="core__hud mono" aria-hidden="true">
          <span className="core__hud-id">
            {core.title} <i>{'//'}</i> {status}
          </span>
          <span className="core__hud-read" data-mode={mode}>
            {focus ? (
              <>
                {mode === 'preview' ? core.preview : core.active} <i>{'//'}</i> {focus.code}{' '}
                {focus.name}
              </>
            ) : (
              core.idle
            )}
          </span>
        </p>

        {!flat && (
          <p className="core__hint mono" aria-hidden="true">
            {reduced ? core.reduced : core.hint}
          </p>
        )}
      </div>

      <div className="core__regions" role="group" aria-label={core.regionsLabel}>
        {zones.map((zone) => (
          <button
            key={zone.id}
            type="button"
            className="core__chip mono"
            aria-pressed={selected === zone.id}
            data-hover={hovered === zone.id || undefined}
            onClick={() => onSelect(zone.id)}
            onPointerEnter={() => setHovered(zone.id)}
            onPointerLeave={() => setHovered(null)}
            onFocus={() => setHovered(zone.id)}
            onBlur={() => setHovered(null)}
            data-cursor-label={zone.code}
          >
            <i aria-hidden="true">{zone.code}</i>
            <span>{zone.name}</span>
          </button>
        ))}
        <button
          type="button"
          className="core__chip core__chip--reset mono"
          onClick={reset}
          aria-label={core.resetLabel}
          data-cursor-label="RESET"
        >
          <i aria-hidden="true">⟲</i>
          <span>{core.reset}</span>
        </button>
      </div>
    </div>
  );
}

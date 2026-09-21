'use client';

import dynamic from 'next/dynamic';
import {
  Component,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { neuroscan } from '@/content/neuroscan';
import { useQuality } from '@/lib/quality';
import { coarsePointer, DETAIL, webglSupported } from './neural-data';
import { NeuralFallback } from './NeuralFallback';

/** three.js no viaja con la página: llega cuando el núcleo se monta. */
const NeuralScene = dynamic(() => import('./NeuralScene'), { ssr: false });

const { zones, core } = neuroscan.brain;

/**
 * loading: el núcleo se compila; sólo se ve el HUD y una retícula que late ·
 * fading: el núcleo ya pinta y el lienzo entra con un fundido · live: el
 * núcleo, sin más · flat: sin WebGL, el mapa plano es la interfaz.
 */
type Phase = 'loading' | 'fading' | 'live' | 'flat';

/** Cuánto tarda el lienzo en aparecer una vez que el núcleo pinta. */
const FADE_MS = 600;

/*
 * Estamos en el navegador. La sala del núcleo se renderiza en el servidor,
 * donde no hay WebGL que detectar ni dispositivo que medir: hasta hidratar no
 * se monta nada, y la escena llega después con la detección ya hecha. Sin
 * estado ni efectos: la instantánea del servidor es `false` y la del cliente,
 * `true`.
 */
const subscribeNever = () => () => {};
const useIsClient = () =>
  useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );

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
  /** Región seleccionada; la lógica de selección vive en quien lo monta. */
  selected: string | null;
  reduced: boolean;
  onSelect: (id: string) => void;
  onReset: () => void;
  /**
   * `scan`: dentro del neuroescáner, a su ritmo y con zoom. `room`: en la
   * página, con la red hiperactiva y sin zoom, que ahí secuestraría el
   * desplazamiento. Las dos llevan las regiones como botones de verdad.
   */
  variant?: 'scan' | 'room';
  /** `false` congela la animación (fuera de pantalla o tapado). */
  active?: boolean;
  /**
   * `false` aplaza el montaje de la escena —y la descarga de three.js— hasta
   * que quien lo monta diga que el visitante se acerca. Una vez montada, se queda.
   */
  mount?: boolean;
  /** Recuento de neuronas y sinapsis en cuanto el núcleo pinta. */
  onStats?: (stats: { neurons: number; synapses: number }) => void;
}

/**
 * EVA // NEURAL CORE: la capa HTML del cerebro artificial. Decide si hay
 * WebGL, carga la escena en diferido y ofrece las ocho regiones como botones
 * de verdad, con teclado y foco. El lienzo es un refuerzo visual: todo lo que
 * se lee está fuera de él.
 *
 * Mientras compila no se enseña el mapa plano: cruzar un dibujo 2D con el
 * cerebro 3D —otra silueta, otro sitio— se veía como una aparición rota. El
 * mapa plano queda para cuando no hay WebGL.
 */
export function EvaNeuralCore({
  selected,
  reduced,
  onSelect,
  onReset,
  variant = 'scan',
  active = true,
  mount = true,
  onStats,
}: EvaNeuralCoreProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const client = useIsClient();
  const [phase, setPhase] = useState<Phase>('loading');
  const [mounted, setMounted] = useState(false);
  const supported = client ? webglSupported() : true;
  /* En el servidor y hasta hidratar, alto; después, el nivel medido. Si baja, el cerebro se
     reconstruye con menos neuronas, menos píxeles y sin bloom: una vez, y se nota como alivio. */
  const detail = DETAIL[useQuality()];
  const touch = client ? coarsePointer() : false;
  const [hovered, setHovered] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    neurons: number;
    synapses: number;
  } | null>(null);
  const [fit, setFit] = useState<number | null>(null);
  const [resetTick, setResetTick] = useState(0);

  /* Una vez que alguien pide la escena, no se vuelve a desmontar. */
  if (mount && !mounted) setMounted(true);

  /* El núcleo ya pinta: pasado el fundido, el estado es «en vivo». */
  useEffect(() => {
    if (phase !== 'fading') return;
    const timer = setTimeout(() => setPhase('live'), FADE_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  const ready = useCallback(
    (next: { neurons: number; synapses: number }) => {
      setStats(next);
      // Sólo la primera vez hay entrada; un cambio de nivel actualiza el rótulo sin repetirla.
      setPhase((current) => (current === 'loading' ? 'fading' : current));
      onStats?.(next);
    },
    [onStats],
  );

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

  const flat = !supported || phase === 'flat';
  const focus = zones.find((zone) => zone.id === (hovered ?? selected));
  const mode = hovered ? 'preview' : selected ? 'active' : 'idle';
  const status = stats
    ? `${stats.neurons} ${core.neurons} · ${stats.synapses} ${core.synapses}`
    : flat
      ? core.flat
      : core.loading;

  return (
    <div
      className="core"
      data-phase={flat ? 'flat' : phase}
      data-variant={variant}
      data-fit={fit?.toFixed(3)}
    >
      <div className="core__stage">
        <span aria-hidden="true" className="stage-marks" />
        {client && mounted && !flat && (
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
                active={active}
                tempo={variant === 'room' ? 2 : 1}
                zoom={variant === 'scan' && !touch}
                selected={selected}
                hovered={hovered}
                alert={core.alert}
                reset={resetTick}
                onHover={preview}
                onSelect={onSelect}
                onReady={ready}
                onFit={setFit}
              />
            </SceneBoundary>
          </div>
        )}

        {flat && (
          <div className="core__flat">
            <NeuralFallback
              zones={zones}
              title={neuroscan.brain.title}
              selected={selected}
              hovered={hovered}
              interactive
              onSelect={onSelect}
              onHover={setHovered}
            />
          </div>
        )}

        {!flat && phase === 'loading' && <span aria-hidden="true" className="core__wait" />}

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
        {zones.map((zone, index) => (
          <button
            key={zone.id}
            type="button"
            className="core__chip mono"
            aria-pressed={selected === zone.id}
            aria-label={`${zone.name}, ${core.regionWord} ${index + 1} ${core.of} ${zones.length}`}
            data-hover={hovered === zone.id || undefined}
            data-alert={zone.id === core.alert || undefined}
            onClick={() => onSelect(zone.id)}
            onPointerEnter={() => setHovered(zone.id)}
            onPointerLeave={() => setHovered(null)}
            onFocus={() => setHovered(zone.id)}
            onBlur={() => setHovered(null)}
            data-cursor-label={zone.code}
          >
            <i aria-hidden="true" data-bin="">
              {zone.code}
            </i>
            {/* El verbo, no el nombre: «Decide» cabe donde «Corteza prefrontal»
                no, y es lo que se compara con la red. El nombre entero está en
                el `aria-label` y en la lectura de la región. */}
            <span aria-hidden="true">{zone.tag}</span>
          </button>
        ))}
        <button
          type="button"
          className="core__chip core__chip--reset mono"
          onClick={reset}
          aria-label={core.resetLabel}
          data-cursor-label={core.resetCursor}
        >
          <i aria-hidden="true">⟲</i>
          <span>{core.reset}</span>
        </button>
      </div>
    </div>
  );
}

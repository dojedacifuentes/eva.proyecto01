'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ejes } from '@/content/ejes';
import { neuroscan } from '@/content/neuroscan';
import { useReducedMotion } from '@/lib/motion';
import { play } from '@/lib/sound';
import { EvaNeuralCore } from './EvaNeuralCore';

/** Con cuánta antelación se descarga y compila la escena: una pantalla entera. */
const MOUNT_MARGIN = '100% 0px';
/** Con cuánta antelación empieza a animarse, para que ya esté viva al llegar. */
const ACTIVE_MARGIN = '600px 0px';

const { zones } = neuroscan.brain;

/**
 * El núcleo cerebral: el cerebro a un lado y, al otro, la caja donde EVA
 * escribe cómo funciona su mente. Las regiones se eligen en el cerebro o en
 * su registro de botones, y la elegida se lee justo debajo.
 *
 * La animación se congela cuando la sala sale de pantalla, para no sostener
 * una escena WebGL que nadie mira. En escritorio el cerebro se queda fijo
 * mientras la caja de EVA se desplaza (`position: sticky`, en ejes.css).
 *
 * La sección le pasa sus textos como huecos (`head`, `writes`) para que la
 * rejilla sea una sola.
 */
interface NeuralRoomProps {
  head?: ReactNode;
  writes?: ReactNode;
}

export function NeuralRoom({ head, writes }: NeuralRoomProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const reduced = useReducedMotion();

  /* Dos umbrales: uno lejano que monta la escena y otro cercano que la anima. */
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const mount = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setNear(true);
        mount.disconnect();
      },
      { rootMargin: MOUNT_MARGIN },
    );
    const live = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: ACTIVE_MARGIN,
    });
    mount.observe(host);
    live.observe(host);
    return () => {
      mount.disconnect();
      live.disconnect();
    };
  }, []);

  const select = (id: string) => {
    setSelected((current) => (current === id ? null : id));
    play('confirm');
  };

  const zone = zones.find((item) => item.id === selected);

  return (
    <div ref={hostRef} className="core-room" data-active={visible}>
      {head && <div className="core-room__head">{head}</div>}
      <div className="core-room__stage">
        <EvaNeuralCore
          variant="room"
          mount={near}
          active={visible}
          selected={selected}
          reduced={reduced}
          onSelect={select}
          onReset={() => setSelected(null)}
        />
        {/* La lectura de la región elegida. `aria-live` para que un lector de pantalla la oiga al elegir. */}
        <div className="core-room__reading" aria-live="polite" data-on={zone ? '' : undefined}>
          {zone ? (
            <>
              <p className="core-room__reading-head mono">
                <b data-bin="">{zone.code}</b> {ejes.nucleo.region.label} <i aria-hidden="true">{'//'}</i>{' '}
                {zone.name.toUpperCase()}
              </p>
              {zone.lines.map((line) => (
                <p key={line} className="core-room__reading-line">
                  {line}
                </p>
              ))}
            </>
          ) : (
            <p className="core-room__reading-idle mono">{ejes.nucleo.region.idle}</p>
          )}
        </div>
      </div>
      {writes && <div className="core-room__writes">{writes}</div>}
    </div>
  );
}

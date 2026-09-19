'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useReducedMotion } from '@/lib/motion';
import { play } from '@/lib/sound';
import { isCovered, isCoveredOnServer, subscribeCovered } from '@/lib/stage';
import { EvaNeuralCore } from './EvaNeuralCore';
import { NeuralReadout } from './NeuralReadout';

/**
 * Sala 01: el cerebro del núcleo neural a un lado y, al otro, la ventana que
 * lo lee. Misma escena que dentro del escáner, con sus efectos completos;
 * aquí las regiones no llevan fichas: se leen en la ventana al hacer clic.
 *
 * El bucle de render y la mecanografía se congelan cuando la sala sale de
 * pantalla o cuando el escáner la tapa, para no sostener dos escenas WebGL
 * que nadie está mirando.
 */
export function NeuralRoom() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [stats, setStats] = useState<{ neurons: number; synapses: number } | null>(null);
  const covered = useSyncExternalStore(subscribeCovered, isCovered, isCoveredOnServer);
  const reduced = useReducedMotion();

  /* Fuera de pantalla, todo se congela; con margen, para que ya esté vivo al llegar. */
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: '160px',
    });
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  const active = visible && !covered;

  const select = (id: string) => {
    setSelected((current) => (current === id ? null : id));
    play('confirm');
  };

  return (
    <div ref={hostRef} className="core-room" data-active={active}>
      <div className="core-room__stage">
        <EvaNeuralCore
          variant="room"
          active={active}
          selected={selected}
          reduced={reduced}
          onSelect={select}
          onReset={() => setSelected(null)}
          onStats={setStats}
        />
      </div>
      <NeuralReadout selected={selected} stats={stats} active={active} reduced={reduced} />
    </div>
  );
}

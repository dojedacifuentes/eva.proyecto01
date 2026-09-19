'use client';

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { isChannelOpen, isChannelOpenOnServer, subscribeChannelOpen } from '@/lib/channel-store';
import { useReducedMotion } from '@/lib/motion';
import { play } from '@/lib/sound';
import { isCovered, isCoveredOnServer, subscribeCovered } from '@/lib/stage';
import { EvaNeuralCore } from './EvaNeuralCore';
import { NeuralReadout } from './NeuralReadout';

/** Con cuánta antelación se descarga y compila la escena: una pantalla entera. */
const MOUNT_MARGIN = '100% 0px';
/** Con cuánta antelación empieza a animarse, para que ya esté viva al llegar. */
const ACTIVE_MARGIN = '600px 0px';

/**
 * El núcleo cerebral: el cerebro a un lado y, al otro, la ventana que lo lee.
 * Misma escena que dentro del escáner, con la red al doble de ritmo; las
 * regiones se eligen en el cerebro o en su tira de botones y se leen en la
 * ventana.
 *
 * La animación y la mecanografía se congelan cuando la sala sale de pantalla o
 * cuando el escáner la tapa, para no sostener escenas WebGL que nadie mira. Y
 * cuando el visitante abre el canal de EVA, la ventana baja la voz: una sola
 * cosa habla a la vez.
 *
 * El cerebro ocupa media sala a todo el alto; la cabecera (`head`), la ventana
 * y la puerta al escáner (`aside`) comparten la otra mitad. La sección le pasa
 * sus textos como huecos para que la rejilla sea una sola.
 */
interface NeuralRoomProps {
  head?: ReactNode;
  aside?: ReactNode;
}

export function NeuralRoom({ head, aside }: NeuralRoomProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [stats, setStats] = useState<{ neurons: number; synapses: number } | null>(null);
  const covered = useSyncExternalStore(subscribeCovered, isCovered, isCoveredOnServer);
  const hushed = useSyncExternalStore(subscribeChannelOpen, isChannelOpen, isChannelOpenOnServer);
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

  const active = visible && !covered;

  const select = (id: string) => {
    setSelected((current) => (current === id ? null : id));
    play('confirm');
  };

  return (
    <div ref={hostRef} className="core-room" data-active={active} data-hushed={hushed || undefined}>
      {head && <div className="core-room__head">{head}</div>}
      <div className="core-room__stage">
        <EvaNeuralCore
          variant="room"
          mount={near}
          active={active}
          selected={selected}
          reduced={reduced}
          onSelect={select}
          onReset={() => setSelected(null)}
          onStats={setStats}
        />
      </div>
      <NeuralReadout
        selected={selected}
        stats={stats}
        active={active && !hushed}
        reduced={reduced}
      />
      {aside && <div className="core-room__aside">{aside}</div>}
    </div>
  );
}

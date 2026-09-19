'use client';

import { useEffect, useState } from 'react';
import { ui } from '@/content/site';
import { play, setSoundEnabled } from '@/lib/sound';

/**
 * Control de sonido. Siempre arranca apagado y no recuerda la preferencia: el
 * audio sólo existe después de que alguien lo pide en esta visita.
 * Con el sonido activo, los enlaces y botones emiten un microsonido al clic.
 */
export function SoundControl() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!on) return;
    const onClick = (event: MouseEvent) => {
      const element = (event.target as Element | null)?.closest<HTMLElement>('a, button');
      if (!element || element.dataset.soundToggle !== undefined) return;
      play(element.dataset.sound === 'open' ? 'open' : 'confirm');
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [on]);

  const toggle = () => {
    setSoundEnabled(!on);
    setOn(!on);
  };

  return (
    <button
      type="button"
      className="chip-btn mono"
      aria-pressed={on}
      aria-label={ui.sound.label}
      data-sound-toggle=""
      data-cursor-label={on ? ui.sound.cursorOn : ui.sound.cursorOff}
      onClick={toggle}
    >
      <span aria-hidden="true" className="sound__bars">
        <i />
        <i />
        <i />
      </span>
      <span aria-hidden="true">{on ? ui.sound.on : ui.sound.off}</span>
    </button>
  );
}

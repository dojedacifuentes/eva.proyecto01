'use client';

import { useEffect, useState } from 'react';
import { images } from '@/content/assets';
import { neuroscan } from '@/content/neuroscan';
import { hero } from '@/content/site';
import { subscribeNeuroscan } from '@/lib/stage';
import { EvaNeuroscan } from './EvaNeuroscan';
import { EvaPortraitFrame } from './EvaPortraitFrame';
import { EvaPortraitLoop } from './EvaPortraitLoop';

/**
 * Tarjeta de EVA en la portada. El retrato completo es el disparador del
 * neuroescáner: un botón encima del marco, con su pista visible.
 */
export function EvaProfile() {
  const [open, setOpen] = useState(false);

  /* Las salas del laboratorio también pueden abrirlo: la sala del cerebro y la bitácora lo piden. */
  useEffect(() => subscribeNeuroscan(() => setOpen(true)), []);

  return (
    <div className="profile">
      <EvaPortraitFrame
        image={images.heroPortrait}
        caption={hero.portraitCaption}
        sizes="(min-width: 64rem) 22rem, (min-width: 48rem) 30vw, 42vw"
        priority
        overlay={<EvaPortraitLoop />}
      />

      <button
        type="button"
        className="profile__trigger"
        onClick={() => setOpen(true)}
        aria-label={neuroscan.trigger.label}
        aria-haspopup="dialog"
        data-cursor-label="NEUROESCÁNER"
        data-sound="open"
      >
        <span aria-hidden="true" className="profile__hint mono">
          <span className="profile__hint-label">{neuroscan.trigger.hint}</span>
          <i>↗</i>
        </span>
      </button>

      {/* Se monta al abrirse: cada visita empieza el flujo desde cero. */}
      {open && <EvaNeuroscan onClose={() => setOpen(false)} />}
    </div>
  );
}

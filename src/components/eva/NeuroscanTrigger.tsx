'use client';

import type { ReactNode } from 'react';
import { requestNeuroscan } from '@/lib/stage';

interface NeuroscanTriggerProps {
  className?: string;
  label: string;
  children: ReactNode;
}

/**
 * Botón que abre el neuroescáner desde cualquier sala. No sabe dónde vive el
 * modal: emite la petición y el retrato de la portada la atiende.
 */
export function NeuroscanTrigger({ className, label, children }: NeuroscanTriggerProps) {
  return (
    <button
      type="button"
      className={className}
      onClick={requestNeuroscan}
      aria-label={label}
      aria-haspopup="dialog"
      data-sound="open"
      data-cursor-label="NEUROESCÁNER"
    >
      {children}
    </button>
  );
}

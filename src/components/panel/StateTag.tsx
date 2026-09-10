import type { ItemState } from '@/lib/panel';

/**
 * Etiqueta de estado de un ítem del panel.
 *
 * Distingue por forma y por palabra, no por color: EVA tiene un único color y
 * un semáforo de cuatro tonos lo rompería. El acento se reserva para los tres
 * estados que piden acción; lo que ya consta se queda en gris, porque no hay
 * nada que hacer con ello.
 *
 * «Por verificar» lleva borde discontinuo: no es una tarea, es un hueco de
 * conocimiento, y conviene que se lea distinto de una tarea. La etiqueta se
 * abrevia porque «pendiente de verificación» entero desborda su columna; la
 * frase completa vive en la leyenda de la cabecera.
 */

export const STATE_LABEL: Record<ItemState, string> = {
  ok: 'Consta',
  curso: 'En curso',
  falta: 'Falta',
  verificar: 'Por verificar',
};

const STATE_CLASS: Record<ItemState, string> = {
  ok: 'border-border text-muted',
  curso: 'border-accent/45 text-accent-ink',
  falta: 'border-border-strong text-foreground',
  verificar: 'border-accent/45 border-dashed text-accent-ink',
};

const STATE_GLYPH: Record<ItemState, string> = {
  ok: '✓',
  curso: '→',
  falta: '·',
  verificar: '?',
};

export function StateTag({ state }: { state: ItemState }) {
  return (
    <span
      className={`eva-mono inline-flex shrink-0 items-center gap-1.5 rounded-eva border px-2 py-1 ${STATE_CLASS[state]}`}
    >
      <span aria-hidden="true">{STATE_GLYPH[state]}</span>
      {STATE_LABEL[state]}
    </span>
  );
}

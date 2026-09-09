import { StatusLabel } from '@/components/ui/StatusLabel';

/**
 * Capítulo todavía sin contenido.
 *
 * No hay cards falsas ni relleno: sólo un filete, el estado y una línea que
 * explica qué aparecerá aquí. La ausencia tiene que leerse como una decisión,
 * no como una página a medio hacer.
 */
export function EmptyChapter({
  status,
  note,
  label,
}: {
  status: string;
  note: string;
  /** Etiqueta opcional de la colección, ej.: «EVA LAB». */
  label?: string;
}) {
  return (
    <div className="mt-10 border-t border-border pt-6">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <StatusLabel>{status}</StatusLabel>
        {label ? (
          <span className="eva-mono rounded-eva border border-border px-2.5 py-1 text-muted">
            {label}
          </span>
        ) : null}
      </div>
      <p className="mt-5 max-w-[46ch] text-[0.95rem] leading-relaxed text-muted">
        {note}
      </p>
    </div>
  );
}

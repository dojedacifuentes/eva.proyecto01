import { StateTag } from '@/components/panel/StateTag';
import type { PanelSection } from '@/lib/panel';

/**
 * Un capítulo del panel: rótulo numerado a la izquierda, ítems a la derecha.
 *
 * Es la misma rejilla asimétrica de la landing, para que el panel se lea como
 * parte del mismo documento y no como una herramienta pegada aparte.
 *
 * Cada ítem termina en su fuente. Cuando no hay fuente se dice — «sin respaldo
 * documental» — en lugar de dejar el hueco en blanco, que es como se cuelan los
 * datos sin verificar.
 */
export function PanelSectionBlock({ section }: { section: PanelSection }) {
  return (
    <section
      id={`s-${section.number}`}
      className="eva-section scroll-mt-28 first:border-t-0"
    >
      <div className="eva-container">
        <div className="eva-grid eva-reveal">
          <div>
            <p className="eva-mono flex items-center gap-3">
              <span className="text-accent-ink">{section.number}</span>
              <span aria-hidden="true" className="h-px w-6 bg-border" />
              <span className="text-muted">{section.items.length} ítems</span>
            </p>
            <h2 className="mt-6 text-2xl leading-tight tracking-[-0.02em] text-balance md:text-3xl">
              {section.title}
            </h2>
            {section.note ? (
              <p className="mt-5 max-w-[38ch] text-[0.9375rem] leading-relaxed text-pretty text-muted">
                {section.note}
              </p>
            ) : null}
          </div>

          <ul className="border-t border-border">
            {section.items.map((item, index) => (
              /*
               * Rejilla de dos columnas con la primera de ancho fijo: el estado
               * a la izquierda y, alineados en la misma vertical, el texto y su
               * fuente. Con flex y márgenes la fuente quedaba desalineada
               * respecto al texto que respalda, que es justo el par que hay que
               * poder leer de un tirón.
               */
              <li
                key={`${section.number}-${index}`}
                className="grid gap-x-5 gap-y-3 border-b border-border py-5 md:grid-cols-[11rem_minmax(0,1fr)]"
              >
                <div className="flex items-start">
                  <StateTag state={item.state} />
                </div>

                <div className="min-w-0">
                  <p className="text-[1.0625rem] leading-relaxed text-pretty">
                    {item.text}
                  </p>
                  <p className="eva-mono mt-2.5 break-words text-muted">
                    {item.source ? (
                      <>
                        <span aria-hidden="true" className="pr-2 text-accent">
                          ↳
                        </span>
                        {item.source}
                      </>
                    ) : (
                      <span className="opacity-70">Sin respaldo documental</span>
                    )}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

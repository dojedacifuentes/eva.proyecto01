import type { ReactNode } from 'react';

/**
 * Cabecera de capítulo: rótulo a la izquierda, cuerpo desplazado a la derecha.
 * La rejilla asimétrica es la que da el ritmo editorial de toda la página; en
 * móvil se apila sin perderlo.
 *
 * El rótulo abre con el número del capítulo, en el mismo lenguaje que el índice
 * del hero y la barra: cifra en el color de EVA, filete, categoría. Es lo que
 * convierte la página en un documento numerado en lugar de una sucesión de
 * bloques.
 */
export function SectionIntro({
  id,
  number,
  eyebrow,
  title,
  text,
  children,
}: {
  id: string;
  number: string;
  eyebrow: string;
  title: string;
  text: string;
  /** Cuerpo del capítulo: estado vacío hoy, colección mañana. */
  children?: ReactNode;
}) {
  return (
    <section id={id} className="eva-section">
      <div className="eva-container">
        <div className="eva-grid eva-reveal">
          <div>
            <p className="eva-mono flex items-center gap-3">
              <span className="text-accent-ink">{number}</span>
              <span aria-hidden="true" className="h-px w-6 bg-border" />
              <span className="text-muted">{eyebrow}</span>
            </p>
            <h2 className="mt-6 text-3xl leading-[1.05] tracking-[-0.02em] text-balance md:text-5xl">
              {title}
            </h2>
          </div>

          <div className="max-w-[62ch]">
            <p className="text-lg leading-relaxed text-pretty text-muted md:text-xl">
              {text}
            </p>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

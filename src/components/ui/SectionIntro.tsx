import type { ReactNode } from 'react';

/**
 * Cabecera de capítulo: rótulo a la izquierda, cuerpo desplazado a la derecha.
 * La rejilla asimétrica es la que da el ritmo editorial de toda la página; en
 * móvil se apila sin perderlo.
 */
export function SectionIntro({
  id,
  eyebrow,
  title,
  text,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  text: string;
  /** Cuerpo del capítulo: estado vacío hoy, colección mañana. */
  children?: ReactNode;
}) {
  return (
    <section id={id} className="eva-section">
      <div className="eva-container">
        <div className="eva-grid">
          <div>
            <p className="eva-mono text-accent-ink">
              <span aria-hidden="true" className="pr-2 text-accent">
                —
              </span>
              {eyebrow}
            </p>
            <h2 className="mt-5 text-3xl leading-[1.05] tracking-tight text-balance md:text-5xl">
              {title}
            </h2>
          </div>

          <div className="max-w-[62ch]">
            <p className="text-lg leading-relaxed text-muted md:text-xl">
              {text}
            </p>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

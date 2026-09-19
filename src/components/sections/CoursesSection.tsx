import type { CSSProperties } from 'react';
import { sections } from '@/content/site';

/**
 * Cursos: sección reservada. Se muestra vacía a propósito — hay estructura,
 * todavía no hay programa. Ninguna ficha aquí promete contenido inexistente.
 */
export function CoursesSection() {
  const copy = sections.courses;

  return (
    <section id="cursos" className="slide section section--ruled" aria-labelledby="cursos-titulo">
      <div className="wrap">
        <div className="module__head reveal">
          <span aria-hidden="true" className="module__code module__code--empty" />
          <div>
            <p className="eyebrow mono">{copy.eyebrow}</p>
            <h2 id="cursos-titulo" className="h2">
              {copy.title}
            </h2>
            <p className="lede">{copy.lede}</p>
          </div>
        </div>

        <div className="slots reveal" aria-label={copy.emptyLabel}>
          {copy.slots.map((slot, index) => (
            <div key={slot} className="slot" style={{ '--d': `${index * 180}ms` } as CSSProperties}>
              <span aria-hidden="true" className="slot__scan" />
              <span className="slot__code mono">{slot}</span>
              <span className="slot__state mono">
                <i aria-hidden="true" />
                Reservado
              </span>
            </div>
          ))}
        </div>

        <p className="aside">{copy.emptyText}</p>
      </div>
    </section>
  );
}

import type { CSSProperties } from 'react';
import { modules } from '@/content/modules';
import { flags, sections } from '@/content/site';
import { getModuleSummary } from '@/lib/content';

/**
 * Selector de universos: cuatro cuadrados con glifo que muta (círculo ↔ cuadrado),
 * barrido de escaneo y esquinas de retícula. Un acento por universo.
 */
export function ModuleGrid() {
  const copy = sections.universes;
  const visible = modules.filter((module) => module.id !== 'news' || flags.news);

  return (
    <section id="sistema" className="slide section section--ruled" aria-labelledby="sistema-titulo">
      <div className="wrap system">
        <div className="system__intro reveal">
          <p className="eyebrow mono">{copy.eyebrow}</p>
          <h2 id="sistema-titulo" className="h2">
            {copy.title}
          </h2>
          <p className="lede">{copy.lede}</p>
          <p className="system__tags mono">
            <span>Aprendizaje</span>
            <span>Criterio</span>
            <span>Experimentación</span>
          </p>
        </div>

        <div className="universes">
          {visible.map((module, index) => (
            <a
              key={module.id}
              href={module.href}
              className="universe reveal"
              data-accent={module.accent}
              data-sound="open"
              data-cursor-label={module.name.toUpperCase()}
              style={{ '--d': `${index * 110}ms` } as CSSProperties}
            >
              {(['tl', 'tr', 'bl', 'br'] as const).map((corner) => (
                <span key={corner} aria-hidden="true" className={`universe__corner universe__corner--${corner}`} />
              ))}
              <span aria-hidden="true" className="universe__scan" />

              <span className="universe__top mono">
                <span className="universe__code">
                  {module.code} / 0{visible.length}
                </span>
                <span>{module.intent}</span>
              </span>

              <span aria-hidden="true" className="universe__glyph">
                <i />
                <i />
              </span>

              <span className="universe__name">{module.name}</span>
              <span className="universe__tagline">{module.tagline}</span>

              <span className="universe__foot mono">
                {flags.counters ? <span>{getModuleSummary(module.id)}</span> : <span />}
                <span aria-hidden="true" className="universe__go">
                  ↓
                </span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

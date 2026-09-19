import { modules } from '@/content/modules';
import { flags, sections } from '@/content/site';
import { getModuleSummary } from '@/lib/content';

/** Selector de universos: bento asimétrico, una textura y un acento por universo. */
export function ModuleGrid() {
  const copy = sections.universes;
  const visible = modules.filter((module) => module.id !== 'news' || flags.news);

  return (
    <section id="sistema" className="section section--ruled" aria-labelledby="sistema-titulo">
      <div className="wrap project-overview">
        <div id="eva" className="project-overview__intro">
        <p className="eyebrow mono">{copy.eyebrow}</p>
        <h2 id="sistema-titulo" className="h2">
          {copy.title}
        </h2>
        <p className="lede">{copy.lede}</p>
        <div className="project-overview__tags mono"><span>Aprendizaje</span><span>Criterio</span><span>Experimentación</span></div>
        </div>

        <div className="universes">
          {visible.map((module) => (
            <a
              key={module.id}
              href={module.href}
              className="universe reveal"
              data-accent={module.accent}
              data-sound="open"
              data-cursor-label={module.name.toUpperCase()}
            >
              <span className="universe__top mono">
                <span className="universe__code">
                  {module.code} / 0{visible.length}
                </span>
                <span>{module.intent}</span>
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

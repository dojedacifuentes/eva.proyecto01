import { flags, sections } from '@/content/site';
import { getArchiveStats } from '@/lib/content';

/** Amplitud del sistema, con cifras derivadas de las colecciones. */
export function ArchiveStats() {
  const copy = sections.archive;
  const stats = getArchiveStats().filter((stat) => stat.label !== 'Noticias' || flags.news);

  return (
    <section id="archivo" className="section section--ruled" aria-labelledby="archivo-titulo">
      <div className="wrap">
        <p className="eyebrow mono">{copy.eyebrow}</p>
        <h2 id="archivo-titulo" className="h2">
          {copy.title}
        </h2>
        <p className="lede">{copy.lede}</p>

        {flags.counters && (
          <dl className="stats reveal">
            {stats.map((stat) => (
              <div key={stat.label} className="stat">
                <dt className="stat__label mono">
                  {stat.label}
                  {stat.note && <span className="stat__note">{stat.note}</span>}
                </dt>
                <dd className="stat__value" data-zero={stat.value === 0}>
                  {String(stat.value).padStart(2, '0')}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}

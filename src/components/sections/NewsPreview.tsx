import { ExternalLink } from '@/components/ui/ExternalLink';
import { sections } from '@/content/site';
import { formatDate, getModule, getPublishedNews, isLive } from '@/lib/content';

/** Última señal: como máximo tres entradas de EVA News en la portada. */
export function NewsPreview() {
  const current = getModule('news');
  const items = getPublishedNews(3);
  const copy = sections.news;
  const hasDemo = items.some((item) => item.demo);

  return (
    <section
      id="news"
      className="section section--ruled"
      aria-labelledby="news-titulo"
      data-accent={current.accent}
    >
      <div className="wrap">
        <div className="module__head reveal">
          <span aria-hidden="true" className="module__code">
            {current.code}
          </span>
          <div>
            <p className="eyebrow mono">{copy.eyebrow}</p>
            <h2 id="news-titulo" className="h2">
              {current.name}
            </h2>
            <p className="lede">{copy.lede}</p>
          </div>
        </div>

        {hasDemo && (
          <p className="notice">
            <span className="mono">{copy.demoBadge}</span>
            {copy.demoNotice}
          </p>
        )}

        <div className="news">
          {items.map((item) => (
            <article key={item.id} className="news__item reveal">
              <p className="news__meta mono">
                <time dateTime={item.date}>{formatDate(item.date)}</time>
                <span>{item.category}</span>
                {item.demo && <span className="news__demo">{copy.demoBadge}</span>}
              </p>
              <div>
                <h3 className="news__title">{item.title}</h3>
                <p className="news__summary">{item.summary}</p>
                <p className="news__why">
                  <span className="mono">{copy.whyLabel}</span>
                  {item.whyItMatters}
                </p>
                <p className="news__source">
                  Fuente:{' '}
                  {isLive(item.sourceUrl) ? (
                    <ExternalLink href={item.sourceUrl}>{item.source}</ExternalLink>
                  ) : (
                    item.source
                  )}
                </p>
              </div>
              <p className="news__comment">
                <span className="mono">{copy.commentLabel}</span>
                {item.evaComment}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

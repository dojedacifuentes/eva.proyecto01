import Link from 'next/link';
import { chapters, closing, hero, links } from '@/data/eva';

/**
 * Portada.
 *
 * Titular, una línea de qué es esto y el índice de capítulos. El índice repite
 * el mapa del lateral en formato de lista larga, porque en la portada —y en
 * móvil, donde no hay lateral— es lo primero que hace falta.
 */
export default function Home() {
  return (
    <>
      <section className="eva-container pt-16 pb-14 md:pt-28 md:pb-20">
        <p className="eva-enter eva-mono text-muted">
          <span aria-hidden="true" className="pr-2.5 text-accent">
            —
          </span>
          {hero.eyebrow}
        </p>

        <h1 className="eva-enter mt-10 text-[clamp(2.75rem,8vw,5.75rem)] leading-[0.94] font-medium tracking-[-0.035em] [animation-delay:60ms] md:mt-14">
          {hero.title.before}{' '}
          <span className="eva-seal font-normal">{hero.title.symbol}</span>{' '}
          {hero.title.after}
          <br />
          {hero.title.second}
        </h1>

        <p className="eva-enter mt-10 max-w-[46ch] text-lg leading-relaxed text-pretty text-muted [animation-delay:120ms] md:mt-14 md:text-xl">
          {hero.subtitle}
        </p>
      </section>

      <section className="eva-container pb-16 md:pb-24">
        <p className="eva-mono text-muted">{hero.indexLabel}</p>

        <ul className="mt-6 border-t border-border">
          {chapters.map((chapter) => (
            <li key={chapter.id}>
              <Link
                href={chapter.href}
                className="eva-row group grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-2 border-b border-border py-6 md:grid-cols-[3.5rem_minmax(0,14rem)_minmax(0,1fr)_auto] md:py-7"
              >
                <span className="eva-mono text-accent-ink">
                  {chapter.number}
                </span>
                <span className="text-xl tracking-[-0.01em] md:text-2xl">
                  {chapter.label}
                </span>
                <span className="col-span-2 max-w-[52ch] text-[0.9375rem] leading-relaxed text-pretty text-muted md:col-span-1">
                  {chapter.eyebrow.charAt(0) + chapter.eyebrow.slice(1).toLowerCase()}
                </span>
                <span
                  aria-hidden="true"
                  className="eva-mono justify-self-end text-muted transition-colors group-hover:text-accent-ink"
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-surface">
        <div className="eva-container py-16 md:py-24">
          <h2 className="max-w-[18ch] text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.08] font-medium tracking-[-0.02em] text-balance">
            {closing.title}
          </h2>
          <p className="mt-8 max-w-[56ch] text-lg leading-relaxed text-pretty text-muted">
            {closing.text}
          </p>
          <a
            href={links.instagram}
            target="_blank"
            rel="noreferrer noopener"
            className="eva-link mt-10 inline-block py-1 text-[0.9375rem]"
          >
            {closing.link} <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>
    </>
  );
}

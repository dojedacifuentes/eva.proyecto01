import { ChapterIndex } from '@/components/sections/ChapterIndex';
import { hero } from '@/data/eva';

/**
 * Hero tipográfico. La única nota de color es el signo «+» del titular; todo
 * lo demás lo sostienen la escala, el tracking y el espacio.
 *
 * La composición es idéntica en los dos modos: lo que cambia es la atmósfera
 * del fondo, no la jerarquía.
 */
export function Hero() {
  return (
    <section id="top" className="eva-container pt-20 pb-16 md:pt-32 md:pb-24">
      <p className="eva-enter eva-mono text-muted">
        <span aria-hidden="true" className="pr-2.5 text-accent">
          —
        </span>
        {hero.eyebrow}
      </p>

      <h1 className="eva-enter mt-10 text-[clamp(2.75rem,10vw,7.5rem)] leading-[0.94] font-medium tracking-[-0.035em] [animation-delay:60ms] md:mt-14">
        {hero.title.before}{' '}
        <span className="eva-seal font-normal">{hero.title.symbol}</span>{' '}
        {hero.title.after}
        <br />
        {hero.title.second}
      </h1>

      <div className="eva-enter mt-12 max-w-[34ch] [animation-delay:120ms] md:mt-20 md:ml-[41.666%]">
        <p className="text-lg leading-relaxed text-muted md:text-xl">
          {hero.subtitle}
        </p>
      </div>

      <div className="eva-enter mt-16 [animation-delay:180ms] md:mt-28">
        <ChapterIndex />
      </div>
    </section>
  );
}

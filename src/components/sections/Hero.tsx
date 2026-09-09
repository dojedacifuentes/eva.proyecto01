import { hero } from '@/data/eva';

/**
 * Hero tipográfico. Sin fotografía, sin demo de terminal, sin decoración: el
 * peso lo llevan el tamaño del titular y el aire que lo rodea.
 */
export function Hero() {
  return (
    <section id="top" className="eva-container pt-20 pb-24 md:pt-36 md:pb-40">
      <div className="eva-enter">
        <p className="eva-mono text-accent-ink">
          <span aria-hidden="true" className="pr-2 text-accent">
            —
          </span>
          {hero.eyebrow}
        </p>
      </div>

      <h1 className="eva-enter mt-10 max-w-[17ch] text-[clamp(2.25rem,7.2vw,5.25rem)] leading-[1.02] font-medium tracking-[-0.025em] text-balance [animation-delay:60ms]">
        {hero.title}
      </h1>

      <div className="eva-enter mt-12 max-w-[58ch] [animation-delay:120ms] md:mt-16 md:ml-[33.333%]">
        <p className="text-lg leading-relaxed text-muted md:text-xl">
          {hero.subtitle}
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
          <a
            href={hero.primaryCta.href}
            className="rounded-eva bg-foreground px-6 py-3.5 text-[0.9375rem] text-background transition-colors hover:bg-accent-ink"
          >
            {hero.primaryCta.label}
          </a>
          <a
            href={hero.secondaryCta.href}
            className="eva-link py-1 text-[0.9375rem]"
          >
            {hero.secondaryCta.label} <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}

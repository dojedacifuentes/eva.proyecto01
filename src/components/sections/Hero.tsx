import { ChapterIndex } from '@/components/sections/ChapterIndex';
import { EvaAvatar } from '@/components/sections/EvaAvatar';
import { hero } from '@/data/eva';

/**
 * Hero tipográfico. La única nota de color es el signo «+» del titular; todo
 * lo demás lo sostienen la escala, el tracking y el espacio.
 *
 * EVA entra a la derecha, a la altura del subtexto y nunca por encima del
 * titular: la frase sigue mandando y ella responde. En móvil se apila debajo,
 * porque un retrato que empuja el titular fuera de la primera pantalla deja de
 * ser presencia y pasa a ser estorbo.
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

      <h1 className="eva-enter mt-10 text-[clamp(2.75rem,9vw,6.5rem)] leading-[0.94] font-medium tracking-[-0.035em] [animation-delay:60ms] md:mt-14">
        {hero.title.before}{' '}
        <span className="eva-seal font-normal">{hero.title.symbol}</span>{' '}
        {hero.title.after}
        <br />
        {hero.title.second}
      </h1>

      <div className="mt-12 grid gap-12 md:mt-20 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-16">
        <div className="eva-enter max-w-[42ch] [animation-delay:120ms] lg:pt-2 lg:pl-[14%]">
          <p className="text-lg leading-relaxed text-muted md:text-xl">
            {hero.subtitle}
          </p>
        </div>

        <div className="eva-enter [animation-delay:180ms]">
          <EvaAvatar />
        </div>
      </div>

      <div className="eva-enter mt-16 [animation-delay:240ms] md:mt-24">
        <ChapterIndex />
      </div>
    </section>
  );
}

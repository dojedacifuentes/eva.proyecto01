import type { CSSProperties } from 'react';
import { EvaPortraitFrame } from '@/components/eva/EvaPortraitFrame';
import { Rotator } from '@/components/eva/Rotator';
import { images } from '@/content/assets';
import { flags, hero, site } from '@/content/site';

const rise = (i: number) => ({ '--i': i }) as CSSProperties;

export function HeroEva() {
  return (
    <section id="inicio" className="hero" aria-labelledby="hero-titulo">
      <div className="wrap hero__grid">
        <div className="hero__head">
          <p className="hero__label mono" data-rise style={rise(0)}>
            {hero.label}
          </p>

          {/* El h1 lleva la lectura lineal; el acrónimo vertical es su versión visual. */}
          <h1 id="hero-titulo" className="sr-only">
            {site.name} — {site.expansion}
          </h1>
          <div className="acronym" aria-hidden="true">
            {hero.acronym.map((row, index) => (
              <div key={row.letter} className="acronym__row" data-rise style={rise(index + 1)}>
                <span className="acronym__letter">{row.letter}</span>
                <span className="acronym__word">
                  {row.word}
                  <span className="acronym__index mono">0{index + 1}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <EvaPortraitFrame
          image={images.heroPortrait}
          caption={hero.portraitCaption}
          sizes="(min-width: 48rem) 40vw, 100vw"
          priority
        />

        <div className="hero__context">
          <div data-rise style={rise(4)}>
            <p className="hero__online">{hero.online}</p>
            <p className="hero__lede">{hero.lede}</p>
          </div>

          <dl className="purpose" data-rise style={rise(5)}>
            <div>
              <dt className="mono">{hero.mission.label}</dt>
              <dd>{hero.mission.text}</dd>
            </div>
            <div className="purpose__endgame">
              <dt className="mono">{hero.endgame.label}</dt>
              <dd>{hero.endgame.text}</dd>
            </div>
          </dl>

          <div className="hero__actions" data-rise style={rise(6)}>
            <a href={hero.actions.primary.href} className="btn btn--solid" data-sound="open">
              {hero.actions.primary.label}
              <span aria-hidden="true" className="btn__arrow">
                ↓
              </span>
            </a>
            <a href={hero.actions.secondary.href} className="btn btn--ghost">
              {hero.actions.secondary.label}
            </a>
          </div>

          {flags.heroRotator && <Rotator lines={hero.rotator} />}
        </div>
      </div>
    </section>
  );
}

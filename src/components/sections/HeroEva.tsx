import type { CSSProperties } from 'react';
import { EvaProfile } from '@/components/eva/EvaProfile';
import { Rotator } from '@/components/eva/Rotator';
import { flags, hero, site, studio, ui } from '@/content/site';

const rise = (i: number) => ({ '--i': i }) as CSSProperties;

/**
 * Portada: acrónimo vertical a la izquierda, EVA a la derecha y la franja de
 * principios abajo. Todo dentro de un marco técnico que cabe en una pantalla.
 */
export function HeroEva() {
  return (
    <section id="inicio" className="slide hero" aria-labelledby="hero-titulo">
      <div className="wrap">
        <div className="panel hero__frame">
          <div className="panel__bar mono">
            <span>EVA / Proyecto 01</span>
            <span className="panel__status">{hero.online}</span>
          </div>

          <div className="hero__grid">
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

              <p className="hero__lede" data-rise style={rise(4)}>
                {hero.lede}
              </p>

              <div className="hero__actions" data-rise style={rise(5)}>
                <a href={hero.actions.primary.href} className="btn btn--solid" data-sound="open">
                  {hero.actions.primary.label}
                  <span aria-hidden="true" className="btn__arrow">
                    ↓
                  </span>
                </a>
                <a href={hero.actions.secondary.href} className="btn btn--ghost" data-sound="open">
                  {hero.actions.secondary.label}
                </a>
              </div>

              {flags.heroRotator && <Rotator lines={hero.rotator} />}
            </div>

            {/* Sin data-rise: su transform haría de este div el bloque contenedor
                del retrato, que en móvil se posiciona contra la rejilla. */}
            <div className="hero__portrait">
              <EvaProfile />

              {/* Ficha del estudio: el único enlace saliente de la portada. */}
              <a
                className="studio"
                data-rise
                style={rise(3)}
                href={studio.href}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="external"
                data-cursor-label={studio.cta.toUpperCase()}
                data-sound="open"
              >
                <span className="studio__label mono">{studio.label}</span>
                <span className="studio__name">
                  {studio.name}
                  <span aria-hidden="true" className="studio__arrow">
                    ↗
                  </span>
                </span>
                <span className="studio__services mono">{studio.services.join(' · ')}</span>
                <span className="sr-only"> ({ui.external})</span>
              </a>
            </div>
          </div>

          <div className="principles" aria-label="Misión, visión y objetivos">
            {hero.principles.map((item, index) => (
              <article className="principle" key={item.title} data-rise style={rise(6 + index)}>
                <div className="principle__label mono">
                  <span>0{index + 1}</span>
                  <h2>{item.title}</h2>
                  <span aria-hidden="true" className="principle__mark" />
                </div>
                <p>{item.text}</p>
                <span className="principle__aside">{item.aside}</span>
              </article>
            ))}
          </div>
        </div>

        <p className="slide__foot mono">
          <span>Un proyecto en evolución</span>
          <a href="#sistema" data-sound="open">
            01 — El sistema <span aria-hidden="true">↓</span>
          </a>
        </p>
      </div>
    </section>
  );
}

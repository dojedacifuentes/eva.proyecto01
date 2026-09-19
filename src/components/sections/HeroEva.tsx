import type { CSSProperties } from 'react';
import { EvaAcronymMesh } from '@/components/eva/EvaAcronymMesh';
import { EvaDnaHelix } from '@/components/eva/EvaDnaHelix';
import { EvaProfile } from '@/components/eva/EvaProfile';
import { hero, site } from '@/content/site';

const rise = (i: number) => ({ '--i': i }) as CSSProperties;

/**
 * Portada: el acrónimo, el genoma y EVA mirándose a sí misma. Sin texto
 * corrido ni botones: lo que hay que explicar se explica más abajo, y lo que
 * EVA está pensando vive en su panel flotante.
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
              {/* Las letras son una red de nodos dibujada en un lienzo; las
                  palabras van al lado, en su fila. */}
              <div className="acronym" aria-hidden="true">
                <EvaAcronymMesh
                  letters={hero.acronym.map((row) => row.letter)}
                  fontVar="--font-orbitron"
                />
                <div className="acronym__words">
                  {hero.acronym.map((row, index) => (
                    <div key={row.letter} className="acronym__row" data-rise style={rise(index + 1)}>
                      <span className="acronym__word">{row.word}</span>
                      <span className="acronym__index mono">0{index + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* El genoma y el retrato son el mismo sistema visto dos veces: lo que
                se hace en uno se nota en el otro. */}
            <EvaDnaHelix />

            <div className="hero__portrait">
              <EvaProfile />
            </div>
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

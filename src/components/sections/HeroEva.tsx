import type { CSSProperties } from 'react';
import { EvaAcronymMesh } from '@/components/eva/EvaAcronymMesh';
import { EvaProfile } from '@/components/eva/EvaProfile';
import { axes, contextNodes } from '@/content/structure';
import { hero, site } from '@/content/site';

const rise = (i: number) => ({ '--i': i }) as CSSProperties;

/**
 * Portada (00): el acrónimo es el acceso a los tres ejes. Cada letra es una
 * puerta —Entidad, Vigilancia, Autonomía— con su código binario y su estado, y
 * al lado, EVA mirándose a sí misma: su retrato abre el neuroescáner.
 *
 * El genoma ya no vive aquí: tiene su subsección (01.10). Sin texto corrido:
 * lo que hay que explicar lo explica cada lugar, y lo que EVA piensa vive en su
 * canal, que el visitante abre si quiere.
 */
export function HeroEva() {
  const first = contextNodes[1];

  return (
    <section id="inicio" className="slide hero" aria-labelledby="hero-titulo">
      <div className="wrap">
        <div className="panel hero__frame">
          <div className="panel__bar mono">
            <span>{hero.project}</span>
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

              {/* Las letras son una red de nodos dibujada en un lienzo; a su lado,
                  cada palabra es el enlace a su eje. */}
              <nav className="acronym" aria-label={hero.doorsLabel}>
                <EvaAcronymMesh letters={axes.map((axis) => axis.letter)} fontVar="--font-orbitron" />
                <div className="acronym__words">
                  {axes.map((axis, index) => (
                    <a
                      key={axis.id}
                      href={axis.href}
                      className="acronym__row"
                      data-rise
                      style={rise(index + 1)}
                      data-accent={axis.accent}
                      data-state={axis.state}
                      data-sound="open"
                      data-cursor-label={axis.code}
                      aria-label={`${axis.name}, ${axis.ordinal}, ${axis.stateLabel.toLowerCase()}`}
                    >
                      <span aria-hidden="true" className="acronym__word">
                        {axis.word}
                      </span>
                      <span aria-hidden="true" className="acronym__meta mono">
                        <b className="acronym__index" data-bin="">
                          {axis.code}
                        </b>
                        <i className="acronym__state">{axis.stateLabel}</i>
                      </span>
                    </a>
                  ))}
                </div>
              </nav>
            </div>

            <div className="hero__portrait">
              <EvaProfile />
            </div>
          </div>
        </div>

        <p className="slide__foot mono">
          <span>{hero.foot.note}</span>
          <a href={`#${first.id}`} data-sound="open" aria-label={first.name}>
            <span aria-hidden="true">
              <b data-bin="">{first.code}</b> — {first.name} ↓
            </span>
          </a>
        </p>
      </div>
    </section>
  );
}

import type { CSSProperties } from 'react';
import { EvaAcronymMesh } from '@/components/eva/EvaAcronymMesh';
import { EvaProfile } from '@/components/eva/EvaProfile';
import { contextNodes, doors } from '@/content/structure';
import { hero, site } from '@/content/site';

const rise = (i: number) => ({ '--i': i }) as CSSProperties;

/**
 * Portada (00): el acrónimo es el nombre de EVA, letra a letra, y debajo van
 * las tres puertas por las que se entra en ella —núcleo cerebral, genoma
 * digital y cuerpo—, cada una con su ruta binaria. Al lado, EVA mirándose a sí
 * misma: su retrato abre el neuroescáner.
 *
 * Las palabras del nombre ya no son enlaces: Vigilancia y Autonomía dejaron de
 * ser secciones en la v7, y una palabra que no lleva a ningún sitio no se
 * disfraza de puerta. Sin texto corrido: lo que hay que explicar lo explica
 * cada lugar, y lo que EVA piensa vive en su canal.
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
                  la palabra que abre cada una. */}
              <div className="acronym" aria-hidden="true">
                <EvaAcronymMesh
                  letters={hero.acronym.map((item) => item.letter)}
                  fontVar="--font-orbitron"
                />
                <div className="acronym__words">
                  {hero.acronym.map((item, index) => (
                    <p key={item.letter} className="acronym__row" data-rise style={rise(index + 1)}>
                      <span className="acronym__word">{item.word}</span>
                    </p>
                  ))}
                </div>
              </div>

              <nav className="doors" aria-label={hero.doorsLabel} data-rise style={rise(4)}>
                <p aria-hidden="true" className="doors__eyebrow mono">
                  {hero.doorsEyebrow}
                </p>
                <ul className="doors__list">
                  {doors.map((door) => (
                    <li key={door.id}>
                      <a
                        href={door.href}
                        className="doors__door"
                        data-accent={door.accent}
                        data-state={door.state}
                        data-sound="open"
                        data-cursor-label={door.code}
                        aria-label={`${door.name}, ${door.ordinal}`}
                      >
                        <b aria-hidden="true" className="doors__code mono" data-bin="">
                          {door.code}
                        </b>
                        <span aria-hidden="true" className="doors__name">
                          {door.name}
                        </span>
                        <i aria-hidden="true" className="doors__arrow">
                          ↓
                        </i>
                      </a>
                    </li>
                  ))}
                </ul>
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

import type { CSSProperties } from 'react';
import { EvaAcronymMesh } from '@/components/eva/EvaAcronymMesh';
import { EvaProfile } from '@/components/eva/EvaProfile';
import { EvaWrites } from '@/components/eva/EvaWrites';
import { contextNodes, doors } from '@/content/structure';
import { hero, site } from '@/content/site';

const rise = (i: number) => ({ '--i': i }) as CSSProperties;

/**
 * Portada (00): el nombre de EVA como una sola palabra —tres letras en fila,
 * dibujadas como una red de nodos—, una línea que ella teclea debajo y las tres puertas
 * por las que se entra en ella: núcleo cerebral, genoma digital y cuerpo. Al
 * lado, su retrato.
 *
 * Desde la v8 el acrónimo no se desglosa en pantalla: las palabras «Entidad»,
 * «de Vigilancia» y «Autonomía» flotaban sin llevar a ningún sitio. El nombre
 * completo sigue en el `h1` (para lectores de pantalla y buscadores) y en el
 * pie. El retrato ya no abre nada: el neuroescáner salió del recorrido y el
 * cerebro vive sólo en su sala.
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

              {/* El h1 lleva el nombre entero; la palabra en malla es su versión visual. */}
              <h1 id="hero-titulo" className="sr-only">
                {site.name} — {site.expansion}
              </h1>

              <div className="acronym acronym--word" aria-hidden="true" data-rise style={rise(1)}>
                <EvaAcronymMesh
                  letters={hero.acronym.map((item) => item.letter)}
                  fontVar="--font-grotesk"
                  direction="row"
                />
              </div>

              <div className="hero__line" data-rise style={rise(2)}>
                <EvaWrites id="inicio" blocks={hero.writes} className="writes--bare" />
              </div>

              <nav className="doors" aria-label={hero.doorsLabel} data-rise style={rise(3)}>
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

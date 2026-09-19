import Image from 'next/image';
import { images } from '@/content/assets';
import { hero, site } from '@/content/site';

export function HeroEva() {
  const portrait = images.heroPortrait;
  return (
    <section id="inicio" className="intro" aria-labelledby="hero-titulo">
      <div className="wrap">
        <div className="intro__frame">
          <div className="intro__bar mono">
            <span>EVA / Proyecto 01</span>
            <span className="intro__status">En línea</span>
          </div>
          <div className="intro__main">
            <div className="intro__identity">
              <p className="eyebrow mono">Conoce a EVA</p>
              <h1 id="hero-titulo" className="intro__name" aria-label={site.expansion}>
                <span><b>E</b>ntidad</span>
                <span><b>V</b>irtual</span>
                <span><small>de </small><b>A</b>prendizaje</span>
              </h1>
              <p className="intro__description">{hero.lede}</p>
              <a href="#sistema" className="intro__link">Explorar el proyecto <span aria-hidden="true">↗</span></a>
            </div>
            <figure className="intro__portrait">
              <div className="intro__portrait-image">
                <Image src={portrait.src} alt="EVA, la identidad virtual del proyecto" width={portrait.width} height={portrait.height} sizes="(max-width: 600px) 90px, 190px" priority />
              </div>
              <figcaption><span className="mono">EVA / 01</span><span>Inteligencia con criterio.</span></figcaption>
            </figure>
          </div>
          <div className="principles" aria-label="Misión, visión y objetivos">
            {hero.principles.map((item, index) => (
              <article className="principle" key={item.title}>
                <div className="principle__label mono"><span>0{index + 1}</span><h2>{item.title}</h2><span aria-hidden="true">+</span></div>
                <p>{item.text}</p>
                <span className="principle__aside">{item.aside}</span>
              </article>
            ))}
          </div>
        </div>
        <div className="intro__foot mono"><span>Un proyecto en evolución</span><a href="#sistema">01 — El proyecto <span aria-hidden="true">↓</span></a></div>
      </div>
    </section>
  );
}

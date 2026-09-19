import { EvaPortraitFrame } from '@/components/eva/EvaPortraitFrame';
import { images } from '@/content/assets';
import { about } from '@/content/site';

export function AboutEva() {
  return (
    <section id="eva" className="section section--ruled about" aria-labelledby="eva-titulo">
      <div className="wrap about__grid">
        <div className="reveal">
          <EvaPortraitFrame
            image={images.aboutPortrait}
            sizes="(min-width: 56rem) 24rem, 100vw"
            tall
          />
        </div>
        <div className="about__body reveal">
          <p className="eyebrow mono">{about.eyebrow}</p>
          <h2 id="eva-titulo" className="h2">
            {about.title}
          </h2>
          {about.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <p className="aside">{about.aside}</p>
          <dl className="traits">
            {about.traits.map((trait) => (
              <div key={trait.label}>
                <dt className="mono">{trait.label}</dt>
                <dd>{trait.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

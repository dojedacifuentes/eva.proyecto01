import type { Metadata, Viewport } from 'next';
import '../marca.css';
import './links.css';
import { ArcadeHero } from '@/components/links/ArcadeHero';
import { EvaGateway } from '@/components/links/EvaGateway';
import { EntryCard } from '@/components/links/EntryCard';
import { groups, links, type LinkGroup } from '@/content/links';
import { seeded } from '@/lib/random';

export const metadata: Metadata = {
  title: links.seo.title,
  description: links.seo.description,
  alternates: { canonical: '/links' },
  openGraph: {
    type: 'website',
    url: '/links',
    title: links.seo.ogTitle,
    description: links.seo.ogDescription,
  },
  twitter: {
    card: 'summary_large_image',
    title: links.seo.ogTitle,
    description: links.seo.ogDescription,
  },
};

/** `viewport-fit=cover` para que Safari en iOS dé las zonas seguras (`env(safe-area-inset-*)`). */
export const viewport: Viewport = {
  themeColor: '#03040d',
  colorScheme: 'dark',
  viewportFit: 'cover',
};

/** Unas pocas estrellas, siempre las mismas: más hacia los bordes, donde está la nebulosa. */
const STARS = (() => {
  const random = seeded(1725);
  return Array.from({ length: 22 }, () => {
    const side = random() < 0.5 ? -1 : 1;
    const x = 50 + side * (12 + random() * 38);
    return {
      x: Math.round(x * 10) / 10,
      y: Math.round(random() * 1000) / 10,
      r: Math.round((0.5 + random() * 0.7) * 100) / 100,
      o: Math.round((0.25 + random() * 0.45) * 100) / 100,
    };
  });
})();

/** Un grupo de la página: su rótulo y sus tarjetas. */
function Group({ group }: { group: LinkGroup }) {
  return (
    <section
      className={`arcade-group${group.featured ? ' arcade-group--featured' : ''}`}
      aria-labelledby={`group-${group.id}`}
    >
      <h2 id={`group-${group.id}`} className="arcade-group__label mono">
        <span aria-hidden="true">↓</span> {group.label}
      </h2>
      <ul className="arcade-group__list" role="list">
        {group.entries.map((entry) => (
          <li key={entry.id}>
            <EntryCard entry={entry} featured={group.featured} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * `/links`: la entrada desde las redes. EVA ARCADE y sus juegos arriba; debajo,
 * EVA ACADEMY y EVA LAB (el curso y el generador de prompts de EVA LAB); al
 * final, la puerta a la landing. Sin el campo de partículas, la cabecera ni el
 * canal de la landing (no pasa por `SiteChrome`): todo es HTML, CSS y SVG, y
 * lo único que se anima es el símbolo al llegar.
 */
export default function LinksPage() {
  const visible = groups.filter((group) => group.entries.length > 0);
  const featured = visible.filter((group) => group.featured);
  const rest = visible.filter((group) => !group.featured);
  return (
    <div className="arcade">
      <div className="arcade__sky" aria-hidden="true">
        <svg focusable="false">
          {STARS.map((star, k) => (
            <circle key={k} cx={`${star.x}%`} cy={`${star.y}%`} r={star.r} opacity={star.o} />
          ))}
        </svg>
      </div>

      <main className="arcade__main">
        <ArcadeHero />

        {featured.map((group) => (
          <Group key={group.id} group={group} />
        ))}

        {rest.length > 0 && (
          <div className="arcade-more">
            {rest.map((group) => (
              <Group key={group.id} group={group} />
            ))}
          </div>
        )}

        <EvaGateway />
      </main>

      <footer className="arcade__foot mono">{links.footer}</footer>
    </div>
  );
}

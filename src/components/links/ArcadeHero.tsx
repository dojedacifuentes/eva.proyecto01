import { ArcadeMark } from '@/components/links/ArcadeMark';
import { links } from '@/content/links';

/** Lo primero que se ve: estado, símbolo, nombre y lema. Nada más. */
export function ArcadeHero() {
  const { hero } = links;
  return (
    <header className="arcade-hero">
      <p className="arcade-hero__status mono">{hero.status}</p>
      <ArcadeMark />
      <h1 className="arcade-hero__title">{hero.title}</h1>
      <p className="arcade-hero__tagline">{hero.tagline}</p>
    </header>
  );
}

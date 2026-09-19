import { SoundControl } from '@/components/eva/SoundControl';
import { modules } from '@/content/modules';
import { flags, nav, site } from '@/content/site';
import { MobileNavigation } from './MobileNavigation';

export function SiteHeader() {
  const items = modules
    .filter((module) => module.id !== 'news' || flags.news)
    .map(({ id, code, name, href, accent }) => ({ id, code, name, href, accent }));

  return (
    <header className="header">
      <div className="wrap header__bar">
        <a href="#inicio" className="wordmark" aria-label={`${site.name}, inicio`}>
          <span aria-hidden="true" className="wordmark__glyph" />
          {site.name}
        </a>

        <p className="status mono">
          <span aria-hidden="true" className="status__led" />
          {nav.status}
        </p>

        <nav className="nav" aria-label="Universos">
          {items.map((module) => (
            <a key={module.id} href={module.href} data-accent={module.accent} data-sound="open">
              {module.name}
            </a>
          ))}
        </nav>

        <div className="header__tools">
          {flags.sound && <SoundControl />}
          <a href={nav.contact.href} className="chip-btn mono header__contact">
            {nav.contact.label}
          </a>
          <MobileNavigation modules={items} />
        </div>
      </div>
    </header>
  );
}

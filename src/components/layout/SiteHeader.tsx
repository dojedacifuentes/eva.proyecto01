import { SoundControl } from '@/components/eva/SoundControl';
import { navItems } from '@/content/lab';
import { flags, nav, sections, site } from '@/content/site';
import { MobileNavigation } from './MobileNavigation';
import { NavSpy } from './NavSpy';

export function SiteHeader() {
  return (
    <header className="header">
      <NavSpy ids={navItems.map((item) => item.id)} />
      <div className="wrap header__bar">
        <a href="#inicio" className="wordmark" aria-label={`${site.name}, inicio`}>
          <span aria-hidden="true" className="wordmark__glyph" />
          {site.name}
        </a>

        <p className="status mono">
          <span aria-hidden="true" className="status__led" />
          {nav.status}
        </p>

        <nav className="nav" aria-label={sections.footer.navLabel}>
          {navItems.map((item) => (
            <a key={item.id} href={item.href} data-accent={item.accent} data-sound="open">
              {item.name}
            </a>
          ))}
        </nav>

        <div className="header__tools">
          {flags.sound && <SoundControl />}
          <a
            href={nav.contact.href}
            className="chip-btn mono header__contact"
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="external"
          >
            {nav.contact.label}
          </a>
          <MobileNavigation items={[...navItems]} />
        </div>
      </div>
    </header>
  );
}

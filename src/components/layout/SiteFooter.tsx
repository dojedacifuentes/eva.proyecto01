import { doors } from '@/content/structure';
import { nav, sections, site } from '@/content/site';

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="wrap footer__grid">
        <div>
          <p className="wordmark">
            <span aria-hidden="true" className="wordmark__glyph" />
            {site.name}
          </p>
          <p className="footer__line">{sections.footer.line}</p>
          {/* Fuera de la ficción, en letra pequeña: EVA es un personaje. */}
          <p className="footer__fiction mono">{sections.footer.fiction}</p>
        </div>
        <div>
          <nav className="footer__nav" aria-label={sections.footer.navLabel}>
            {doors.map((item) => (
              <a key={item.id} href={item.href} aria-label={`${item.name}, ${item.ordinal}`}>
                <span aria-hidden="true" className="footer__code mono" data-bin="">
                  {item.code}
                </span>
                <span aria-hidden="true">{item.name}</span>
              </a>
            ))}
            <a
              href={nav.contact.href}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="external"
            >
              {nav.contact.label}
            </a>
          </nav>
          <p className="mono">
            {sections.footer.statusLabel}: {nav.status.toLowerCase()} · {site.version}
          </p>
        </div>
      </div>
    </footer>
  );
}

import { modules } from '@/content/modules';
import { flags, nav, sections, site } from '@/content/site';

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
        </div>
        <div>
          <nav className="footer__nav" aria-label="Pie de página">
            {modules
              .filter((module) => module.id !== 'news' || flags.news)
              .map((module) => (
                <a key={module.id} href={module.href}>
                  {module.name}
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

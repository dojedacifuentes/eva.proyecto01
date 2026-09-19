import { modules } from '@/content/modules';
import { flags, nav, sections, site, studio, ui } from '@/content/site';

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

          {/* El estudio detrás de EVA. Salió de la portada al dejarla sólo con
              acrónimo, genoma y retrato; aquí sigue a un clic. */}
          <a
            className="studio"
            href={studio.href}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="external"
            data-cursor-label={studio.cta.toUpperCase()}
            data-sound="open"
          >
            <span className="studio__label mono">{studio.label}</span>
            <span className="studio__name">
              {studio.name}
              <span aria-hidden="true" className="studio__arrow">
                ↗
              </span>
            </span>
            <span className="studio__services mono">{studio.services.join(' · ')}</span>
            <span className="sr-only"> ({ui.external})</span>
          </a>
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

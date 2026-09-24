import { EvaLogo } from '@/components/brand/EvaLogo';
import { SoundControl } from '@/components/eva/SoundControl';
import { navItems, structureLabels } from '@/content/structure';
import { flags, nav, site } from '@/content/site';
import { ContextSpy } from './ContextSpy';
import { MobileNavigation } from './MobileNavigation';

/**
 * Cabecera: el recorrido, con su código binario. Hoy hay un solo eje —la
 * Entidad— y sus tres partes van siempre a la vista. Si vuelve a haber varios,
 * las subsecciones de cada uno aparecen sólo cuando el visitante está dentro
 * (lo decide el CSS con `html[data-axis]`, que escribe `ContextSpy`).
 *
 * Los bits son adorno (`aria-hidden`): el nombre accesible de cada enlace dice
 * «Cuerpo, subsección 3 de 3».
 */
export function SiteHeader() {
  return (
    <header className="header">
      <ContextSpy />
      <div className="wrap header__bar">
        {/* La clase `wordmark` es un contrato: el menú móvil la inertiza y le devuelve el foco. */}
        <a href="#inicio" className="wordmark" aria-label={`${site.name}, inicio`}>
          <EvaLogo id="marca-cabecera" className="wordmark__logo" />
        </a>

        <p className="status mono">
          <span aria-hidden="true" className="status__led" />
          {nav.status}
        </p>

        <nav className="nav" aria-label={structureLabels.nav}>
          {navItems.map((item) => (
            <div key={item.id} className="nav__axis" data-axis={item.id} data-accent={item.accent}>
              <a
                href={item.href}
                data-nav-target={item.id}
                data-state={item.state}
                data-sound="open"
                aria-label={`${item.name}, ${item.ordinal}${
                  item.state === 'active' ? '' : `, ${item.stateLabel?.toLowerCase()}`
                }`}
              >
                <span aria-hidden="true" className="nav__code mono" data-bin="">
                  {item.code}
                </span>
                <span aria-hidden="true">{item.name}</span>
              </a>

              {item.children.length > 0 && (
                <div
                  className="nav__sub"
                  role="group"
                  aria-label={`${structureLabels.subnav} ${item.name}`}
                >
                  {item.children.map((child) => (
                    <a
                      key={child.id}
                      href={child.href}
                      data-nav-target={child.id}
                      data-state={child.state}
                      data-sound="open"
                      aria-label={`${child.name}, ${child.ordinal}`}
                    >
                      <span aria-hidden="true" className="nav__code mono" data-bin="">
                        {child.code}
                      </span>
                      <span aria-hidden="true" className="nav__sub-name">
                        {child.name}
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>
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

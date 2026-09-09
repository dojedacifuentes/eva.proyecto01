import Link from 'next/link';
import { EvaMark } from '@/components/ui/EvaMark';
import { identity, links, nav } from '@/data/eva';

/**
 * Header sin estado: sólo anclas. En móvil la navegación se resuelve con una
 * fila que se desplaza en horizontal en lugar de un menú desplegable — nada
 * depende de hover ni de JavaScript.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="eva-container flex h-[4.25rem] items-center justify-between gap-6">
        <Link
          href="#top"
          className="flex shrink-0 items-center gap-2.5"
          aria-label={`${identity.name} — inicio`}
        >
          <EvaMark className="size-[18px]" />
          <span className="text-[1.0625rem] font-semibold tracking-[0.14em]">
            {identity.name}
          </span>
        </Link>

        <nav
          aria-label="Secciones"
          className="eva-nav-scroll -mx-3 min-w-0 overflow-x-auto px-3"
        >
          <ul className="flex items-center gap-6 whitespace-nowrap md:gap-8">
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="eva-mono text-muted transition-colors hover:text-foreground"
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li className="hidden lg:block">
              <a
                href={links.instagram}
                target="_blank"
                rel="noreferrer noopener"
                className="eva-mono text-muted transition-colors hover:text-accent-ink"
              >
                Instagram ↗
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

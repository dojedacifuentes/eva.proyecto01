import { NavCommand } from '@/components/nav/NavCommand';
import { SectionNav } from '@/components/nav/SectionNav';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { EvaMark } from '@/components/ui/EvaMark';
import { identity, links } from '@/data/eva';

/**
 * Barra superior.
 *
 * En la primera pantalla es sólo la marca y las utilidades: el hero manda y su
 * índice ya es el sumario de la página. Al pasar de ahí aparecen las secciones
 * y el filete inferior, así que la navegación llega justo cuando empieza a
 * hacer falta. Es revelación progresiva, no una barra que se llena de enlaces
 * desde el primer píxel.
 *
 * El material translúcido con desenfoque es el de una toolbar de macOS: deja
 * ver que hay contenido debajo sin dejar de ser legible.
 */
export function Header() {
  return (
    <header className="eva-header">
      <div className="eva-container flex h-[var(--eva-header-h)] items-center justify-between gap-6">
        <a
          href="#top"
          className="flex shrink-0 items-center gap-2.5"
          aria-label={`${identity.name} — inicio`}
        >
          <EvaMark className="size-[18px]" />
          <span className="text-[1.0625rem] font-semibold tracking-[0.14em]">
            {identity.name}
            <span className="eva-seal font-mono text-[0.8125rem] tracking-normal">
              {identity.seal}
            </span>
          </span>
        </a>

        <div className="flex items-center gap-5 lg:gap-7">
          <SectionNav />

          <span
            aria-hidden="true"
            className="eva-nav-sections hidden h-4 w-px bg-border lg:block"
          />

          <div className="flex items-center gap-1 sm:gap-2">
            <a
              href={links.instagram}
              target="_blank"
              rel="noreferrer noopener"
              className="eva-mono hidden px-1 text-muted transition-colors hover:text-foreground sm:inline"
            >
              Instagram <span aria-hidden="true">↗</span>
            </a>
            <ThemeToggle />
            <NavCommand />
          </div>
        </div>
      </div>

      <div aria-hidden="true" className="eva-progress" />
    </header>
  );
}

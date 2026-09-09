import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { EvaMark } from '@/components/ui/EvaMark';
import { identity, links } from '@/data/eva';

/**
 * Header casi transparente: se apoya en el fondo en lugar de flotar sobre él.
 * Sólo la marca a la izquierda y, a la derecha, Instagram y el interruptor de
 * apariencia. La navegación por capítulos vive en el índice del hero.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-[2px]">
      <div className="eva-container flex h-[4.25rem] items-center justify-between gap-6">
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

        <div className="flex items-center gap-5 sm:gap-7">
          <a
            href={links.instagram}
            target="_blank"
            rel="noreferrer noopener"
            className="eva-mono text-muted transition-colors hover:text-accent-ink"
          >
            Instagram <span aria-hidden="true">↗</span>
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

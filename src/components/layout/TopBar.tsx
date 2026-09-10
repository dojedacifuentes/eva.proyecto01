'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavCommand } from '@/components/nav/NavCommand';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { EvaMark } from '@/components/ui/EvaMark';
import { chapters, identity } from '@/data/eva';

/** Rótulo de cada ruta. Es lo que evita perder el sitio al navegar. */
function useCurrent(pathname: string) {
  const chapter = chapters.find((item) => item.href === pathname);
  if (chapter) {
    return { number: chapter.number, title: chapter.title, sub: chapter.eyebrow };
  }
  if (pathname === '/panel') {
    return { number: '·', title: 'Panel del caso', sub: 'ESTADO INTERNO' };
  }
  return { number: '·', title: identity.name, sub: identity.eyebrow };
}

/**
 * Barra superior.
 *
 * Su trabajo no es navegar —de eso se encargan el lateral y la barra inferior—
 * sino decir siempre en qué página estás. Es lo que sostiene la orientación
 * cuando el sitio deja de ser una sola página con anclas.
 *
 * En móvil recupera la marca, porque ahí el lateral no existe.
 */
export function TopBar() {
  const pathname = usePathname();
  const current = useCurrent(pathname);

  return (
    <header className="eva-header">
      <div className="flex h-[var(--eva-header-h)] items-center justify-between gap-4 px-5 md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/"
            aria-label={`${identity.name} — inicio`}
            className="flex shrink-0 items-center gap-2.5 lg:hidden"
          >
            <EvaMark className="size-[18px]" />
            <span className="text-[1.0625rem] font-semibold tracking-[0.14em]">
              {identity.name}
              <span className="eva-seal font-mono text-[0.8125rem] tracking-normal">
                {identity.seal}
              </span>
            </span>
          </Link>

          <span
            aria-hidden="true"
            className="h-4 w-px shrink-0 bg-border lg:hidden"
          />

          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-[0.9375rem] font-medium">
              {current.title}
            </span>
            <span className="eva-mono hidden text-[0.625rem] text-muted sm:block">
              {current.sub}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <NavCommand />
        </div>
      </div>

      <div aria-hidden="true" className="eva-progress" />
    </header>
  );
}

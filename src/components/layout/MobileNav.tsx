'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { chapters } from '@/data/eva';

/**
 * Barra de navegación inferior, sólo en móvil.
 *
 * Va abajo porque es donde llega el pulgar. Lleva los cinco capítulos con su
 * número y su rótulo corto: el mismo mapa que el lateral, sin menú que abrir
 * ni gesto que aprender.
 */
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Capítulos"
      className="eva-mobile-nav fixed inset-x-0 bottom-0 z-50 border-t border-border lg:hidden"
    >
      <ul className="flex items-stretch">
        {chapters.map((chapter) => {
          const active = pathname === chapter.href;
          return (
            <li key={chapter.id} className="flex-1">
              <Link
                href={chapter.href}
                aria-current={active ? 'page' : undefined}
                className={`eva-tab flex flex-col items-center gap-1.5 px-1 py-3 ${
                  active ? 'is-active' : ''
                }`}
              >
                <span className="eva-mono text-[0.6875rem]">
                  {chapter.number}
                </span>
                <span className="text-[0.6875rem] leading-none">
                  {chapter.short}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { EvaMark } from '@/components/ui/EvaMark';
import { chapters, identity, links } from '@/data/eva';

const GROUPS = [
  { title: 'Recorrido', items: chapters },
] as const;

/**
 * Navegación lateral permanente.
 *
 * Sustituye a la barra de anclas: cada capítulo es una ruta, así que siempre se
 * ve el mapa completo y dónde se está dentro de él. En móvil desaparece — abajo
 * hay una barra propia, que es donde llega el pulgar.
 *
 * El número del capítulo hace de icono. La identidad de EVA es tipográfica y
 * numerada, de modo que una librería de iconos sólo añadiría peso y una segunda
 * gramática visual que no es suya.
 */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      aria-label="Navegación principal"
      className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-surface lg:flex"
    >
      <Link
        href="/"
        aria-label={`${identity.name} — inicio`}
        className="flex items-center gap-3 border-b border-border px-5 py-5"
      >
        <EvaMark className="size-[18px] shrink-0" />
        <span className="flex flex-col leading-tight">
          <span className="text-[1.0625rem] font-semibold tracking-[0.14em]">
            {identity.name}
            <span className="eva-seal font-mono text-[0.8125rem] tracking-normal">
              {identity.seal}
            </span>
          </span>
          <span className="eva-mono mt-1 text-[0.625rem] text-muted">
            {identity.tagline}
          </span>
        </span>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {GROUPS.map((group) => (
          <div key={group.title}>
            <p className="eva-mono px-3 pb-2 text-[0.625rem] text-muted">
              {group.title}
            </p>
            <ul className="flex flex-col gap-0.5">
              {group.items.map((chapter) => {
                const active = pathname === chapter.href;
                return (
                  <li key={chapter.id}>
                    <Link
                      href={chapter.href}
                      aria-current={active ? 'page' : undefined}
                      className={`eva-side-link flex items-center gap-3 rounded-eva px-3 py-2.5 text-[0.9375rem] ${
                        active ? 'is-active' : ''
                      }`}
                    >
                      <span className="eva-mono w-5 shrink-0 text-accent-ink">
                        {chapter.number}
                      </span>
                      <span className="truncate">{chapter.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="flex flex-col gap-3 border-t border-border px-5 py-5">
        <a
          href={links.instagram}
          target="_blank"
          rel="noreferrer noopener"
          className="eva-mono text-muted transition-colors hover:text-accent-ink"
        >
          Instagram <span aria-hidden="true">↗</span>
        </a>
        <p className="eva-mono text-[0.625rem] text-muted">
          {identity.year}
          <span aria-hidden="true" className="px-2 text-border-strong">
            /
          </span>
          {identity.city}
        </p>
      </div>
    </aside>
  );
}

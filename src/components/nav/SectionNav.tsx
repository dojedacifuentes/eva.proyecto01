'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { chapterIndex } from '@/data/eva';

/**
 * Navegación por secciones de la barra superior, con marca de posición.
 *
 * Un observador vigila una franja horizontal en el centro de la ventana; la
 * sección que la cruza es la activa. La franja evita el problema clásico del
 * scrollspy — que dos capítulos largos se disputen el estado — porque en cada
 * momento sólo uno puede ocuparla.
 *
 * El estado se comunica con `aria-current`, de modo que quien navega con
 * lector de pantalla recibe la misma información que quien ve el subrayado.
 *
 * En rutas que no son la landing no hay secciones que observar: los enlaces son
 * absolutos y siguen llevando a su capítulo, simplemente sin marca de posición.
 */
export function SectionNav() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const ids = chapterIndex.map((chapter) => chapter.id);
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const visible = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }

        // En orden de documento, para que el primero de la franja mande.
        const current = ids.find((id) => visible.has(id));
        if (current) setActive(current);
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    );

    for (const section of sections) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <nav aria-label="Secciones" className="eva-nav-sections hidden lg:block">
      <ul className="flex items-center gap-7">
        {chapterIndex.map((chapter) => (
          <li key={chapter.id}>
            <Link
              href={chapter.href}
              className="eva-nav-link eva-mono block transition-colors"
              aria-current={active === chapter.id ? 'true' : undefined}
            >
              {chapter.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

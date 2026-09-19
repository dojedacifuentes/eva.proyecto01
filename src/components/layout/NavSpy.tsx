'use client';

import { useEffect } from 'react';

/**
 * Marca en la navegación el universo que se está leyendo (`aria-current`).
 * No renderiza nada: observa las secciones y actualiza los enlaces del header,
 * que siguen siendo HTML de servidor.
 */
export function NavSpy({ ids }: { ids: string[] }) {
  useEffect(() => {
    const links = new Map<string, HTMLAnchorElement[]>();
    for (const id of ids) {
      links.set(id, [...document.querySelectorAll<HTMLAnchorElement>(`.nav a[href="#${id}"]`)]);
    }

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        const current = ids.find((id) => visible.has(id));
        for (const [id, anchors] of links) {
          for (const anchor of anchors) {
            if (id === current) anchor.setAttribute('aria-current', 'true');
            else anchor.removeAttribute('aria-current');
          }
        }
      },
      // Franja central de la pantalla: evita que dos secciones compitan.
      { rootMargin: '-45% 0px -50% 0px' },
    );

    for (const id of ids) {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    }
    return () => observer.disconnect();
  }, [ids]);

  return null;
}

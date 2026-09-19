'use client';

import { useEffect } from 'react';
import { contextById, contextNodes, hashAliases } from '@/content/structure';
import { requestChannelClose } from '@/lib/channel-store';
import { CONTEXT_DWELL_MS, getContext, setContext } from '@/lib/context';
import { FIELD_TINT, fieldSignal } from '@/lib/field';

/**
 * El observador del recorrido. No renderiza nada: mira qué lugar ocupa el
 * centro de la pantalla y lo publica en `lib/context`, que es de donde leen la
 * navegación, el canal de EVA y el fondo.
 *
 * Además de publicar el lugar:
 *  · marca en la cabecera, el riel y el menú el eje y la subsección actuales
 *    (`aria-current`), sobre enlaces que siguen siendo HTML de servidor;
 *  · deja en `<html>` el eje y el nodo (`data-axis`, `data-node`) para que el
 *    CSS pueda teñir la página según dónde se esté;
 *  · le pide al fondo el tinte de cada lugar, y quietud en los clausurados;
 *  · cierra el canal en cuanto se pulsa un enlace interno hacia otro lugar,
 *    sin esperar a que el desplazamiento llegue;
 *  · redirige las anclas de versiones anteriores (`#cerebro`, `#reserva`,
 *    `#vigilancia`…).
 */
export function ContextSpy() {
  useEffect(() => {
    const root = document.documentElement;
    const ids = contextNodes.map((node) => node.id);
    const visible = new Set<string>();
    let candidate = getContext();
    let timer: ReturnType<typeof setTimeout> | undefined;

    const paint = (id: string) => {
      const node = contextById(id);
      if (!node) return;
      root.dataset.node = node.id;
      root.dataset.axis = node.axisId ?? 'portada';
      fieldSignal.calm = node.state === 'sealed' ? 1 : 0;
      fieldSignal.rgb = FIELD_TINT[node.accent];
      for (const link of document.querySelectorAll<HTMLAnchorElement>('[data-nav-target]')) {
        const target = link.dataset.navTarget;
        if (target === node.id || target === node.axisId) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      }
    };

    const commit = (id: string) => {
      setContext(id);
      paint(id);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        const next = ids.find((id) => visible.has(id));
        if (!next || next === candidate) return;
        candidate = next;
        clearTimeout(timer);
        // Sólo cuenta si se sostiene: pasar de largo no es estar.
        timer = setTimeout(() => {
          if (candidate === next && next !== getContext()) commit(next);
        }, CONTEXT_DWELL_MS);
      },
      // Franja central de la pantalla: evita que dos lugares compitan.
      { rootMargin: '-45% 0px -50% 0px' },
    );

    for (const id of ids) {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    }
    paint(getContext());

    /* Un enlace interno a otro lugar: el canal se pliega ya. */
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      const target = link?.getAttribute('href')?.slice(1);
      if (!target || target === getContext()) return;
      requestChannelClose();
    };

    /* Anclas antiguas: llevan a donde hoy vive lo que contaban. */
    const redirect = () => {
      const alias = hashAliases[window.location.hash.slice(1)];
      if (alias) window.location.replace(`#${alias}`);
    };

    redirect();
    document.addEventListener('click', onClick);
    window.addEventListener('hashchange', redirect);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
      document.removeEventListener('click', onClick);
      window.removeEventListener('hashchange', redirect);
    };
  }, []);

  return null;
}

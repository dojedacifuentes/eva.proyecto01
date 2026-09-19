'use client';

import { useEffect } from 'react';

/**
 * Revelado al entrar en pantalla para navegadores sin `animation-timeline: view()`
 * (Firefox y Safari). Marca `.reveal` con `is-in` la primera vez que se ve.
 *
 * Donde el navegador sí soporta scroll-driven animations no se monta nada: la
 * animación la lleva el CSS y este observador sobra.
 */
export function ScrollReveal() {
  useEffect(() => {
    if (CSS.supports('animation-timeline: view()')) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const root = document.documentElement;
    root.classList.add('reveal-js');

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
    );

    const targets = document.querySelectorAll('.reveal');
    for (const target of targets) observer.observe(target);

    return () => {
      observer.disconnect();
      root.classList.remove('reveal-js');
    };
  }, []);

  return null;
}

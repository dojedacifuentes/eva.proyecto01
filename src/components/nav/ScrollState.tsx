'use client';

import { useEffect } from 'react';

/**
 * Marca en el <html> si la página ya dejó atrás el hero.
 *
 * De ahí cuelgan, sólo con CSS, la aparición de la navegación por secciones,
 * el filete de la barra y la barra de progreso.
 *
 * Aquí no sirve un IntersectionObserver. La señal es binaria — «ya pasé el
 * hero» — y el observador sólo avisa cuando se cruza un umbral: un salto
 * instantáneo (pulsar un enlace del índice, recargar con ancla) puede llevar el
 * elemento de un lado al otro entre dos fotogramas sin cruzar nada, y el estado
 * se queda congelado. La comparación directa no tiene ese punto ciego.
 *
 * El borde del hero se mide una vez y se guarda, de modo que desplazarse no
 * cuesta ninguna lectura de layout: cada evento es una resta.
 *
 * `data-scroll-ready` confirma que este componente está vivo. Sin JavaScript
 * nunca aparece y la navegación se muestra siempre — nadie se queda sin ella.
 */
export function ScrollState() {
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-scroll-ready', '');

    const hero = document.getElementById('top');

    // Sin hero al que asomarse (una página interior), la barra va completa.
    if (!hero) {
      root.setAttribute('data-scrolled', '');
      return () => {
        root.removeAttribute('data-scroll-ready');
        root.removeAttribute('data-scrolled');
      };
    }

    /** Borde inferior del hero en coordenadas del documento. */
    let heroBottom = 0;
    /** Alto de la barra, leído del mismo token que usa el CSS. */
    let headerHeight = 0;

    const measure = () => {
      heroBottom = hero.getBoundingClientRect().bottom + window.scrollY;
      const rem = parseFloat(getComputedStyle(root).fontSize) || 16;
      const declared = parseFloat(
        getComputedStyle(root).getPropertyValue('--eva-header-h'),
      );
      headerHeight = Number.isFinite(declared) ? declared * rem : 68;
    };

    const update = () => {
      root.toggleAttribute(
        'data-scrolled',
        window.scrollY + headerHeight >= heroBottom,
      );
    };

    const onResize = () => {
      measure();
      update();
    };

    measure();
    update();

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', onResize);
    // Las tipografías web cambian la altura del hero al terminar de cargar.
    document.fonts?.ready.then(onResize).catch(() => {});

    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', onResize);
      root.removeAttribute('data-scroll-ready');
      root.removeAttribute('data-scrolled');
    };
  }, []);

  return null;
}

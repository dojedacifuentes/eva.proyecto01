'use client';

import { useCallback } from 'react';
import { THEME_COLOR, THEME_STORAGE_KEY, type Theme } from '@/components/theme/theme';

/**
 * Interruptor de apariencia.
 *
 * No guarda estado en React: el modo vive en `data-theme` del <html> y los dos
 * iconos se renderizan siempre, dejando que CSS muestre el que corresponde. Así
 * el marcado del servidor y el del cliente son idénticos, no hay parpadeo al
 * hidratar y el botón sigue siendo un simple botón — foco y teclado nativos.
 */
export function ThemeToggle() {
  const toggle = useCallback(() => {
    const current = document.documentElement.getAttribute('data-theme');
    const next: Theme = current === 'light' ? 'dark' : 'light';

    document.documentElement.setAttribute('data-theme', next);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', THEME_COLOR[next]);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Modo privado o almacenamiento bloqueado: el cambio vale para la sesión.
    }
  }, []);

  return (
    <button
      type="button"
      onClick={toggle}
      title="Cambiar apariencia"
      aria-label="Cambiar apariencia"
      className="-mr-1.5 grid size-9 place-items-center rounded-eva text-muted transition-colors hover:text-accent-ink"
    >
      {/* Sol — visible en oscuro: pulsarlo lleva al modo claro. */}
      <svg
        viewBox="0 0 16 16"
        aria-hidden="true"
        className="eva-icon-sun col-start-1 row-start-1 size-4"
      >
        <circle cx="8" cy="8" r="3.1" fill="currentColor" />
        <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
          <path d="M8 1v1.8M8 13.2V15M15 8h-1.8M2.8 8H1M12.95 3.05l-1.27 1.27M4.32 11.68l-1.27 1.27M12.95 12.95l-1.27-1.27M4.32 4.32L3.05 3.05" />
        </g>
      </svg>

      {/* Media luna — visible en claro: pulsarlo devuelve al modo oscuro. */}
      <svg
        viewBox="0 0 16 16"
        aria-hidden="true"
        className="eva-icon-moon col-start-1 row-start-1 size-4"
      >
        <circle cx="8" cy="8" r="5.4" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path d="M8 2.6a5.4 5.4 0 0 0 0 10.8Z" fill="currentColor" />
      </svg>
    </button>
  );
}

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toggleTheme } from '@/components/theme/theme';
import { chapterIndex, links } from '@/data/eva';

type Item = {
  id: string;
  label: string;
  meta: string;
  /** Vocabulario alternativo: lo que alguien escribiría buscando esta sección. */
  keywords: string;
  href?: string;
  external?: boolean;
  run?: () => void;
};

/*
 * El rótulo de una sección no es la única palabra con la que se la busca. Quien
 * escribe «asesoría», «lab» o «formación» tiene que llegar a su capítulo: una
 * paleta que no reconoce el vocabulario del propio proyecto estorba más de lo
 * que ayuda.
 */
const KEYWORDS: Record<string, string> = {
  eva: 'proyecto acerca quienes somos herramientas exploracion',
  cursos: 'formacion ensenar programas estudiantes abogados clases talleres',
  prototipos: 'lab laboratorio herramientas experimentos aplicaciones',
  informes: 'investigacion research publicaciones documentos papers',
  'estudios-juridicos':
    'estudios juridicos equipos legales asesoria workflows empresas consultoria',
};

const ITEMS: Item[] = [
  ...chapterIndex.map((chapter) => ({
    id: chapter.id,
    label: chapter.label,
    meta: chapter.number,
    keywords: KEYWORDS[chapter.id] ?? '',
    href: chapter.href,
  })),
  {
    id: 'instagram',
    label: 'Instagram',
    meta: 'ENLACE',
    keywords: 'redes social perfil eva proyecto01',
    href: links.instagram,
    external: true,
  },
  {
    id: 'tema',
    label: 'Cambiar apariencia',
    meta: 'ACCIÓN',
    keywords: 'tema modo oscuro claro dark light',
    run: () => toggleTheme(),
  },
];

/** Sin acentos y en minúsculas, para que «asesoría» encuentre «asesoria». */
const fold = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

/**
 * Navegador de EVA: la misma superficie sirve de menú en móvil y de paleta de
 * comandos con ⌘K (Ctrl+K) en escritorio.
 *
 * Se apoya en el <dialog> nativo, que ya resuelve la trampa de foco, el cierre
 * con Escape, la capa superior y la inercia del fondo. Reimplementar eso a
 * mano es de donde salen los menús que se pueden tabular por detrás.
 *
 * Las entradas son enlaces y botones reales: las flechas mueven el foco de
 * verdad en lugar de simular una selección, así que Intro, Tab y los lectores
 * de pantalla funcionan sin código adicional.
 */
export function NavCommand() {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  /** Sección a la que hay que llevar el foco al cerrar, si se eligió una. */
  const destination = useRef<string | null>(null);
  /** Evita devolver el foco dos veces en un mismo ciclo de apertura. */
  const pendingRestore = useRef(false);
  const shortcut = useRef<HTMLSpanElement>(null);
  const [query, setQuery] = useState('');
  /** Puente para que `close()` alcance a `restoreFocus`, definido más abajo. */
  const restoreFocusRef = useRef<(() => void) | null>(null);

  const close = useCallback(() => {
    dialog.current?.close();
    restoreFocusRef.current?.();
  }, []);

  /*
   * Al cerrar, el foco no puede quedarse dentro de un diálogo que ya no está:
   * quien navega con teclado se quedaría sin punto de partida. Si se eligió una
   * sección, el foco viaja con el lector hasta ella — el destino se hace
   * enfocable al vuelo para no tener que tocar cada componente de sección. Si
   * no, vuelve al botón que abrió el navegador.
   */
  const restoreFocus = useCallback(() => {
    if (!pendingRestore.current) return;
    pendingRestore.current = false;
    setQuery('');

    const id = destination.current;
    destination.current = null;

    if (id) {
      const section = document.getElementById(id);
      if (section) {
        section.setAttribute('tabindex', '-1');
        section.focus({ preventScroll: true });
        return;
      }
    }

    trigger.current?.focus();
  }, []);

  const open = useCallback(() => {
    const el = dialog.current;
    if (!el || el.open) return;
    setQuery('');
    pendingRestore.current = true;
    el.showModal();
    input.current?.focus();
  }, []);

  /*
   * Dos caminos para devolver el foco, porque hay dos formas de cerrar.
   *
   * Cuando cierra el código, `close()` lo hace directamente. Cuando cierra el
   * navegador —Escape— sólo hay evento `close`, así que también se escucha. El
   * cerrojo `pendingRestore` hace que sólo actúe el primero de los dos: si se
   * ejecutaran ambos, el segundo pisaría el foco recién puesto en la sección.
   */
  useEffect(() => {
    restoreFocusRef.current = restoreFocus;
    const el = dialog.current;
    if (!el) return;
    el.addEventListener('close', restoreFocus);
    return () => el.removeEventListener('close', restoreFocus);
  }, [restoreFocus]);

  // El atajo del sistema: ⌘K en Mac, Ctrl+K en el resto.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'k' || !(event.metaKey || event.ctrlKey)) {
        return;
      }
      event.preventDefault();
      if (dialog.current?.open) close();
      else open();
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  /*
   * La etiqueta del atajo se escribe en el DOM después de montar, no con
   * estado: el servidor no sabe en qué sistema está el visitante, y renderizar
   * una suposición produciría un desajuste de hidratación.
   */
  useEffect(() => {
    const isApple = /Mac|iPhone|iPad/.test(navigator.platform ?? '');
    if (!isApple && shortcut.current) shortcut.current.textContent = 'Ctrl K';
  }, []);

  // Flechas: mueven el foco entre entradas reales.
  const onListKeyDown = (event: React.KeyboardEvent) => {
    const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End'];
    if (!keys.includes(event.key)) return;

    const items = Array.from(
      list.current?.querySelectorAll<HTMLElement>('[data-cmd-item]') ?? [],
    );
    if (items.length === 0) return;

    event.preventDefault();
    const index = items.indexOf(document.activeElement as HTMLElement);

    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? items.length - 1
          : event.key === 'ArrowDown'
            ? (index + 1) % items.length
            : index <= 0
              ? items.length - 1
              : index - 1;

    items[next]?.focus();
  };

  const matches = ITEMS.filter((item) =>
    fold(`${item.label} ${item.meta} ${item.keywords}`).includes(
      fold(query.trim()),
    ),
  );

  return (
    <>
      <button
        ref={trigger}
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        aria-label="Abrir navegación"
        className="flex h-9 items-center gap-2 rounded-eva px-2 text-muted transition-colors hover:text-foreground lg:border lg:border-border lg:px-2.5"
      >
        <svg
          viewBox="0 0 16 16"
          aria-hidden="true"
          className="size-4 lg:hidden"
        >
          <path
            d="M2 4.5h12M2 8h12M2 11.5h12"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>
        <span
          ref={shortcut}
          aria-hidden="true"
          className="eva-mono hidden lg:inline"
        >
          ⌘K
        </span>
      </button>

      <dialog
        ref={dialog}
        className="eva-dialog"
        aria-label="Navegación"
        onClick={(event) => {
          // Sólo cuenta el clic en el fondo, nunca dentro del panel.
          if (event.target === dialog.current) close();
        }}
      >
        <div className="flex min-h-full items-end justify-center p-3 sm:items-start sm:p-6 sm:pt-[14vh]">
          <div className="eva-dialog-panel w-full max-w-lg overflow-hidden">
            <div className="flex items-center gap-3 border-b border-border px-4">
              <svg
                viewBox="0 0 16 16"
                aria-hidden="true"
                className="size-4 shrink-0 text-muted"
              >
                <circle
                  cx="7"
                  cy="7"
                  r="4.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.3"
                />
                <path
                  d="m10.5 10.5 3 3"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </svg>
              <input
                ref={input}
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={onListKeyDown}
                placeholder="Ir a una sección"
                aria-label="Buscar sección"
                autoComplete="off"
                className="h-12 w-full bg-transparent text-[0.9375rem] outline-none placeholder:text-muted"
              />
              <kbd className="eva-mono hidden shrink-0 rounded-eva border border-border px-1.5 py-0.5 text-muted sm:block">
                ESC
              </kbd>
            </div>

            <div
              ref={list}
              onKeyDown={onListKeyDown}
              className="max-h-[min(60vh,22rem)] overflow-y-auto p-1.5"
            >
              {matches.length === 0 ? (
                <p className="px-3 py-6 text-center text-[0.9375rem] text-muted">
                  Sin resultados.
                </p>
              ) : (
                matches.map((item) => {
                  const className =
                    'flex w-full items-center gap-3 rounded-eva px-3 py-2.5 text-left text-[0.9375rem] transition-colors hover:bg-surface focus-visible:bg-surface';

                  const body = (
                    <>
                      <span className="eva-mono w-8 shrink-0 text-accent-ink">
                        {item.meta === 'ENLACE' || item.meta === 'ACCIÓN'
                          ? '·'
                          : item.meta}
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        {item.label}
                      </span>
                      {item.external ? (
                        <span aria-hidden="true" className="text-muted">
                          ↗
                        </span>
                      ) : null}
                    </>
                  );

                  return item.href ? (
                    <a
                      key={item.id}
                      data-cmd-item
                      href={item.href}
                      target={item.external ? '_blank' : undefined}
                      rel={item.external ? 'noreferrer noopener' : undefined}
                      onClick={() => {
                        if (!item.external) destination.current = item.id;
                        close();
                      }}
                      className={className}
                    >
                      {body}
                    </a>
                  ) : (
                    <button
                      key={item.id}
                      data-cmd-item
                      type="button"
                      onClick={() => {
                        item.run?.();
                        close();
                      }}
                      className={className}
                    >
                      {body}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}

export const THEMES = ['dark', 'light'] as const;
export type Theme = (typeof THEMES)[number];

/** DARK es el modo por defecto: la primera visita nunca consulta el sistema. */
export const DEFAULT_THEME: Theme = 'dark';

export const THEME_STORAGE_KEY = 'eva-theme';

/** Color de la barra del navegador en cada modo. */
export const THEME_COLOR: Record<Theme, string> = {
  dark: '#05070c',
  light: '#f5f5f3',
};

/**
 * Script en línea que corre antes del primer pintado.
 *
 * El HTML ya llega del servidor con `data-theme="dark"`, así que sin
 * JavaScript el sitio sigue siendo el oscuro. Este script sólo interviene si
 * el visitante guardó «light» en una visita anterior — por eso no hay flash en
 * ninguno de los dos casos.
 *
 * Al corregir a claro, el <html> y el <body> ya existen y su transición de
 * color se dispararía: serían 260 ms de desvanecimiento al cargar, que es
 * justo el flash que hay que evitar. Por eso el cambio va envuelto en
 * `eva-no-transition`, que se retira dos cuadros después, cuando el color
 * definitivo ya está pintado. El temporizador de respaldo existe porque en una
 * pestaña en segundo plano requestAnimationFrame no se ejecuta, y el candado
 * dejaría el interruptor sin animación para el resto de la sesión.
 */
export const THEME_SCRIPT = `(function(){try{var d=document.documentElement;var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(t!=='light'&&t!=='dark')return;if(t===d.getAttribute('data-theme'))return;d.classList.add('eva-no-transition');d.setAttribute('data-theme',t);var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',t==='light'?${JSON.stringify(
  THEME_COLOR.light,
)}:${JSON.stringify(
  THEME_COLOR.dark,
)});var r=function(){d.classList.remove('eva-no-transition');};requestAnimationFrame(function(){requestAnimationFrame(r);});setTimeout(r,120);}catch(e){}})();`;

/** Modo actualmente pintado, leído del <html> (única fuente de verdad). */
export function currentTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "light"
    ? "light"
    : "dark";
}

/**
 * Cambia de modo y guarda la preferencia.
 *
 * Vive aquí y no dentro del interruptor porque hay dos formas de invocarlo: el
 * botón de la barra y la acción «Cambiar apariencia» del navegador ⌘K. Las dos
 * tienen que hacer exactamente lo mismo.
 */
export function toggleTheme(): Theme {
  const next: Theme = currentTheme() === "light" ? "dark" : "light";

  document.documentElement.setAttribute("data-theme", next);
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", THEME_COLOR[next]);

  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // Modo privado o almacenamiento bloqueado: el cambio vale para la sesión.
  }

  return next;
}

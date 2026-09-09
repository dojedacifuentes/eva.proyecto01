# EVA — landing v0.1

Sitio de **EVA**, proyecto de exploración aplicada sobre Derecho e inteligencia
artificial: herramientas jurídicas, formación, diseño de workflows y asesoría a
equipos legales.

Esta versión es un **marco editorial**, no un sitio lleno. Cada sección es un
capítulo preparado para crecer; el contenido se incorpora después, pieza por
pieza, sin rediseñar el sitio.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Geist / Geist Mono.
La página es estática y no tiene ninguna dependencia más allá de React y Next:
ni librería de temas, ni de diálogos, ni de animación. Los componentes de
cliente son tres — el interruptor de apariencia, la navegación y el estado de
scroll — y ninguno pasa de cien líneas.

## Desarrollo

```bash
npm install
npm run dev     # http://localhost:3000
npm run lint
npm run build
```

## Estructura

```
src/
  app/            layout, página única, tokens (globals.css), favicon
  components/
    layout/       Header, Footer
    nav/          SectionNav (barra + posición), NavCommand (⌘K y hoja
                  móvil), ScrollState
    sections/     Hero, ChapterIndex, AboutEva, CoursesSection,
                  PrototypesSection, ReportsSection, LegalTeamsSection,
                  ClosingSection
    theme/        theme.ts (tokens de modo + script en línea), ThemeToggle
    ui/           SectionIntro, StatusLabel, EmptyChapter, EvaMark
  data/
    eva.ts        fuente única de verdad del copy y la navegación
    collections.ts cursos, prototipos e informes — vacíos en la v0.1
  lib/types.ts    tipos de las colecciones
```

## Cómo se hace crecer el sitio

1. **Añadir contenido real.** Agregar un objeto a `courses`, `prototypes` o
   `reports` en `src/data/collections.ts`. La sección deja de mostrar su estado
   vacío en cuanto la colección tiene un elemento.
2. **Cambiar copy.** Todo el texto vive en `src/data/eva.ts`.
3. **Abrir una ruta propia** (`/cursos`, `/prototipos`, `/informes`,
   `/herramientas`, `/workflows`, `/estudios-juridicos`, `/acerca`): crear
   `src/app/<ruta>/page.tsx` reutilizando el componente de sección y cambiar el
   `href` correspondiente en `nav`, de `#ancla` a `/ruta`.

## Navegación

Tres superficies para el mismo mapa de cinco capítulos, definido una sola vez en
`chapterIndex`.

1. **El índice del hero.** Sumario numerado, siempre presente en la primera
   pantalla.
2. **La barra superior.** Vacía de enlaces mientras se ve el hero; al pasarlo
   aparecen las secciones, el filete inferior y la barra de progreso. Revelación
   progresiva: la navegación llega cuando empieza a hacer falta.
3. **El navegador ⌘K.** La misma superficie es paleta de comandos en escritorio
   (⌘K / Ctrl+K) y hoja anclada al pulgar en móvil. Busca sin acentos y por
   sinónimos — «asesoría», «lab», «formación» llevan a su capítulo — e incluye
   Instagram y el cambio de apariencia como acciones.

Detalles que no se ven pero se notan:

- La posición actual se marca con `aria-current`, no sólo con el subrayado: quien
  usa lector de pantalla recibe la misma información.
- El navegador se apoya en el `<dialog>` nativo, que ya resuelve trampa de foco,
  Escape, capa superior y fondo inerte. Al cerrarse, el foco viaja a la sección
  elegida (que se hace enfocable al vuelo) o vuelve al botón que lo abrió.
- Las flechas mueven el foco entre enlaces reales en lugar de simular una
  selección, así que Intro, Tab y los lectores de pantalla funcionan solos.
- El estado «ya pasé el hero» **no** usa `IntersectionObserver`. La señal es
  binaria y el observador sólo avisa al cruzar un umbral: un salto instantáneo
  —pulsar un ancla, recargar con hash— puede llevar el elemento de un lado a
  otro entre dos fotogramas sin cruzar nada, y el estado se congela. La
  comparación aritmética no tiene ese punto ciego, y el borde del hero se mide
  una vez, de modo que desplazarse no cuesta ninguna lectura de layout.
- La barra de progreso y la aparición de cada capítulo son animaciones ligadas
  al scroll (`animation-timeline`), resueltas por el navegador sin un solo
  oyente. Donde no existen, no pasa nada: el contenido está visible desde el
  principio.
- Sin JavaScript la navegación se muestra siempre, en lugar de esconderse para
  siempre.

## Los dos modos

Misma estructura, misma jerarquía, misma marca; atmósfera distinta. No es una
inversión de colores: además de los tokens cambian los recursos decorativos.

| | DARK (por defecto) | LIGHT |
|---|---|---|
| Carácter | laboratorio | publicación |
| Fondo | `#04080e` negro azulado | `#f5f5f3` blanco cálido |
| Superficie | `#080f16` | `#ffffff` |
| Texto | 17.3:1 | 15.4:1 |
| Secundario | 7.0:1 | 4.7:1 |
| Acento | cyan `#00bfcb` (8.9:1) | cyan profundo `#006c76` (5.7:1) |
| Retícula y glow | activos, casi imperceptibles | apagados (`transparent`) |

Todo vive en `src/app/globals.css`: `:root` es el modo oscuro y
`:root[data-theme='light']` el claro. Al cambiar de modo sólo se animan cinco
propiedades — `background-color`, `color`, `border-color`, `fill` y `stroke` —
durante 260 ms. Nunca posiciones.

**El fondo oscuro no usa el `oklch(0.07 .015 250)` de referencia**: en sRGB se
resuelve como `#000103`, un negro plano donde el matiz frío desaparece y la
superficie elevada deja de distinguirse. Subido a `0.13` el azul se percibe y
los filetes existen.

### Cómo se decide el modo

1. El HTML sale del servidor con `data-theme="dark"`. Sin JavaScript, el sitio
   es oscuro.
2. Un script en línea al principio del `<body>` corrige a claro **sólo** si el
   visitante lo guardó antes en `localStorage` (`eva-theme`).
3. `prefers-color-scheme` no interviene en ningún momento: la primera visita es
   siempre oscura.
4. Ese cambio va envuelto en `.eva-no-transition` y se libera dos cuadros
   después, para que el color correcto esté pintado desde el primer fotograma y
   no haya desvanecimiento al cargar.

### Identidad

La marca es el sello **`EVA_01`**: el guion bajo es lo único que se enciende —
con un glow mínimo en oscuro, en cyan profundo y sin brillo en claro. Aparece en
el header y en el footer, y es el mismo signo en los dos modos.

En el hero, la única nota de color es el signo `+` del titular. La monoespaciada
se reserva para categorías, etiquetas, estados, fechas, metadata e índice.

## Pendientes de contenido

- `links.contact` en `src/data/eva.ts` es `null`: todavía no hay correo ni
  formulario. Mientras siga en `null`, el CTA de «Estudios jurídicos» apunta al
  cierre, donde está el enlace público de Instagram. Poner un correo ahí
  (`mailto:...`) es lo único necesario para activarlo.

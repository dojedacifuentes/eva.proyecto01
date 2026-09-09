# EVA — landing v0.1

Sitio de **EVA**, proyecto de exploración aplicada sobre Derecho e inteligencia
artificial: herramientas jurídicas, formación, diseño de workflows y asesoría a
equipos legales.

Esta versión es un **marco editorial**, no un sitio lleno. Cada sección es un
capítulo preparado para crecer; el contenido se incorpora después, pieza por
pieza, sin rediseñar el sitio.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Geist / Geist Mono.
La página es completamente estática: no hay componentes de cliente ni JavaScript
de interacción.

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
    sections/     Hero, AboutEva, CoursesSection, PrototypesSection,
                  ReportsSection, LegalTeamsSection, ClosingSection
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

## Identidad

Paleta corta en `src/app/globals.css` (`--eva-*`): blanco cálido, marfil, negro
suave, gris y **un único color EVA**, el naranja `#fd7c46` de las piezas
editoriales del proyecto.

Ese naranja está calibrado para fondo oscuro: sobre marfil da 2.4:1, así que
**nunca se usa para texto**, sólo para marcas, filetes y subrayados. El texto y
los enlaces usan `--eva-accent-ink` (`#b8481a`, 4.97:1 sobre el fondo, AA).

La monoespaciada se reserva para categorías, etiquetas, estados, fechas y
metadata.

## Pendientes de contenido

- `links.instagram` en `src/data/eva.ts` es un marcador (`#`): falta la URL real.
- `links.contact` es `null`: mientras tanto, el CTA de «Estudios jurídicos»
  apunta al cierre.

# EVA — landing v2.0

Portada de **EVA, Entidad Virtual de Aprendizaje**: la interfaz que conecta cuatro universos
sobre inteligencia artificial, Derecho y educación — **EVA Academy**, **EVA News**,
**EVA Arcade** y **EVA Lab**.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Space Grotesk / JetBrains Mono.
Sin librerías de animación, partículas, 3D ni audio: el movimiento es CSS, el fondo es un canvas
2D propio y los microsonidos se sintetizan con Web Audio.

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint
npm run typecheck
npm run build
```

Despliegue: Vercel, sin configuración. Con dominio propio, definir `NEXT_PUBLIC_SITE_URL`.

## Estructura

```
public/eva/            retratos de EVA
src/
  app/                 layout, página, estilos globales, OG, robots, sitemap
  components/
    eva/               EvaField (fondo), EvaSignalCursor, SoundControl, Rotator, EvaPortraitFrame
    layout/            SiteHeader, MobileNavigation, SiteFooter
    sections/          HeroEva, ModuleGrid, FeaturedProject, AboutEva, ModuleSection,
                       NewsPreview, ArchiveStats, InstitutionalCTA
    ui/                EntryCard, StatusBadge, ExternalLink
  content/             ← todo lo editable: site, modules, projects, resources, news, assets
  lib/                 types, content (proyecciones y contadores), sound, site
  styles/tokens.css    colores, radios, tiempos
docs/                  auditorías, roadmap, guía de contenido, referencias y licencias
```

## Cómo se edita

Ver [`docs/CONTENT_GUIDE.md`](docs/CONTENT_GUIDE.md). En corto: textos y conmutadores en
`src/content/site.ts`, proyectos en `projects.ts`, noticias en `news.ts`, retratos en
`assets.ts`, colores en `src/styles/tokens.css`.

## Documentación

- [`HANDOFF.md`](docs/HANDOFF.md) — estado actual y siguiente paso
- [`AUDITORIA_INICIAL_LANDING_EVA.md`](docs/AUDITORIA_INICIAL_LANDING_EVA.md)
- [`AUDITORIA_FINAL_LANDING_EVA.md`](docs/AUDITORIA_FINAL_LANDING_EVA.md)
- [`LANDING_ROADMAP.md`](docs/LANDING_ROADMAP.md)
- [`MATRIZ_REFERENCIAS_REACT_LANDING.md`](docs/MATRIZ_REFERENCIAS_REACT_LANDING.md)
- [`ASSET_LICENSES.md`](docs/ASSET_LICENSES.md)

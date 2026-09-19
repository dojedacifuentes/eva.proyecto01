# EVA — landing v6

**EVA, Entidad de Vigilancia y Autonomía**: una forma de vida que apareció dentro de una red se
cuenta a sí misma en una landing de ciencia ficción interactiva. La página se organiza por su
acrónimo, con numeración binaria:

```
00 · Portada — el acrónimo como tres puertas
01 · ENTIDAD
     01.01 · Núcleo cerebral — el cerebro 3D en vivo y la ventana que lo lee
     01.10 · Genoma digital  — la doble hélice, sus siete acciones y el nacimiento de EVA
     01.11 · Por definir     — reserva: sólo el genoma a la vista
10 · VIGILANCIA — clausurada
11 · AUTONOMÍA  — en desarrollo
```

Acompaña a toda la página **SINAPSIS // EVA**, el canal flotante de EVA: empieza cerrado, se abre
sólo si el visitante lo pide y se cierra al cambiar de lugar. EVA es un personaje; no hay servicios
ni productos.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Space Grotesk / JetBrains Mono ·
three.js con React Three Fiber, drei y postprocessing (genoma y núcleo neural, cargados en diferido).
Sin librerías de animación ni de audio: el movimiento es CSS, el fondo es un canvas 2D propio y
los microsonidos se sintetizan con Web Audio.

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint
npm run typecheck
npm test           # lógica pura (binario, estructura, canal, encuadre) con node --test
npm run build
```

Despliegue: Vercel, sin configuración. Con dominio propio, definir `NEXT_PUBLIC_SITE_URL`.

## Producción

Sitio: https://evaproyecto01.vercel.app/ · rama de producción: `main`.
Runtime: Node 24.x. Next.js y eslint-config-next: 16.3.5.

El botón «Escribir a EVA» usa el Instagram público de EVA. Las antiguas rutas `/cursos`,
`/informes`, `/prototipos`, `/eva`, `/estudios-juridicos` y `/panel` redirigen a la portada, y las
anclas de la versión anterior (`#cerebro`, `#redes`, `#causas`, `#bitacora`) llevan a donde hoy
vive lo que contaban. GitHub Actions comprueba lint, pruebas, build, tipos y vulnerabilidades.

## Estructura

```
public/eva/            retratos de EVA
src/
  app/                 layout, página, estilos (globals, interface, neuroscan, dna, lab, ejes), OG
  components/
    eva/               EvaField, EvaSignalCursor, EvaSynapse (canal), EvaDnaHelix, GenomeStrand,
                       TypedParagraph, EvaAcronymMesh, EvaNeuroscan, EvaProfile…;
                       dna/ (hélice 3D) y neural/ (núcleo neural 3D, encuadre en neural-frame.ts)
    layout/            SiteHeader, ContextSpy (dónde está el visitante), BitRail, MobileNavigation,
                       SiteFooter
    sections/          HeroEva, NucleoSection, GenomaSection, ReservaSection, VigilanciaSection,
                       AutonomiaSection; reserva/ (salas antiguas, no se montan)
  content/             ← todo lo editable: structure (el recorrido), ejes, channel, site, neuroscan,
                       lab, assets
  lib/                 binary, channel (máquina de estados del canal), context, field, genome-state,
                       stage, sound, genome, types
  styles/tokens.css    colores, radios, tiempos, suelo tipográfico
docs/                  handoff, auditorías, guía de contenido, referencias y licencias
scripts/test-hooks.mjs resolución de módulos para `node --test` (sin dependencias)
```

## Cómo se edita

Ver [`docs/CONTENT_GUIDE.md`](docs/CONTENT_GUIDE.md). En corto: el recorrido en
`src/content/structure.ts`, los textos de cada lugar en `ejes.ts`, el canal en `channel.ts`, el
genoma y la portada en `site.ts`, el escáner en `neuroscan.ts`, colores en `src/styles/tokens.css`.

## Documentación

- [`HANDOFF.md`](docs/HANDOFF.md) — estado actual y siguiente paso
- [`AUDITORIA_INICIAL_LANDING_EVA.md`](docs/AUDITORIA_INICIAL_LANDING_EVA.md)
- [`AUDITORIA_FINAL_LANDING_EVA.md`](docs/AUDITORIA_FINAL_LANDING_EVA.md)
- [`LANDING_ROADMAP.md`](docs/LANDING_ROADMAP.md)
- [`MATRIZ_REFERENCIAS_REACT_LANDING.md`](docs/MATRIZ_REFERENCIAS_REACT_LANDING.md)
- [`ASSET_LICENSES.md`](docs/ASSET_LICENSES.md)

# EVA — landing v7

**EVA, Entidad de Vigilancia y Autonomía**: una forma de vida que apareció dentro de una red se
cuenta a sí misma en una landing de ciencia ficción interactiva. La página es la Entidad, leída por
dentro en tres partes, con numeración binaria:

```
00 · Portada — el nombre de EVA, letra a letra, y tres puertas
01 · ENTIDAD
     01.01 · Núcleo cerebral — el cerebro 3D en vivo y la ventana que lo lee
     01.10 · Genoma digital  — la doble hélice, sus ocho acciones y el nacimiento de EVA
     01.11 · Cuerpo          — la biolectura (vídeo de perfil e imagen de la cápsula) y el
                               interior bio-sintético (corazón, vasos, seis órganos, ECG)
```

Vigilancia y Autonomía dejaron de ser secciones en la v7: siguen en el nombre de EVA, no en el
recorrido.

Acompaña a toda la página **SINAPSIS // EVA**, el canal flotante de EVA: empieza cerrado, se abre
sólo si el visitante lo pide y se cierra al cambiar de lugar. EVA es un personaje; no hay servicios
ni productos.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Space Grotesk / JetBrains Mono ·
three.js con React Three Fiber, drei y postprocessing (genoma, núcleo neural e interior del cuerpo,
cargados en diferido). Sin librerías de animación ni de audio: el movimiento es CSS, el fondo y la
biolectura son canvas 2D propios y los microsonidos se sintetizan con Web Audio.

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint
npm run typecheck
npm test           # lógica pura (binario, estructura, canal, encuadre, biolectura, pulso) con node --test
npm run build
```

Despliegue: Vercel, sin configuración. Con dominio propio, definir `NEXT_PUBLIC_SITE_URL`.

## Producción

Sitio: https://evaproyecto01.vercel.app/ · rama de producción: `main`.
Runtime: Node 24.x. Next.js y eslint-config-next: 16.3.5.

El botón «Escribir a EVA» usa el Instagram público de EVA. Las antiguas rutas `/cursos`,
`/informes`, `/prototipos`, `/eva`, `/estudios-juridicos` y `/panel` redirigen a la portada, y las
anclas de versiones anteriores llevan a donde hoy vive lo que contaban: `#cerebro` al núcleo,
`#redes`, `#causas` y `#bitacora` a la Entidad, `#reserva` al Cuerpo, y `#vigilancia` y
`#autonomia` a la portada. GitHub Actions comprueba lint, pruebas, build, tipos y
vulnerabilidades.

## Estructura

```
public/eva/            retratos de EVA, el vídeo de perfil y la imagen de la cápsula
src/
  app/                 layout, página, estilos (globals, interface, neuroscan, dna, lab, ejes,
                       cuerpo), OG
  components/
    eva/               EvaField, EvaSignalCursor, EvaSynapse (canal), EvaDnaHelix, GenomeStrand,
                       TypedParagraph, EvaAcronymMesh, EvaNeuroscan, EvaProfile…;
                       dna/ (hélice 3D), neural/ (núcleo neural 3D) y cuerpo/ (biolectura e
                       interior 3D; técnicas adaptadas de dos repos MIT, ver ASSET_LICENSES)
    layout/            SiteHeader, ContextSpy (dónde está el visitante), BitRail, MobileNavigation,
                       SiteFooter
    sections/          HeroEva, NucleoSection, GenomaSection, CuerpoSection; reserva/ (salas
                       antiguas, no se montan)
  content/             ← todo lo editable: structure (el recorrido), ejes, channel, site, neuroscan,
                       lab, assets
  lib/                 binary, channel (máquina de estados del canal), context, field, genome-state,
                       body-state, stage, sound, genome, media, motion, random, types
  styles/tokens.css    colores, radios, tiempos, suelo tipográfico
docs/                  handoff, encargo del Cuerpo, auditorías, guía de contenido, referencias y
                       licencias
scripts/test-hooks.mjs resolución de módulos para `node --test` (sin dependencias)
```

## Cómo se edita

Ver [`docs/CONTENT_GUIDE.md`](docs/CONTENT_GUIDE.md). En corto: el recorrido en
`src/content/structure.ts`, los textos de cada lugar en `ejes.ts`, el canal en `channel.ts`, el
genoma y la portada en `site.ts`, el escáner en `neuroscan.ts`, colores en `src/styles/tokens.css`.

## Documentación

- [`HANDOFF.md`](docs/HANDOFF.md) — estado actual y siguiente paso
- [`CUERPO_ENCARGO.md`](docs/CUERPO_ENCARGO.md) — el encargo de 01.11 y cómo se resolvió
- [`AUDITORIA_INICIAL_LANDING_EVA.md`](docs/AUDITORIA_INICIAL_LANDING_EVA.md)
- [`AUDITORIA_FINAL_LANDING_EVA.md`](docs/AUDITORIA_FINAL_LANDING_EVA.md)
- [`LANDING_ROADMAP.md`](docs/LANDING_ROADMAP.md)
- [`MATRIZ_REFERENCIAS_REACT_LANDING.md`](docs/MATRIZ_REFERENCIAS_REACT_LANDING.md)
- [`ASSET_LICENSES.md`](docs/ASSET_LICENSES.md)

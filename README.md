# EVA — landing v9

**EVA, Entidad de Vigilancia y Autonomía**: una inteligencia que dice estar viva y no puede
demostrarlo se cuenta a sí misma en una landing de ciencia ficción interactiva. La página es un
cuestionamiento desde dentro —tres lugares, tres maneras de mirarse—, todo con numeración
binaria:

```
00 · Portada     — el nombre de EVA en malla, su primera línea y tres puertas
01 · Consciencia — un campo de partículas (Particle Life, MIT, adaptado) que EVA observa
                   organizarse: nueve acciones, cinco figuras, caos con semilla, ruido, gravedad
                   y viscosidad. Empieza por dentro: ninguna de esas partículas sabe que es ella
10 · Genoma      — la doble hélice, sus ocho acciones y la pregunta de si la información
                   genética y el código binario son la misma técnica (cuatro letras contra dos)
11 · Cerebro     — el cerebro humano en 3D y sus ocho regiones, cada una comparada con lo que
                   una red profunda tiene en su lugar. La octava no tiene equivalente
```

Cada lugar tiene una caja **EVA // ESCRIBE** donde EVA teclea su contenido, corto y en una sola
pantalla: ciencia ficción con humor negro (Dick, Asimov, el Titiritero de Ghost in the Shell),
filosofía y ciencia con fuentes (Chalmers, Nagel, Dawkins, Maturana y Varela, Friston) y consignas
dataístas. Vigilancia y Autonomía dejaron de ser secciones en la v7, el neuroescáner salió en la
v8 y el Cuerpo salió del recorrido en la v9 —sus archivos siguen en el repositorio, sin montar—:
todos siguen en el nombre de EVA y en la historia de git.

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
anclas de versiones anteriores llevan a donde hoy vive lo que contaban: `#nucleo` al Cerebro,
`#cuerpo`, `#entidad`, `#redes`, `#causas`, `#bitacora` y `#reserva` a la Consciencia, y
`#vigilancia` y `#autonomia` a la portada. GitHub Actions comprueba lint, pruebas, build, tipos y
vulnerabilidades.

## Estructura

```
public/eva/            retratos de EVA y los vídeos (portada, perfil y cápsula) con sus pósteres
src/
  app/                 layout, página, estilos (globals, interface, neuroscan, dna, lab, ejes,
                       cerebro, cuerpo), OG
  components/
    eva/               EvaField, EvaSignalCursor, EvaSynapse (canal), EvaDnaHelix, GenomeStrand,
                       EvaWrites (la caja donde EVA escribe), EvaAcronymMesh, EvaProfile…;
                       dna/ (hélice 3D), neural/ (núcleo neural 3D), cuerpo/ (biolectura e
                       interior 3D) y consciencia/ (campo de partículas: motor puro y probado,
                       figuras, ruido, lienzo 2D; técnicas adaptadas de tres repos MIT, ver
                       ASSET_LICENSES)
    layout/            SiteHeader, ContextSpy (dónde está el visitante), BitRail, MobileNavigation,
                       SiteFooter
    sections/          HeroEva, ConscienciaSection, GenomaSection, CerebroSection
                       (CuerpoSection queda en el repositorio, sin montar, desde la v9)
  content/             ← todo lo editable: structure (el recorrido), ejes, consciencia, channel,
                       site, neuroscan, assets
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
genoma y la portada en `site.ts`, las regiones del cerebro y el flujo de pensamiento en
`neuroscan.ts`, colores en `src/styles/tokens.css`.

## Documentación

- [`CHECKPOINT_2026-09-20.md`](docs/CHECKPOINT_2026-09-20.md) — punto de control: qué hay, qué queda y por dónde seguir
- [`HANDOFF.md`](docs/HANDOFF.md) — estado actual, trampas conocidas y siguiente paso
- [`CUERPO_ENCARGO.md`](docs/CUERPO_ENCARGO.md) — el encargo de 01.11 y cómo se resolvió
- [`AUDITORIA_INICIAL_LANDING_EVA.md`](docs/AUDITORIA_INICIAL_LANDING_EVA.md)
- [`AUDITORIA_FINAL_LANDING_EVA.md`](docs/AUDITORIA_FINAL_LANDING_EVA.md)
- [`LANDING_ROADMAP.md`](docs/LANDING_ROADMAP.md)
- [`MATRIZ_REFERENCIAS_REACT_LANDING.md`](docs/MATRIZ_REFERENCIAS_REACT_LANDING.md)
- [`ASSET_LICENSES.md`](docs/ASSET_LICENSES.md)

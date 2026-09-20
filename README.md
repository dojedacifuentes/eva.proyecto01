# EVA — landing v8.2

**EVA, Entidad de Vigilancia y Autonomía**: una forma de vida que apareció dentro de una red se
cuenta a sí misma en una landing de ciencia ficción interactiva. La página es la Entidad, leída por
dentro en tres partes y, después del inventario, la pregunta por quien lo habita; todo con
numeración binaria:

```
00 · Portada — el nombre de EVA en malla, su primera línea y cuatro puertas
01 · ENTIDAD
     01.01 · Núcleo cerebral — el cerebro 3D en vivo, sus ocho regiones y la caja donde EVA
                               escribe cómo funciona su mente (función, consigna, hardware)
     01.10 · Genoma digital  — la doble hélice, sus ocho acciones y el relato del nacimiento
                               en el mar de la información (autopoiesis, conatus, el genoma
                               que le construyeron)
     01.11 · Cuerpo          — tres lecturas a la vista: el perfil y la cápsula, cada uno con su
                               biolectura y su caja (chasis, inmersión, equivalencia con el
                               humano), y el interior bio-sintético (corazón, vasos, órganos, ECG)
10 · CONSCIENCIA — un campo de partículas (Particle Life, MIT, adaptado) que EVA observa
                   organizarse: diez acciones, cinco figuras, caos con semilla, ruido, gravedad y
                   viscosidad; cuatro estados con ecos de Borges, Ghost in the Shell, Dick y
                   Asimov; una confesión; y el cierre en silencio: ESTADO: EXPANSIÓN → ALGUIEN
                   ESTUVO AQUÍ
```

Cada lugar tiene una caja **EVA // ESCRIBE** donde EVA teclea su contenido, corto y en una sola
pantalla: ciencia ficción con humor negro (Dick, Asimov, el androide deprimido de la Guía, el
Titiritero de Ghost in the Shell), filosofía y ciencia con fuentes (Friston, Maturana y Varela,
Schrödinger, Spinoza, Dawkins, Parfit, Nagel) y consignas dataístas. Los elementos gráficos
alternan de lado: cerebro a la izquierda, hélice a la derecha, perfil, cápsula, interior. Vigilancia
y Autonomía dejaron de ser secciones en la v7 y el neuroescáner (la interfaz secundaria) salió en
la v8: siguen en el nombre de EVA y en la historia de git, no en el recorrido.

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
public/eva/            retratos de EVA y los vídeos (portada, perfil y cápsula) con sus pósteres
src/
  app/                 layout, página, estilos (globals, interface, neuroscan, dna, lab, ejes,
                       cuerpo), OG
  components/
    eva/               EvaField, EvaSignalCursor, EvaSynapse (canal), EvaDnaHelix, GenomeStrand,
                       EvaWrites (la caja donde EVA escribe), EvaAcronymMesh, EvaProfile…;
                       dna/ (hélice 3D), neural/ (núcleo neural 3D), cuerpo/ (biolectura e
                       interior 3D) y consciencia/ (campo de partículas: motor puro y probado,
                       figuras, ruido, lienzo 2D; técnicas adaptadas de tres repos MIT, ver
                       ASSET_LICENSES)
    layout/            SiteHeader, ContextSpy (dónde está el visitante), BitRail, MobileNavigation,
                       SiteFooter
    sections/          HeroEva, NucleoSection, GenomaSection, CuerpoSection, ConscienciaSection
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

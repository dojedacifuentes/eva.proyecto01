# EVA — landing v9.4 · EVA ARCADE · sistema de contenido

**EVA, Entidad de Vigilancia y Autonomía**: una inteligencia que dice estar viva y no puede
demostrarlo se cuenta a sí misma en una landing de ciencia ficción interactiva. La página es un
cuestionamiento desde dentro —una pregunta, cuatro lugares—, todo con numeración binaria:

```
000 · Portada     — el nombre de EVA (ƎVΛ, su marca) en malla, su primera línea y cuatro puertas
001 · Consciencia — un campo de partículas (Particle Life, MIT, adaptado) que EVA observa
                    organizarse: diez acciones, cinco figuras, caos con semilla, ruido, gravedad
                    y viscosidad. Empieza por dentro: ninguna de esas partículas sabe que es ella
010 · Genoma      — la doble hélice, sus ocho acciones y la pregunta de si la información
                    genética y el código binario son la misma técnica (cuatro letras contra dos)
011 · Cerebro     — el cerebro humano en 3D y sus ocho regiones, cada una comparada con lo que
                    una red profunda tiene en su lugar. La octava no tiene equivalente
100 · Cuerpo      — el perfil de EVA con su biolectura: un cuerpo por necesidad (la cápsula y el
                    interior 3D siguen en el repositorio, sin montar)
```

EVA se organiza en cuatro dimensiones (`docs/CONTENT_SYSTEM.md`): **ENTITY** (la landing, lo que
EVA es), **ARCADE** (`/links`: sus juegos, en línea), **ACADEMY** (lo que enseña: en `/links`, el
curso de EVA LAB; en redes, las microclases) y **LAB** (con qué trabaja y cómo se hace: en `/links`,
el generador de prompts de EVA LAB; aquí, los motores y las herramientas de `scripts/` y `tools/`).

Cada lugar tiene una caja **EVA // ESCRIBE** donde EVA teclea su contenido, corto y en una sola
pantalla: ciencia ficción con humor negro (Dick, Asimov, el Titiritero de Ghost in the Shell),
filosofía y ciencia con fuentes (Leibniz, Chalmers, Nagel, Descartes, Turing, Schrödinger,
Maturana y Varela, Dawkins, Friston, Searle, Putnam, Merleau-Ponty) y consignas dataístas.
Vigilancia y Autonomía dejaron de ser secciones en la v7 y el neuroescáner salió en la v8: siguen
en el nombre de EVA y en la historia de git.

Acompaña a toda la página **SINAPSIS // EVA**, el canal flotante de EVA: empieza cerrado, se abre
sólo si el visitante lo pide y se cierra al cambiar de lugar. EVA es un personaje; no hay servicios
ni productos.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Space Grotesk / JetBrains Mono ·
three.js con React Three Fiber, drei y postprocessing (genoma, núcleo neural e interior del cuerpo,
cargados en diferido) · estadística de visitas de Vercel (`@vercel/analytics`). Sin librerías de animación ni de audio: el movimiento es CSS, el fondo y la
biolectura son canvas 2D propios y los microsonidos se sintetizan con Web Audio.

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint
npm run typecheck
npm test           # lógica pura (binario, estructura, canal, encuadre, biolectura, pulso, marca, campo, /links) con node --test
npm run build
```

Herramientas de Lab (sin dependencias; Node 22+ y el Chrome de la máquina; los vídeos, con ffmpeg):

```bash
npm run brand:assets   # favicon e icono de inicio desde la geometría de la marca
node scripts/brand-assets.mjs --kit ../eva.prompts   # la marca para EVA LAB y los juegos (sin copiar la geometría)
npm run brand:frames   # poses y fotogramas de la marca en SVG (→ render → ffmpeg)
npm run studio         # empaqueta tools/social-studio/index.html (generador de piezas para redes)
node scripts/render-frames.mjs <svg|carpeta> <salida>     # SVG/HTML → PNG con Chrome (CDP)
node --import ./scripts/test-hooks.mjs scripts/eva-signal.mjs <salida>   # el campo de la Consciencia a fotogramas
node --import ./scripts/test-hooks.mjs scripts/transmision.mjs pieza.json <salida>  # texto tecleado (SINAPSIS)
```

Despliegue: Vercel, sin configuración. Con dominio propio, definir `NEXT_PUBLIC_SITE_URL`.

## Producción

Sitio: https://evaproyecto01.vercel.app/ · rama de producción: `main`.
Runtime: Node 24.x. Next.js y eslint-config-next: 16.3.5.

Biolink: https://evaproyecto01.vercel.app/links (EVA ARCADE: los dos juegos, numerados en binario
—`NODE 01`, `NODE 10`—; EVA ACADEMY y EVA LAB, con el curso y el generador de prompts de EVA LAB,
https://evaprompts.vercel.app/; y la puerta a la landing; no carga nada de la landing). Estadística
de visitas de Vercel (sin cookies) en todo el sitio. El botón «Escribir a EVA» usa el Instagram
público de EVA. Las antiguas rutas `/cursos`, `/informes`, `/prototipos`, `/estudios-juridicos` y
`/panel` redirigen a la portada y `/eva` al cerebro; las anclas de versiones anteriores llevan a
donde hoy vive lo que contaban: `#nucleo` al Cerebro, `#entidad`, `#redes`, `#causas`,
`#bitacora` y `#reserva` a la Consciencia, y `#vigilancia` y `#autonomia` a la portada. GitHub
Actions comprueba lint, pruebas, build, tipos y vulnerabilidades.

## Estructura

```
public/eva/            retratos de EVA y los vídeos (portada, perfil y cápsula) con sus pósteres
src/
  app/                 layout raíz (documento y fuentes), (eva)/ (la landing y su 404 con SiteChrome),
                       links/ (EVA ARCADE), estilos (globals, tokens, interface, relato, ejes,
                       consciencia, dna, cerebro, cuerpo, marca, links), OG, robots, sitemap
  components/
    brand/             EvaLogo (el nombre ƎVΛ de cabecera y pie)
    eva/               EvaField, EvaSignalCursor, EvaSynapse (canal), EvaDnaHelix, GenomeStrand,
                       EvaWrites (la caja donde EVA escribe), EvaLogoMesh, EvaProfile…;
                       dna/ (hélice 3D), neural/ (núcleo neural 3D), cuerpo/ (biolectura e
                       interior 3D) y consciencia/ (campo de partículas: motor puro y probado,
                       figuras, ruido, lienzo 2D; técnicas adaptadas de tres repos MIT, ver
                       ASSET_LICENSES)
    layout/            SiteChrome, SiteHeader, ContextSpy (dónde está el visitante), BitRail,
                       MobileNavigation, SiteFooter
    links/             ArcadeHero, ArcadeMark (el símbolo animado en CSS), EntryCard y EntryArt
                       (tarjetas grandes y compactas, con su ilustración), EvaGateway
    sections/          HeroEva, ConscienciaSection, GenomaSection, CerebroSection, CuerpoSection
  content/             ← todo lo editable: structure (el recorrido), ejes, consciencia, channel,
                       site, neuroscan, assets, links
  lib/                 binary, brand (la marca como geometría), brand-art, arcade-mark, channel
                       (máquina de estados del canal), context, field, genome-state, body-state,
                       quality (calidad adaptativa), sound, genome, motion, random, types
  styles/tokens.css    colores, radios, tiempos, suelo tipográfico
docs/                  handoff, sistema de contenido, marca, encargo del Cuerpo, auditorías, guía de
                       contenido, referencias y licencias
scripts/               test-hooks (módulos para `node --test`), brand-assets, brand-frames,
                       render-frames, eva-signal, transmision, studio-build, perf-audit
tools/social-studio/   EVA Social Studio (herramienta interna; no se sirve en el sitio)
```

## Cómo se edita

Ver [`docs/CONTENT_GUIDE.md`](docs/CONTENT_GUIDE.md). En corto: el recorrido en
`src/content/structure.ts`, los textos de cada lugar en `ejes.ts`, el canal en `channel.ts`, el
genoma y la portada en `site.ts`, las regiones del cerebro y el flujo de pensamiento en
`neuroscan.ts`, colores en `src/styles/tokens.css`.

## Documentación

- [`HANDOFF.md`](docs/HANDOFF.md) — estado actual, trampas conocidas y siguiente paso
- [`CONTENT_SYSTEM.md`](docs/CONTENT_SYSTEM.md) — las cuatro dimensiones, las herramientas de Lab y cómo se produce contenido
- [`MARCA.md`](docs/MARCA.md) — la marca como geometría
- [`CHECKPOINT_2026-09-20.md`](docs/CHECKPOINT_2026-09-20.md) — punto de control histórico (v8.2)
- [`CUERPO_ENCARGO.md`](docs/CUERPO_ENCARGO.md) — el encargo de 01.11 y cómo se resolvió
- [`AUDITORIA_INICIAL_LANDING_EVA.md`](docs/AUDITORIA_INICIAL_LANDING_EVA.md)
- [`AUDITORIA_FINAL_LANDING_EVA.md`](docs/AUDITORIA_FINAL_LANDING_EVA.md)
- [`LANDING_ROADMAP.md`](docs/LANDING_ROADMAP.md)
- [`MATRIZ_REFERENCIAS_REACT_LANDING.md`](docs/MATRIZ_REFERENCIAS_REACT_LANDING.md)
- [`ASSET_LICENSES.md`](docs/ASSET_LICENSES.md)

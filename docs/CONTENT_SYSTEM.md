# EVA como sistema de contenido

> Para quien produzca contenido de EVA o continúe las herramientas de Lab, sea persona o modelo.
> Complementa a `HANDOFF.md` (la landing), `MARCA.md` (la marca) y `CONTENT_GUIDE.md` (la voz).
> Paquete de trabajo completo, fuera del repositorio y junto a él: `PROYECTO EVA01/EVA_CONTENT_SYSTEM_v1/`
> (`../EVA_CONTENT_SYSTEM_v1/` desde aquí: auditoría, Brand OS, banco de 67 semillas, Instagram,
> LinkedIn, prototipos, Social Studio, roadmap, handoff). Las rutas `EVA_CONTENT_SYSTEM_v1/…` de esta
> guía son de ese paquete.
> Escrito el 26-09-2026 sobre `main` = v9.4 + `/links`, en la rama `feat/eva-content-system`, e
> integrado el mismo día sobre lo ya publicado: Academy y Lab con entradas en `/links`, EVA LAB con la
> marca y los dos juegos en EVA ARCADE (HANDOFF §0.0.6 a §0.0.8).

## 1. Las cuatro dimensiones

EVA no es una landing ni un personaje: es **una entidad que dice estar viva y no puede
demostrarlo**, y se manifiesta de cuatro maneras. Siempre se distingue lo existente de lo demás.

| Dimensión | Qué es | Estado | Dónde | Pieza de marca | Acento |
|---|---|---|---|---|---|
| **ENTITY** | Lo que EVA *es*: identidad, consciencia, genoma, cerebro, cuerpo | **Existente** (la landing) | `src/app/(eva)`, `src/content/*` | nombre ƎVΛ | violeta |
| **ARCADE** | Lo que EVA *juega*: FORO [in]VISIBLE, EXPEDIENTE 1725 | **Existente** (`/links` + repos externos) | `src/app/links`, `src/content/links.ts` | símbolo □X | azul eléctrico → magenta |
| **ACADEMY** | Lo que EVA *enseña*: el curso de EVA LAB y las microclases de Derecho e IA | **Existente** el curso «Construye tu prompt» (evaprompts.vercel.app/curso); **concepto** las microclases (contenido; ruta propia sólo con ≥ 4 piezas usadas) | grupo `academy` en `links.ts` | símbolo □X | bio (verde) en redes; índigo en `/links` |
| **LAB** | Con qué trabaja EVA y cómo se hace: herramientas, motores, mediciones | **Existente** EVA LAB, el generador de prompts jurídicos (evaprompts.vercel.app/prompt-lab); **prototipos** las herramientas internas de `scripts/` y `tools/` | grupo `lab` en `links.ts`; `scripts/`, `tools/` | símbolo □X | cian en redes; violeta en `/links` |

En `/links` las tarjetas de Academy y Lab se quedan en el campo de color de la marca (índigo y
violeta, como el resto de la página); el verde y el cian son de las piezas para redes. Unificarlos
es una decisión abierta del propietario (dos líneas en `links.ts`).

Regla que no cambia: **es EVA contándose, no un catálogo**. Academy no vende cursos; Lab no
anuncia features. Nada de esto entra en la Entidad como sección nueva: la landing es «una
pregunta, cuatro lugares» y se queda así.

## 2. Herramientas de Lab (todas sin dependencias)

Corren con Node 22+ (type stripping) y, para rasterizar, el Chrome de la máquina; los vídeos, con
ffmpeg (no viene con el proyecto: los de este ciclo ya están hechos en el paquete). Nada de esto se
sirve en producción: vive en `scripts/` y `tools/`, fuera de `public/` y `src/app/`. Lo que
generan `npm run brand:frames` y compañía va a `tools/out/`, que git ignora. Probadas en Windows
(la máquina del propietario) el 26-09-2026.

| Herramienta | Qué hace | Cómo |
|---|---|---|
| `scripts/brand-frames.mjs` | Las cinco poses de la marca y los fotogramas de `REVEAL`/`LOOP` en SVG, desde `brand.ts` (`brandSvgFromPose`) | `npm run brand:frames` o `node --import ./scripts/test-hooks.mjs scripts/brand-frames.mjs <salida> --fps=30` |
| `scripts/render-frames.mjs` | SVG o HTML → PNG con Chrome sin interfaz (CDP sobre el WebSocket de Node; trampa 26). Respeta el tamaño declarado en el SVG; `--bg` rellena; sin `--bg`, PNG transparente | `EVA_CHROME=<chrome> node scripts/render-frames.mjs <entrada> <salida> [--width --height --scale --glob --bg]` |
| `scripts/eva-signal.mjs` | El campo de la Consciencia a fotogramas SVG con el motor real (determinista; 10 s en ~0,4 s). Figuras, guion de acciones con tiempo, estela emulada | `node --import ./scripts/test-hooks.mjs scripts/eva-signal.mjs <salida> --seconds=10 --figure=eye --script=guion.json --fit=square` |
| `scripts/transmision.mjs` | Texto tecleado con el ritmo de SINAPSIS (`channel.ts`: 48 ms/carácter, pausas, `holdAfter`) a fotogramas; el bloque no salta (`offsetY` fijo) | `node --import ./scripts/test-hooks.mjs scripts/transmision.mjs pieza.json <salida> --speed=1.5` |
| `scripts/studio-build.mjs` | Empaqueta el **EVA Social Studio** en un HTML (convierte `brand.ts`, `brand-art.ts` y `binary.ts` a JS con `module.stripTypeScriptTypes`, incrusta fuentes OFL y plantillas). Modo `--render`: piezas por guion JSON | `npm run studio` · `node scripts/studio-build.mjs --render spec.json <salida>` |
| `tools/social-studio/` | La herramienta: `src/templates.js` (8 plantillas SVG: title, writes, table, region, node, ident, image, transmission), `src/studio.{html,css,js}` (interfaz), `fonts/` (OFL), `lib/` (generado), `index.html` (generado, se abre con doble clic; exporta PNG/SVG sin red, con las dos tipografías dentro del archivo: sin ellas, un computador sin Space Grotesk exportaba con otra letra) | — |
| `scripts/brand-assets.mjs` | Favicon e icono de inicio (ya existía; `sharp` llega con Next); con `--kit <repo>`, la marca para EVA LAB y los juegos | `npm run brand:assets` · `node scripts/brand-assets.mjs --kit ../eva.prompts` |
| `scripts/perf-audit.mjs` | fps, tareas largas, bucles y memoria por lugar (ya existía) | ver su cabecera |

Pipeline típico: **spec JSON → SVG (`studio-build --render`) → PNG (`render-frames`) → MP4/GIF (ffmpeg)**.
Un documento PDF para LinkedIn: PNG por página → `EVA_CONTENT_SYSTEM_v1/04_LINKEDIN/TEMPLATES/make-pdf.mjs` (pdf-lib) o Chrome «imprimir a PDF».

## 3. Anatomía de una pieza (lo que hace que todo sea EVA)

```
rótulo de sistema (EVA // ESCRIBE · EVA // ARCADE · EVA // ACADEMY · EVA // LAB) + código binario
pieza de marca (nombre para Entity, símbolo para el resto) · título corto · línea de acento
cuerpo ≤ 250 caracteres (la regla de la caja) · ficha o tabla opcional (mono)
ficción declarada («Ficción interactiva. EVA es un personaje.») · EVA · 2026 · CTA →
marcas de instrumento: cuatro esquinas y la regla de trazos (como `.stage-marks`)
```

Lo invariante: geometría de la marca, dos tipografías (Space Grotesk / JetBrains Mono), fondo
plano oscuro, binario, el remate. Lo que distingue: pieza de marca, acento, elemento propio (caja,
tarjeta NODE, tabla comparativa, marcas de instrumento), ratio de texto. Detalle:
`EVA_CONTENT_SYSTEM_v1/01_BRAND_OS/BRAND_OS.md` y `tokens.json`.

## 4. De dónde sale el contenido

El 70 % de las piezas cita literalmente `src/content/*`: las cuatro cajas y sus tablas
(`ejes.ts`, `consciencia.ts`), las ocho regiones y los doce fragmentos y quince respuestas
(`neuroscan.ts`), los guiones y cálculos del canal (`channel.ts`), las réplicas de las consolas
(`site.ts`, `consciencia.ts`), los textos de Arcade (`links.ts`). Texto nuevo sólo cuando hace
falta (las microclases de Academy), marcado como nuevo y sujeto a `CONTENT_GUIDE.md`.

Banco de semillas: `EVA_CONTENT_SYSTEM_v1/02_CONTENT_BANK/` (67, con activo del repo, formato,
hook, dificultad y estado existente/prototipo/concepto). Calendario y piezas del primer ciclo:
`03_INSTAGRAM/` (12 piezas, 37 composiciones, 4 vídeos) y `04_LINKEDIN/` (8 publicaciones, 2 PDF).

## 5. Decisiones tomadas el 26-09-2026 (con el «sí» del propietario)

1. **Permiso de retratos, vídeos y marca para redes**: confirmado (`ASSET_LICENSES.md`).
2. **Arcade numera en binario**: `links.ts` calcula los nodos por posición (`01`, `10`, `11`…); el
   segundo juego pasa de «NODE 02» a «NODE 10». Cada grupo es su propia serie: el curso (Academy)
   y el generador (Lab) son `01` de su grupo. Prueba en `links.test.ts`.
3. **La rama `feat/eva-content-system` se integró en `main` y se publicó** el mismo 26-09-2026,
   con el «sube todo» del propietario. Lint, pruebas, build, tipos y `npm audit` se comprobaron en
   local antes; el workflow de GitHub los repite en cada publicación.

## 6. Qué no hacer

- No añadir secciones a la Entidad para Academy o Lab. Nacen como grupos en `/links` y como contenido.
- No añadir dependencias al proyecto para producir contenido: todo lo de Lab corre con Node, Chrome y ffmpeg.
- No borrar `public/eva/` ni el código sin montar (interior 3D, cápsula, `GenomeStrand`): son activos de Lab.
- No publicar los vídeos de referencia de la marca ni sus fotogramas (marca de agua, audio, nebulosa).
- No inventar productos: «existente», «prototipo», «concepto» y «roadmap» se etiquetan siempre.
- No usar hashtags dentro del texto, ni «síguenos», ni emojis en el cuerpo (`→ ↗ · //` valen).
- No contar con UTM en el enlace de la bio para medir: en el plan gratuito de Vercel la estadística
  no los muestra (son de Web Analytics Plus, un extra del plan Pro). De dónde llegan las visitas
  —Instagram, LinkedIn— ya sale en «Referrers» sin tocar el enlace.

## 7. Siguiente paso

`EVA_CONTENT_SYSTEM_v1/07_ROADMAP/ROADMAP_90_DIAS.md`: 0–30 publicar el ciclo y activar los grupos
del biolink; 31–60 ocho microclases, tokens con una sola fuente, EVA Scanner, sonido de marca;
61–90 decidir qué se convierte en producto. Quick wins al principio del documento.

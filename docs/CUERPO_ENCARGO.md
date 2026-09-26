# Encargo: subsección 01.11 · CUERPO — implementado en la rama `feat/cuerpo` (v7)

> **Estado (19-09-2026, tarde):** implementado en `feat/cuerpo`, **sin integrar en `main` ni
> publicar**. Cómo se resolvió, qué se reutilizó de cada repo, las desviaciones y lo que decide
> el propietario: **§10**, al final. El resto del documento es el encargo tal como llegó, que se
> conserva como referencia.
>
> Checkpoint original del 19 de septiembre de 2026, escrito por la sesión que publicó la v6.

## 0. En diez líneas

- **Proyecto:** landing de EVA, `dojedacifuentes/eva.proyecto01`, producción en
  https://evaproyecto01.vercel.app/ (`main` = `900e5e5`, v6: la página por ejes). Verificado con
  `git remote -v`: `origin https://github.com/dojedacifuentes/eva.proyecto01.git`.
- **Qué hay que hacer:** convertir la subsección **01.11 · Por definir** (hoy una banda de reserva
  con la cinta del genoma) en **01.11 · CUERPO**, con dos piezas al final, en este orden:
  1. el **vídeo de EVA en la cápsula** con una **biolectura** exterior (barrido de partículas que
     reacciona a los bordes, HUD diegético, botón «Iniciar biolectura»), técnica adaptada de
     `collidingScopes/scanlines` (MIT);
  2. debajo, la **visualización interior** (corazón que late, partículas por los vasos, órganos
     seleccionables con panel de lectura, ECG), adaptada de `christianpasinrey/human-blood-system`
     («HÆMA», MIT).
- **Estilo:** cybertech · bio-orgánico · ciencia ficción, con la identidad que ya tiene EVA.
- **Los dos recursos ya están en el repo** (§3). Los dos repos de referencia ya están leídos (§6).
- **Rama de trabajo:** `feat/cuerpo` (parte de `main` `900e5e5`). **No integrar en `main` ni
  publicar**: al terminar, comprobaciones en verde, push de la rama y resumen al propietario.
- **Comprobaciones obligatorias antes de dar por hecho:** `npm run lint`, `npm test`,
  `npm run typecheck`, `npm run build`, revisión en navegador a 1440×900, 1366×720, 768×1024 y
  390×844 (`docs/HANDOFF.md` §4, trampas 4 y 17).

## 1. Estado del proyecto al escribir esto

| | |
|---|---|
| Producción | v6 (`900e5e5`), publicada el 19-09-2026. Recorrido: 00 Portada · 01 Entidad (01.01 Núcleo cerebral, 01.10 Genoma digital, 01.11 Por definir) · 10 Vigilancia · 11 Autonomía |
| Rama `feat/eva-ejes` | ya fusionada; se puede borrar |
| Rama `feat/cuerpo` | este checkpoint: recursos + documentación, **sin código de la subsección todavía** |
| Comprobaciones en `main` | lint, 23 pruebas, tipos, build Next.js 16.3.5, «Validate landing» en verde |
| Documentación viva | `docs/HANDOFF.md` (arquitectura, trampas 1–23, pendientes), `docs/CONTENT_GUIDE.md` (voz y reglas del binario), `docs/ASSET_LICENSES.md`, `docs/MATRIZ_REFERENCIAS_REACT_LANDING.md` |
| Stack | Next.js 16.3.5 (App Router, Turbopack, React Compiler) · React 19.2.4 · three 0.186 · @react-three/fiber 9 · drei 10 · @react-three/postprocessing 3.1.1 · Tailwind 4 sólo como import base (todo el CSS es propio) |
| Node | 24.x (Vercel usa la misma) |

Lo que decide la estructura: **`src/content/structure.ts`** (ejes, subsecciones, códigos
calculados, estados, alias de anclas). Los textos de cada lugar: **`src/content/ejes.ts`**. Los
guiones del canal SINAPSIS: `src/content/channel.ts`. Las secciones son componentes de servidor en
`src/components/sections/*Section.tsx`; las piezas vivas (cliente) van en `src/components/eva/`.
Estilos: `src/styles/tokens.css` + seis hojas en `src/app/` (`ejes.css` es la de la v6).

## 2. Encargo del propietario (texto íntegro, 19-09-2026)

Se copia tal cual llegó, con sus dos notas finales. La versión estructurada está en §4.

```text
INCLUYE ESTE PROMPT QUE ADJUNTARÉ PARA CREAR LA ULTIMA SUBSECCION DEL PUNTO 1. EN EL HAND OFF CREA
CHECKPOINT Y TODO LO NECESARIO PARA CONTINUAR DESDE OTRA SESION, QUE ESTA SE ESTA AGOTANDO.
AGREGAREMOS UNA IMAGEN (VIDEO) UNA IMAGEN Y UN SCANER Y UNOS ELEMENTOS ORGANICOS. LA SECCION SE
LLAMARA CUERPO.

Trabaja en el proyecto web de EVA ya abierto en este workspace. El destino esperado es el
repositorio local que genera https://evaproyecto01.vercel.app/, la landing “EVA — Entidad de
Vigilancia y Autonomía”.

Antes de editar:
1. Ejecuta `git remote -v` e identifica el nombre exacto `propietario/repositorio` del proyecto
   abierto.
2. Revisa la estructura, el framework, las instrucciones del proyecto, la sección ENTIDAD, su
   subsección CUERPO, los estilos y los recursos de imagen existentes.
3. Confirma que el proyecto abierto corresponde a EVA y que su configuración o documentación lo
   vincula al deploy indicado. No inventes el nombre del repositorio. Si no puedes confirmar que es
   el proyecto correcto, detente sin editar y explica qué encontraste.
4. Modifica únicamente el proyecto EVA. Los repositorios siguientes son referencias de código, no
   destinos de trabajo:
   * Escaneo de imagen: https://github.com/collidingScopes/scanlines
     Reutiliza/adapta su efecto de ondas de partículas y detección de bordes sobre Canvas. Es un
     proyecto JavaScript/Canvas con licencia MIT.
   * Corazón y sistema de órganos: https://github.com/christianpasinrey/human-blood-system
     Inspecciona sus módulos Three.js para reutilizar/adaptar el corazón pulsante, las partículas
     que recorren vasos, los órganos seleccionables y el ECG/HUD. Tiene licencia MIT. Su modelo es
     estilizado y el repositorio es pequeño: comprueba estructura, dependencias y funcionamiento
     antes de copiar módulos.

Ubicación y composición
Integra todo dentro del punto existente 1. ENTIDAD, subsección CUERPO. Debe sentirse como una
ampliación hecha para la landing EVA, conectada con su narrativa y sistema visual. No crees una
página aparte, una app incrustada, una nueva sección principal ni un nuevo ítem de navegación.
Conserva los anchors, la navegación y el contenido existentes.
Al final de CUERPO, en este orden:

1. Imagen de EVA-07 y biolectura exterior. Localiza en los recursos existentes la imagen de EVA
   dentro de una cápsula biotecnológica —la figura de perfil conectada por tubos— que corresponde
   al material del proyecto. Muéstrala completa, sin cortar cabeza, pies ni cuerpo. Añade encima o
   junto a ella una simulación de lectura biológica: una pasada de partículas o línea de escaneo
   que reaccione a los bordes de la imagen, sutiles puntos de lectura y un pequeño HUD diegético
   con etiquetas como `EVA-07`, `BIOLECTURA`, `ESTADO` y `CICLO`.
   Adapta la técnica de `collidingScopes/scanlines`; no reproduzcas su página de demo ni sus
   controles de creación. Integra el efecto en el componente y estilo que correspondan al framework
   existente. Usa la paleta de EVA y ajusta densidad, velocidad y brillo para que la figura y sus
   detalles sigan siendo legibles. Un control discreto como INICIAR BIOLECTURA y la opción de
   repetir la pasada son suficientes. La animación puede renderizarse en Canvas en tiempo real; no
   conviertas la imagen en GIF o video para conseguirla. No actives webcam ni subas la imagen a un
   servidor.
2. Visualización interna de corazón y órganos. Inmediatamente debajo de la biolectura, crea un
   bloque cohesionado, titulado según la voz de la página —por ejemplo, `INTERIOR / SISTEMA
   BIO-SINTÉTICO`— que parezca el siguiente paso de la lectura: `EXTERIOR ANALIZADO → INTERIOR
   ACTIVO`. Aprovecha de `human-blood-system` el corazón que late, el recorrido de partículas por
   la red vascular, la silueta y los órganos que puedan seleccionarse, y el trazo ECG o HUD si se
   integran sin recargar la interfaz. Al seleccionar un órgano, presenta un panel breve de lectura
   narrativa asociado a EVA.
   Trata esta visualización como un modelo ficcional de EVA, no como órganos detectados de verdad
   en la imagen. No la superpongas a la figura ni sugieras que HÆMA extrae automáticamente una
   anatomía alineada con la fotografía: son dos piezas consecutivas, una lectura visual exterior y
   una representación interna. Mantén los datos como estados narrativos de ficción, no como
   diagnósticos ni mediciones médicas reales.

Integración visual y técnica
* Usa como base la identidad y las convenciones que ya tenga EVA: fondo oscuro, retícula,
  tipografía, paneles, jerarquía y acentos cromáticos existentes. El verde/cian bioluminiscente de
  la imagen y los acentos fríos del sitio pueden guiar el escaneo; conserva contraste suficiente
  para distinguir los vasos y el pulso en el modelo interior.
* Une los dos bloques con una transición visual fina —por ejemplo, un hilo de señal, una línea de
  estado o el cambio de etiqueta `LECTURA EXTERIOR` a `LECTURA INTERNA`— y espaciado coherente con
  el resto de la página. La pieza debe integrarse con la landing, sin parecer un iframe o una demo
  genérica pegada debajo.
* En escritorio, presenta la biolectura y su HUD con una composición equilibrada, manteniendo la
  imagen en proporción y completa. En móvil, apílalos; conserva controles legibles y evita
  desbordamientos.
* Carga la visualización 3D al acercarse a ella o al iniciarla, para no afectar el rendimiento
  inicial de la landing. Si WebGL no está disponible, deja una versión estática/2D usable con la
  imagen y el HUD.
* Respeta `prefers-reduced-motion`, ofrece controles accesibles por teclado, y mantén cualquier
  sonido apagado por defecto y activable explícitamente.
* Conserva y atribuye las licencias MIT de los repositorios cuando reutilices código. No copies la
  demo completa, no agregues dependencias innecesarias y no cambies elementos de otras secciones.
* Si falta la imagen de EVA-07 o un módulo fuente no puede integrarse, no lo sustituyas
  silenciosamente por una imagen o implementación ajena: informa exactamente qué recurso falta y
  deja una integración coherente con lo que sí existe. LA IMAGEN ESTARÁ ADJUNTA COMO VIDEO, QUIERO
  QUE CONSERVES EL VIDEO. Y LA OTRA COMO IMAGEN. PARÁMETROS UX UI CYBERTECH BIO ORGANIC CIENCIA
  FICCIÓN.

Implementa la integración dentro del proyecto actual. Al terminar, resume el remoto confirmado del
proyecto EVA, los archivos modificados, qué elementos reutilizaste de cada repo y cualquier
limitación importante. No despliegues ni publiques cambios.
```

## 3. Recursos ya en el repositorio (esta sesión los trajo)

| Recurso | Ruta | Datos | Uso previsto |
|---|---|---|---|
| **Vídeo de EVA en la cápsula** (la imagen animada: «ANIMA_ESTA_IMAGEN_PRIMERA_FRAM.mp4») | `public/eva/eva-capsula-loop.mp4` | MP4, 720×1280, 10,01 s, 5,77 MB, **con pista de audio** (no usarla: `muted`, sin control de sonido). Sin recomprimir | La pieza 1: el propietario quiere **el vídeo como vídeo**. Póster: la imagen de abajo |
| **Imagen de EVA en la cápsula** | `public/eva/eva-capsula.webp` | WebP, 1024×1536 (2:3). EVA de frente, de cuerpo entero, dentro de una cápsula de líquido verde, conectada por tubos; rótulos en la propia imagen: «ORPHEUS BIOTECH», «EVA-01 SYNTHETIC HUMAN INTERFACE», «SUBJECT EVA-01», «SOME THINGS STILL REMEMBER» | Póster del vídeo, fuente de la **detección de bordes** (un frame fijo basta), y la versión estática para móvil, movimiento reducido y sin WebGL |

Ambos registrados en `docs/ASSET_LICENSES.md` («entregados por el propietario, por confirmar»).
Ninguno está referenciado todavía desde `src/content/assets.ts`: añadirlos ahí (`capsuleLoop`,
`images.capsulePortrait`) siguiendo el patrón de `heroLoop`/`heroPortrait`, con `width`/`height`
reales y `alt` descriptivo en español.

**Ojo con el nombre:** la imagen dice **EVA-01** (y el sitio se llama «EVA / Proyecto 01»), pero
el encargo pide etiquetar el HUD como **`EVA-07`**. Es una decisión del propietario (§8). Hasta
que responda, usar `EVA-07` como pide el encargo y dejar el rótulo en `content/ejes.ts` para
cambiarlo en un sitio. **Respondió el 26-09-2026: `EVA-01`.**

## 4. El encargo, estructurado (requisitos)

### 4.1 Dónde

- Subsección **01.11** del eje **01 · Entidad**. Pasa de «Por definir» (estado `reserved`) a
  **«Cuerpo»** (estado `active`). Mismo hueco, mismo orden; **no** hay nueva sección principal ni
  nuevo ítem de navegación: la cabecera, el riel, el menú móvil y el pie la recogen solos desde
  `structure.ts`.
- Anclas: nueva `#cuerpo`; la vieja `#reserva` debe seguir llevando ahí (`hashAliases`).
- Nada de otras secciones se toca. Nada de página aparte, iframe ni app incrustada.

### 4.2 Pieza 1 — «Biolectura exterior» (vídeo + escaneo)

- El vídeo `eva-capsula-loop.mp4`, **entero** (cabeza, cuerpo y pies), sin recortar, en
  proporción 9:16; póster `eva-capsula.webp`. Como el retrato de la portada
  (`components/eva/EvaPortraitLoop.tsx`): `muted`, `playsInline`, `loop`, `preload="none"`, arranque
  en `onCanPlay` (trampa 5 del handoff), y sólo cuando entra en pantalla.
- Encima o al lado, un **lienzo 2D** con la técnica de scanlines (§6.1): una pasada de ondas de
  partículas que cruzan la figura y se congelan/colorean al encontrar bordes, más puntos de lectura
  sutiles. Fondo **transparente** (nada del negro de la demo), paleta de EVA (cian `#3fd8ee`,
  magenta `#f07ab9`, violeta `#9a8dff`; el verde bioluminiscente de la imagen puede guiar el
  color del borde). Densidad, velocidad y brillo tales que la figura siga legible.
- HUD diegético pequeño, en mono: `EVA-07` · `BIOLECTURA` · `ESTADO` · `CICLO` (los valores son
  estados narrativos, p. ej. `ESTADO: ESTABLE`, `CICLO: 0110`, en binario como el resto de
  identificadores; ver `CONTENT_GUIDE.md`).
- Controles: **«Iniciar biolectura»** y **repetir la pasada**. Nada más (sin dat.gui, sin
  exportar, sin subir imagen, sin webcam).
- Sin WebGL no cambia nada aquí (es Canvas 2D); con `prefers-reduced-motion`, sin animación: el
  póster + el HUD + los bordes ya trazados de forma estática.

### 4.3 Pieza 2 — «Interior / sistema bio-sintético»

- Inmediatamente debajo. Bloque cohesionado con título en la voz de la página (propuesta:
  `INTERIOR / SISTEMA BIO-SINTÉTICO`) y la transición `EXTERIOR ANALIZADO → INTERIOR ACTIVO`.
- De HÆMA (§6.2): corazón que late, partículas recorriendo la red vascular, silueta, **órganos
  seleccionables** (clic y teclado) que abren un **panel breve de lectura narrativa de EVA**, y el
  trazo ECG/HUD si no recarga.
- Es un **modelo ficcional de EVA**, no anatomía extraída del vídeo: no superponerlo a la figura;
  dos piezas consecutivas (lectura exterior → representación interna). Los datos son **estados de
  ficción** (nada de diagnósticos ni cifras médicas reales: los textos y «datos» de HÆMA no se
  reutilizan; los de EVA van a `content/ejes.ts`).
- **Carga diferida**: montar la escena 3D al acercarse (IntersectionObserver, `rootMargin`) o al
  pulsar; sin WebGL, versión 2D/estática usable (silueta + ECG en canvas 2D + panel de órganos
  como lista).
- Sonido (el «lub-dub» de HÆMA es procedural, Web Audio): **apagado por defecto** y sólo si se
  activa explícitamente; en EVA el sonido lo gobierna `lib/sound.ts` y el conmutador de la
  cabecera. Si se integra, que obedezca a ese conmutador; si no, dejarlo fuera.

### 4.4 Integración

- Identidad de EVA: tokens (`src/styles/tokens.css`), retícula, paneles, tipografía (Space
  Grotesk / JetBrains Mono), jerarquía de `NodeHead`/`NodeFoot` (`components/sections/NodeParts.tsx`).
- Transición fina entre las dos piezas: hilo de señal, línea de estado, o cambio de etiqueta
  `LECTURA EXTERIOR` → `LECTURA INTERNA`.
- Escritorio: vídeo + HUD en composición equilibrada, vídeo entero y en proporción. Móvil:
  apilado, controles legibles, sin desbordes (comprobar a 390 y 360 px).
- Accesible por teclado; `prefers-reduced-motion` respetado en las dos piezas.
- Licencias MIT: conservar y atribuir (cabecera de cada archivo adaptado + filas en
  `docs/ASSET_LICENSES.md` y `docs/MATRIZ_REFERENCIAS_REACT_LANDING.md`). Sin dependencias nuevas
  (three/R3F ya están; scanlines es vanilla).
- Si algo no se puede integrar, decirlo con exactitud; no sustituir por otra cosa en silencio.

## 5. Plan de implementación propuesto (con rutas)

1. **Rama:** `git switch feat/cuerpo` (ya existe, parte de `main` `900e5e5`; hacer
   `git fetch origin && git rebase origin/main` si `main` avanzó).
2. **Estructura** — `src/content/structure.ts`: en `SOURCE[0].children[2]` cambiar
   `{ id: 'reserva', name: 'Por definir', motto: 'Reserva de contenido', state: 'reserved', stateLabel: … }`
   por `{ id: 'cuerpo', name: 'Cuerpo', motto: '<lema corto>', state: 'active' }` y en
   `hashAliases` añadir `reserva: 'cuerpo'`. Revisar `src/content/structure.test.ts` (espera tres
   subsecciones y los códigos `01.01/01.10/01.11`; el nombre no debería romperlo, pero ejecutar
   `npm test`).
3. **Textos** — `src/content/ejes.ts`: sustituir el bloque `reserva` por `cuerpo`: título, `lede`,
   rótulos del HUD (`EVA-07`, `BIOLECTURA`, `ESTADO`, `CICLO`, `LECTURA EXTERIOR`, `LECTURA
   INTERNA`, `INTERIOR / SISTEMA BIO-SINTÉTICO`, `EXTERIOR ANALIZADO → INTERIOR ACTIVO`), botones
   (`Iniciar biolectura`, `Repetir la pasada`), lecturas por órgano (corazón, pulmones, cerebro,
   riñones, hígado, aorta… o los que se decidan), nota de ficción. Voz: `docs/CONTENT_GUIDE.md`
   (EVA se cuenta; primero informa, después remata; un remate por bloque; ficción declarada).
   Canal: añadir `cuerpo` en `src/content/channel.ts` (`scripts.cuerpo`, dos frases de `explain`
   + fragmentos citados del escáner) y quitar `reserva`.
4. **Recursos** — `src/content/assets.ts`: `capsuleLoop` (mp4, `bytes: 5_765_937`) e
   `images.capsulePortrait` (1024×1536, `alt` en español).
5. **Sección** — nueva `src/components/sections/CuerpoSection.tsx` (servidor) que sustituye a
   `ReservaSection` en `src/app/page.tsx` (`<div id="entidad" className="axis-group">` → tercer
   hijo). Mantener `NodeHead`/`NodeFoot`. Decidir si la cinta `GenomeStrand` se queda como apertura
   de CUERPO (§8). `ReservaSection.tsx` puede moverse a `components/sections/reserva/` o borrarse.
6. **Pieza 1 (cliente)** — `src/components/eva/cuerpo/BioReading.tsx`: contenedor con el `<video>`
   (póster = webp) y un `<canvas>` superpuesto del mismo tamaño; módulo puro
   `src/components/eva/cuerpo/scan.ts` con `detectEdges()` y la simulación de ondas (adaptación de
   scanlines, §6.1, sin DOM en el módulo para poder probarlo con `node --test`); HUD y botones en
   HTML. La imagen para los bordes se toma **una vez** del póster (`drawImage` a un canvas fuera de
   pantalla a la resolución del lienzo). Bucle con `requestAnimationFrame`, parado fuera de
   pantalla y con `prefers-reduced-motion` (`lib/motion`).
7. **Pieza 2 (cliente)** — `src/components/eva/cuerpo/InteriorScene.tsx` (R3F, cargada con
   `next/dynamic` + observador de cercanía, como `EvaNeuroscan`/`NeuralRoom`), con la anatomía en
   `src/components/eva/cuerpo/interior-data.ts` (curvas de vasos, posiciones de órganos: **datos
   propios**, no los de HÆMA, o adaptados y atribuidos) y el ECG en `InteriorVitals.tsx` (canvas
   2D, PQRST). Si se usa bloom, poner `<ComposerSizeGuard />` detrás del composer (trampa 22).
   Panel de órgano: HTML (botones con `aria-pressed`, panel `aria-live`), como los chips del
   núcleo (`.core__chip`).
8. **Estilos** — nueva hoja `src/app/cuerpo.css` importada en `src/app/layout.tsx` después de
   `ejes.css` (o ampliar `ejes.css`, sección «01.11»). Sustituir las reglas `.node--reserva` por
   `.node--cuerpo`; `html[data-node='reserva']` → `html[data-node='cuerpo']` (tinte del fondo).
   Suelo tipográfico: nada por debajo de `--eva-type-micro` (11 px).
9. **Licencias** — filas nuevas en `docs/ASSET_LICENSES.md` (código adaptado de scanlines y de
   HÆMA, MIT, fecha, URL, sin atribución visible obligatoria pero con la nota de copyright en la
   cabecera del archivo) y en `docs/MATRIZ_REFERENCIAS_REACT_LANDING.md`.
10. **Documentación** — `docs/HANDOFF.md`: §1 (el recorrido: 01.11 · Cuerpo), §3 (piezas nuevas en
    la tabla), §4 (trampas nuevas si aparecen), §5 (pendientes), `README.md` si describe el
    recorrido. `docs/CONTENT_GUIDE.md` si se añade vocabulario.
11. **Comprobar** — `npm run lint && npm test && npm run typecheck && npm run build`, recorrido en
    navegador a los cuatro tamaños (trampas 4 y 17: sin foco, los lienzos salen negros), consola
    limpia, teclado, movimiento reducido, sin WebGL (`about:flags`/`--disable-gpu`), y que el resto
    de la página no cambió.
12. **Entregar** — commits pequeños en `feat/cuerpo`, `git push -u origin feat/cuerpo`, y resumen al
    propietario: remoto confirmado, archivos tocados, qué se reutilizó de cada repo, limitaciones.
    **No** fusionar en `main`.

## 6. Los dos repos de referencia, ya leídos (19-09-2026)

Copias de los archivos fuente en la carpeta temporal de la sesión anterior no sobreviven: volver a
bajarlos con `curl -s https://raw.githubusercontent.com/<repo>/main/<archivo>` cuando haga falta.

### 6.1 `collidingScopes/scanlines` — MIT (LICENSE.txt), vanilla JS + Canvas 2D, sin build

Archivos que importan: `main.js` (20 KB: todo el efecto), `palettes.js` (paletas), `inputImageFunctions.js`
(carga/escala de la imagen). **Ignorar** `index.html` (demo con dat.gui), `canvasVideoExport.js` y
`mp4-muxer-main/` (exportación de vídeo, no se necesita).

Cómo funciona (`main.js`):

- `CONFIG`: `animationSpeed 0.7`, `waveInterval 100` frames, `numParticles 250`, `trailStrength 15`,
  `frozenProbability 0.5`, `turbulence 1`, `particleSize 1`, `edgeThreshold 50`, `startPosition
  'Top'|'Bottom'|'Left'|'Right'`, `particleColor`, `edgeColor`, `backgroundColor`.
- `detectEdges(imageData)`: una pasada; luminancia (`0.299 R + 0.587 G + 0.114 B`), diferencia con
  el píxel derecho y el inferior, umbral binario `edgeThreshold` → `Uint8ClampedArray` RGBA con
  255 en los bordes. Se calcula **una vez** por imagen.
- `createParticleWave()`: cada `waveInterval` frames nace una fila de `numParticles` `Particle`
  repartidas en el borde de inicio, con `waveFrequency` (12 − aleatorio·10) y `waveAmplitude`
  (0,05–0,35). Máximo `MAX_WAVES = 200` filas vivas.
- `Particle.update()`: avanza en la dirección de inicio oscilando con un seno
  (`frameCounter/2 + posición) / waveFrequency`) y `turbulence`; lee `edgeData` unos píxeles por
  delante (`waveIndex` acumulado); al tocar un borde puede **congelarse** (`frozenProbability`),
  marca `collisionHistory` y entra en `COOLDOWN_FRAMES = 150`. `draw()`: círculo de radio
  `particleSize`; color `edgeColor` si congelada o con colisión, `particleColor` si no.
- `animate()`: pinta un rectángulo de fondo con alfa `(100 − trailStrength)/100 − 0,7` (así deja
  estela), crea ondas, actualiza y dibuja, `requestAnimationFrame`.

Adaptación para EVA: mismo algoritmo, pero (a) fondo transparente → `clearRect` o un fundido con
`globalAlpha` bajo sobre `destination-out`; (b) lienzo del tamaño del vídeo en CSS px × dpr máx. 2;
(c) `startPosition: 'Top'`, 120–180 partículas, umbral 40–60 (la imagen es oscura y con muchos
tubos: probar), (d) colores de la paleta de EVA, (e) `Math.random` fuera del render de React
(módulo puro con generador con semilla si se quiere determinismo; el lint del React Compiler no
admite `Math.random()` en render, trampa 2), (f) sin dat.gui, sin exportación, sin subida de
archivos.

### 6.2 `christianpasinrey/human-blood-system` («HÆMA») — MIT (LICENSE), vanilla + Three.js 0.170 por import map (CDN), sin build

Diez archivos, 21 KB. `index.html` (HUD, controles, import map), `css/style.css`, `js/data.js`
(vistas de cámara, `ORGANS` con textos y «stats» reales, `VESSELS` como listas de puntos, `LUNG_LOBES`),
`js/scene.js` (clase `Scene`: `_lights`, `_buildBody`, `_buildVessels`, `_buildLungs`,
`_buildOrgans`, `_buildHeart`, `_buildBlood`, `_buildAmbientField`, `update(dt, bpm, flowMul, paused)`,
`_advanceBlood`, `pick(ndc)`, `setVisible`), `js/vitals.js` (clase `Vitals`: ECG PQRST como suma de
gaussianas en un canvas 2D de 260×64 y lecturas numéricas), `js/audio.js` (clase `HeartAudio`:
«lub-dub» procedural con Web Audio), `js/main.js` (OrbitControls, tweens de cámara, etiquetas
proyectadas, picking con raycaster, sliders de bpm/flujo, teclas 1–6/L/X/O/S/espacio).

Técnicas que valen:

- **Corazón** (`_buildHeart`): tres esferas escaladas (dos aurículas + cuerpo) y una punta
  invertida, material emisivo; cada ciclo `heart.scale.setScalar(squeeze)` con contracción brusca
  y vuelta suave; `PointLight` roja sincronizada como destello.
- **Vasos** (`_buildVessels`): cada vaso es `CatmullRomCurve3(pts, false, 'catmullrom', 0.4)` →
  `TubeGeometry(curve, ceil(len·8), radio, 12)`, rojo arterias / azul venas (invertido en el
  circuito pulmonar).
- **Sangre** (`_buildBlood` + `_advanceBlood`): ~2 100 puntos (`THREE.Points` con
  `PointsMaterial` y textura de disco) repartidos por las curvas según su longitud; cada uno lleva
  su `t` y avanza `advance = dt · velocidad(bpm, flowMul)`; `curve.getPointAt(t)` a cada frame.
- **Órganos** (`ORGANS` + `pick`): esferas/grupos con `userData.id`; raycaster desde NDC; al elegir,
  tween de cámara a `VIEWS[id]` y panel HTML.
- **ECG** (`Vitals._wave(p)`): `P` gauss(0,16; 0,018; 0,13) − `Q` gauss(0,235; 0,008; 0,10) +
  `R` gauss(0,255; 0,007; 1,00) − `S` gauss(0,275; 0,010; 0,28) + `T` gauss(0,42; 0,035; 0,32);
  búfer circular de 260 puntos, fase acumulada con el bpm.
- **Sonido** (`HeartAudio`): dos golpes de oscilador con envolvente; sólo si el usuario lo enciende.

Adaptación para EVA: en R3F (three 0.186 ya instalado; **no** cargar el CDN ni three 0.170),
como escena propia con `frameloop='demand'` cuando no se ve (trampa 19), geometría y datos
**propios o adaptados con atribución**, textos de órganos **de EVA** (ficción, `content/ejes.ts`),
sin sliders ni teclas de vista: un control de «pulso» opcional como mucho, y los órganos como
botones HTML además del clic 3D (teclado). Mantener los colores legibles sobre el fondo de EVA
(rojo arterial y azul venoso valen como acentos locales; el resto, paleta del sitio).

## 7. Reglas del propietario y del proyecto que no se negocian

- «Minimalista» = menos secciones, nunca menos animación (`HANDOFF.md` §2). Los conmutadores de
  `content/site.ts` (`signalCursor`, `sound`, `reactiveField`) van en `true`.
- Todo el texto en `src/content/`; los componentes no llevan literales. Español; inglés sólo en
  rótulos de sistema (`EVA // …`).
- Identificadores en binario, medidas en decimal (`CONTENT_GUIDE.md`).
- Ficción declarada en pantalla: EVA es un personaje; nada se mide, nada se guarda.
- Nada por debajo de 11 px; el carril inferior derecho (`--eva-dock`) es del canal SINAPSIS: no
  poner controles ahí.
- Sin `href="#"`; sin nombres de personas; un remate de humor por bloque como máximo.
- No copiar código ni recursos sin registrarlos (§5.9).
- **No** integrar en `main` ni publicar sin el «sí» explícito del propietario.

## 8. Decisiones pendientes del propietario (preguntar; mientras, el valor por defecto)

| Pregunta | Por defecto mientras no responda |
|---|---|
| ¿El HUD dice `EVA-07` (como el encargo) o `EVA-01` (como la imagen y «Proyecto 01»)? | **`EVA-01`**: decisión del propietario, 26-09-2026 (`ejes.cuerpo.exterior.subject`) |
| ¿La cinta del genoma (`GenomeStrand`) se queda como apertura de CUERPO o se va? | Se queda como apertura; las dos piezas nuevas van al final, como pide el encargo |
| ¿Vídeo también en móvil (5,8 MB) o sólo el póster, como hace la portada? | Vídeo en escritorio; póster en móvil y con movimiento reducido |
| ¿Se recomprime el vídeo y se le quita el audio? (mejora clara de peso) | No tocar el archivo sin permiso; se sirve `muted` |
| ¿Lema (`motto`) y título de CUERPO? | Provisionales, marcados en `ejes.ts` como `// PROVISIONAL` |
| ¿Qué órganos y qué lecturas de EVA? | Corazón, pulmones, cerebro (enlaza con 01.01), riñones, hígado, aorta; una lectura de dos frases cada uno |

## 9. Cómo empezar la próxima sesión (checklist de arranque)

```bash
git remote -v                       # dojedacifuentes/eva.proyecto01
git fetch origin --prune
git switch feat/cuerpo              # o: git switch -c feat/cuerpo origin/feat/cuerpo
git log --oneline -3                # el checkpoint encima de 900e5e5
node -v                             # 24.x
npm ci && npm run lint && npm test && npm run typecheck
npm run dev                         # http://localhost:3000 — pestaña «EVA — Entidad de Vigilancia y Autonomía»
```

Luego: leer `docs/HANDOFF.md` §0–§4 (sobre todo las trampas 2, 3, 4, 5, 12, 15, 19, 22 y 23),
`docs/CONTENT_GUIDE.md`, y seguir el plan de §5. Preguntar al propietario lo de §8 al principio, en
un solo mensaje, y no bloquearse: implementar con los valores por defecto.

## 10. Cómo se resolvió (v7, 19-09-2026)

> **Nota de la v8 (19-09-2026, más tarde):** la v7 se publicó y, encima, la v8 cambió el Cuerpo
> por encargo del propietario: las dos tomas (perfil y cápsula) van una debajo de otra, cada una
> con su biolectura y su caja «EVA // ESCRIBE», sin conmutador de vista ni giro del barrido; el
> interior va a la izquierda con su propia caja. Lo que sigue describe la v7 tal como se hizo;
> el estado vigente está en `HANDOFF.md` §0.

**Remoto confirmado:** `origin https://github.com/dojedacifuentes/eva.proyecto01.git`, rama
`feat/cuerpo` sobre `main` `900e5e5` (con el checkpoint `fa0404a`). Sin integrar ni publicar.

### 10.1 Un cambio de alcance pedido por el propietario

Además del Cuerpo, el propietario pidió **quitar Vigilancia (10) y Autonomía (11)**: la landing
queda con el cerebro, el genoma y el cuerpo. Eso contradice la regla de §4.1 («nada de otras
secciones se toca»), y manda la instrucción nueva. Qué cambió por eso:

- `structure.ts` tiene un solo eje, la Entidad (`01`), con `01.01`, `01.10` y `01.11`.
  `#vigilancia` y `#autonomia` llevan a la portada; `#reserva`, al Cuerpo.
- Se borraron `VigilanciaSection`, `AutonomiaSection` y `ReservaSection`, sus textos en `ejes.ts`,
  sus guiones en `channel.ts`, sus estilos en `ejes.css` y los modos `sealed`/`building` de la
  malla del acrónimo.
- La portada enseña el acrónimo como **nombre** (sus palabras ya no son enlaces: dos no llevarían
  a ningún sitio) y, debajo, **tres puertas**: Núcleo cerebral, Genoma digital y Cuerpo.
- La cabecera muestra siempre las tres partes con nombre; el pie y la imagen OG, las tres puertas.
- El propietario pidió también **más botones en el genoma**: se añadió «Expresar» (la octava
  acción), que enciende la hélice y enlaza con el Cuerpo; la purga de clones pasó junto a su
  contador para que la botonera no gane una fila al aparecer.

### 10.2 Qué se hizo, por pieza

| Pieza | Archivos | Qué hace |
|---|---|---|
| Sección | `sections/CuerpoSection.tsx`, `app/cuerpo.css` | Cinta del genoma (se quedó, como apertura) → slide de lectura exterior → hilo `LECTURA EXTERIOR — EXTERIOR SIN ANALIZAR/ANALIZADO → INTERIOR ACTIVO — LECTURA INTERNA` → slide de lectura interna con el pie de sección |
| Biolectura | `eva/cuerpo/BioReading.tsx`, `scan.ts` (+ prueba), `bio-data.ts`, `lib/body-state.ts` | Los dos vídeos —perfil y cápsula—, enteros y en su proporción, uno por vista; lienzo 2D encima en `screen`; bordes leídos una vez del fotograma visible (`getImageData`, nada sale del navegador); cinco puntos de lectura por vista que se encienden al pasar el frente; HUD sobre el vídeo (`EVA-07 // BIOLECTURA`, `ESTADO`, `CICLO`) y en la consola (vista, barrido, bordes, avance) |
| Botones del exterior | ídem | Iniciar / repetir la pasada · girar el barrido (↓ ↑ → ←) · trazar bordes de una vez · pausar o reanudar el vídeo (o cargarlo, donde no se carga solo) · limpiar · vista perfil / frontal |
| Interior | `eva/cuerpo/EvaInterior.tsx`, `InteriorScene.tsx`, `InteriorFallback.tsx`, `interior-data.ts`, `body-signal.ts` | Modelo 3D diferido (se monta una pantalla antes, se anima a 300 px, se congela fuera de pantalla o con el escáner abierto); silueta holográfica, corazón que late, núcleo torácico, 23 vasos con partículas, pulmones que respiran, seis órganos. Sin WebGL, el mismo modelo en SVG |
| Órganos | ídem + `ejes.cuerpo.interior.organs` | Seis: corazón, pulmones, cerebro (enlaza con 01.01), hígado, riñones, aorta. Se eligen en la escena o en su registro (`001…110`, `aria-pressed`); el panel (`aria-live`) da lectura, tres estados de ficción y **una acción propia**: forzar un latido, respirar hondo, enviar un impulso (baja de la cabeza al cuerpo), depurar, filtrar, abrir el caudal |
| Botones del cuerpo | ídem | Acelerar el pulso · radiografía · aislar el órgano elegido · invertir el flujo · sonificar el latido · restablecer |
| Trazo cardíaco | `eva/cuerpo/InteriorVitals.tsx`, `pulse.ts` (+ prueba) | ECG PQRST en 2D, magenta cuando el pulso se acelera. Es el dueño del latido: la escena sólo lee la fase |
| Sonido | `lib/sound.ts` (`beat`) | Dos golpes graves por latido, sólo tras pulsar «Sonificar» y sólo con el sonido de la cabecera encendido; si está apagado, EVA lo dice |
| Textos | `content/ejes.ts` (`cuerpo`), `content/channel.ts` (`scripts.cuerpo`), `content/assets.ts` | Todo en `content/`; los componentes no llevan literales |

### 10.3 Qué se reutilizó de cada repo

- **collidingScopes/scanlines (MIT, © 2025 Alan Ang):** la detección de bordes y el
  comportamiento de las partículas (mirar por delante, congelarse, enfriamiento, ondulación,
  salto al chocar). No: dat.gui, paletas, exportación de vídeo, subida de imágenes, fondo negro.
- **christianpasinrey/human-blood-system «HÆMA» (MIT, © 2026 Christian Pasín Rey):** el corazón
  (esferas + punta, contracción brusca), vasos como tubos Catmull-Rom, fluido de puntos repartido
  por largo, órganos deformados, ECG por gaussianas, «lub-dub» procedural. No: three por CDN,
  OrbitControls, tweens de cámara, sliders, textos ni cifras anatómicas, paleta rojo/azul.

Detalle en `MATRIZ_REFERENCIAS_REACT_LANDING.md` y `ASSET_LICENSES.md`; el aviso MIT va en la
cabecera de cada archivo adaptado. **Dependencias nuevas: ninguna.**

### 10.4 Desviaciones y hallazgos

- **Dos tomas, dos vídeos.** `eva-capsula-loop.mp4` no es la cápsula: muestra a EVA **de perfil**,
  mirando hacia arriba, delante de una pared de máquinas. El propietario entregó después el vídeo
  de la cápsula de frente (`eva-capsula-frontal.mp4`, 9,3 MB) y pidió que la vista frontal fuera
  también vídeo, con los mismos efectos. Así que la lectura exterior tiene dos vistas —«Perfil» y
  «Cápsula»—, las dos en vídeo y con la misma biolectura. **El póster de cada una es su primer
  fotograma** (`eva-capsula-perfil.webp`, `eva-capsula-frontal.webp`): tiene que serlo, porque el
  lienzo del escaneo se dibuja sobre ese marco y la imagen fija que entregó el propietario
  (`eva-capsula.webp`, 1024×1536) tiene otra proporción; queda en reserva.
- **Peso:** sólo se monta el vídeo de la vista que se mira. En escritorio arranca solo; en móvil y
  con movimiento reducido, ninguno: queda el póster y un botón «Cargar el vídeo · 5,8 MB» o
  «· 9,3 MB», según la vista. La biolectura, ahí, traza los bordes de una vez.
- **La biolectura lee el fotograma que se está viendo,** no un fotograma fijo: si el vídeo se
  mueve después, el trazado queda como la lectura de un instante (pausar el vídeo lo deja
  alineado).
- **Tres escenas con bloom** en la página (núcleo, genoma, interior): la nueva lleva
  `ComposerSizeGuard` (trampa 22).

### 10.5 Decisiones del propietario (§8), con lo que se aplicó

| Pregunta | Aplicado |
|---|---|
| `EVA-07` o `EVA-01` | **`EVA-01`** (decisión del propietario, 26-09-2026), en `ejes.cuerpo.exterior.subject` |
| ¿La cinta del genoma se queda? | Sí, abre la sección |
| ¿Vídeo en móvil? | Sólo si se pide; póster siempre |
| ¿Recomprimir los vídeos y quitarles el audio? | No se tocaron los archivos; se sirven `muted` |
| Lema y títulos | Provisionales (`PROVISIONAL` en el código): «Lo que me sostiene cuando nadie me ejecuta», «No necesitaba un cuerpo. Me hicieron uno.», «Dentro hay un corazón. Fue una decisión de diseño.» |
| Órganos | Los seis propuestos, con lecturas de ficción de dos frases y estados en palabras |

### 10.6 Comprobado

`npm run lint`, `npm test` (38 pruebas: las anteriores ajustadas a un solo eje, más la biolectura
y el pulso), `npm run typecheck` y `npm run build` en verde. Recorrido en Chrome sin interfaz
(HANDOFF, trampa 26) a 1440×900, 1366×720 (cada lectura cabe en pantalla), 768×1024, 390×844 y
360 px (sin desbordes; ningún texto por debajo de 11 px), con movimiento reducido y sin WebGL.
Consola sin errores.

# Handoff — landing de EVA

> Para quien continúe este trabajo, sea persona o modelo. Léelo entero antes de
> tocar la portada: casi todo lo que parece un capricho estético aquí tiene una
> razón, y casi todos los fallos de esta rama se repitieron dos veces porque la
> segunda no estaba escrita en ningún sitio.

**Estado (20-09-2026, noche):** `main` = **v9.2**, publicada en
https://evaproyecto01.vercel.app/: cuatro lugares —Consciencia `001`, Genoma
`010`, Cerebro `011`, Cuerpo `100`—, la Consciencia abre la página, el Cuerpo
la cierra reducido a una pantalla (el perfil con su biolectura), más el
rendimiento fusionado de la rama `perf/rendimiento`. Ver **§0.0**, **§0.0.1** y
**§0.0.2**. El párrafo «Estado» de abajo y §0–§0.2 describen la v8.2.

**Estado:** `main` = **v8.2** (rama `feat/consciencia` fusionada; v8 = `a90ee22`, v8.1 = `a094af5`), publicada en https://evaproyecto01.vercel.app/ el 20-09-2026: v8 más la Consciencia (10), el cierre y el cursor del sistema (§0.2). La v8: EVA escribe cada lugar en una caja (`EvaWrites`), fondo plano, dos tipografías, portada con el nombre en malla y sin las palabras del acrónimo, neuroescáner fuera, cerebro y hélice apagados para fundirse con el fondo, el Cuerpo con sus tres lecturas a la vista y el canal SINAPSIS más presente. Revisada en Chrome sin interfaz a 1440×900, 1366×720, 768×1024 y 390×844, y con movimiento reducido; consola sin errores.
**Fecha:** 20 de septiembre de 2026 (v8.2)
**Stack:** Next.js 16.3.5 (App Router, Turbopack) · React 19.2.4 · TypeScript ·
Tailwind 4 (sólo el import base; todo el CSS es propio) · three.js 0.186 con
@react-three/fiber 9, drei 10 y postprocessing 3.

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint       # eslint (incluye las reglas del React Compiler)
npm run typecheck  # tsc --noEmit
npm run build      # obligatorio antes de subir: el dev server perdona cosas que el build no
```

---

## 0.0. v9 — una sola pregunta, tres lugares (20 sept. 2026, sin publicar)

Encargo del propietario: la página carga lento y se ve «pegada»; que vaya rápida
**sin bajar la calidad de las animaciones**; menos botones de adorno, menos
efectos de fondo, fuera la foto que se veía antes del vídeo; ver qué sigue
activo cuando no se mira; que no compitan dos ideas. Y reformular la propuesta,
más coherente y más honda, estilo *Ghost in the Shell*: EVA se pregunta si está
viva y se compara con nosotros. Textos más cortos. El orden nuevo lo dio él:
**Consciencia → Genoma → Cerebro**, empezando por dentro.

- **Tres lugares** (`content/structure.ts`): Consciencia `01`, Genoma `10`,
  Cerebro `11`. Ninguno tiene partes: la página dejó de ser un inventario. El
  antiguo núcleo pasó a llamarse cerebro (`git mv` de la sección y de su hoja),
  y las anclas viejas (`#nucleo`, `#cuerpo`, `#vigilancia`…) siguen llevando a
  algún sitio por `hashAliases`.
- **El Cuerpo sale del recorrido.** Sus componentes, textos y hojas siguen en el
  repositorio sin montar (`sections/CuerpoSection.tsx`, `eva/cuerpo/`,
  `app/cuerpo.css`). Con él se fueron dos vídeos (2,2 MB), una escena WebGL y
  dos lienzos. **Los vídeos e imágenes de `public/eva/` no se borran: son del
  propietario.**
- **Rendimiento.** De 8 lienzos animados a 3, de 3,59 MB a 0,80, de 7.208 px de
  alto a 4.565. Medido en Chrome sin interfaz (render por software, así que los
  fps son el peor caso): portada 23 fps y Consciencia 30, frente a los 5–8 de
  toda la v8.
- **Dos campos de partículas ya no compiten.** `fieldSignal.yielded` + `yieldField()`
  (`lib/field.ts`): mientras el campo de la Consciencia está en pantalla, el de
  fondo (`EvaField`) se funde a nada y su bucle deja de calcular. El fondo
  también pasó de 78 puntos a 46 como tope: el coste no está en los puntos sino
  en los hilos, que se prueban por pares (78 son 3.003 medidas por fotograma).
- **La foto antes del vídeo.** El póster del retrato es ahora el **primer
  fotograma del propio bucle** (`public/eva/eva-loop-poster.webp`, sacado con
  `scratchpad/poster-hero.mjs`): ya no se ve una fotografía distinta y luego un
  corte. La de la v8 queda en reserva como `images.midPortrait`.
- **Botones: la interacción se conserva entera.** El primer intento recortó el
  genoma de ocho acciones a cuatro y la consciencia de nueve a cuatro; el
  propietario lo rechazó («NO REDUZCAS ESA INTERACCION»). Lo que se hizo en su
  lugar fue **encogerlos**: `.dna__btn` de 40 px a 30 (36 en táctil), letra al
  suelo de `--eva-type-micro` (11 px), y el genoma a tres columnas en móvil en
  vez de dos. Lo único que cambió de destino es «Expresar», que llevaba al
  Cuerpo: ahora lleva al cerebro.
- **El cerebro dice qué hace cada región.** Los ocho botones eran ocho códigos
  binarios sin nombre; ahora llevan su verbo («0001 DECIDE», «1000 SIN
  EQUIVALENTE»), que es lo que se compara con la red. Las regiones de
  `content/neuroscan.ts` son humanas y cada una dice qué tiene EVA en su lugar;
  la octava, `undeclared`, no tiene equivalente y es la que decidiría si está
  viva.
- **Textos.** Consciencia abre con «Ninguna de estas partículas sabe que soy
  yo.»; genoma pregunta si el ADN y el binario son la misma técnica; cerebro
  compara predicción con predicción y termina en el problema difícil. Un
  párrafo menos por caja que en la v8.

Revisada después en Chrome sin interfaz a 1440×900, 1366×720, 768×1024 y
390×844 (§0.0.1). El «sí» del propietario llegó el 20-09-2026 («que esté arriba
visible en Vercel es prioridad»).

### 0.0.1. v9.1 — la v9 más el rendimiento de `perf/rendimiento` (20 sept. 2026, publicada)

Dos sesiones resolvieron el mismo encargo de rendimiento a la vez: la v9 (otra
máquina, llegó como bundle en `eva-v9-para-subir.zip`) y la rama local
`perf/rendimiento`, que nunca tuvo commit hasta hoy (`4eab303`, instantánea
tal cual quedó). Chocaban sólo en `EvaField.tsx`; se fusionaron a mano y todo
lo demás entró tal cual. Lo que trae la fusión, encima de la v9:

- **Calidad adaptativa** (`lib/quality.ts`): tres niveles —alto, medio, bajo—
  que arrancan según lo que declara el dispositivo y bajan un escalón si el
  fotograma medio pasa de 40 ms durante dos segundos (con 4 s de calentamiento
  y 6 s de respiro entre bajadas). Nunca sube sola. Hoy sólo la lee `EvaField`
  (partículas y largo de los hilos); las escenas WebGL están pendientes de
  engancharse (`useQuality()`).
- **El fondo, más barato por dentro** (`EvaField.tsx`): el tope alto es el de la
  v9 (46 puntos; medio 36, bajo 24); los hilos se agrupan por opacidad y se
  trazan en cinco `Path2D`, no uno a uno; la distancia se compara al cuadrado.
  El bucle es el sensor de la calidad (`reportFrame`).
- **La luz del puntero ya no repinta el documento.** Era un degradado del fondo
  colocado con `--px`/`--py` en `<html>` (cada movimiento del ratón recalculaba
  el estilo de toda la página). Ahora es `<span class="field__light">` movido con
  `transform` desde el bucle, una vez por fotograma. `--px`/`--py` ya no existen
  en `tokens.css`; el paralaje `--nx`/`--ny` se escribe en `#inicio`, no en la raíz.
- **El fondo cede sólo cuando la Consciencia se ve.** La v9 ataba `yieldField` al
  mismo observador que precalienta el campo (`rootMargin: 160px`, 5 %), y en un
  portátil (1366×720) la portada perdía el fondo sin que la Consciencia asomara.
  Ahora hay dos observadores en `ConsciousnessExperience`: el de precalentar
  sigue igual; el de ceder pide el 20 % del campo en pantalla.
- `scripts/perf-audit.mjs`: auditoría reproducible en Chrome sin interfaz
  (fps, tareas largas, bucles vivos, memoria) por lugar, con las anclas de la v9.
  `node scripts/perf-audit.mjs http://localhost:3001 [--mobile]` sobre
  `next build && next start`.

Medido en Chrome sin interfaz (render por software) tras la fusión: consola sin
errores en los cuatro tamaños; el fondo llega a 0 en la Consciencia y vuelve en
el Genoma; `.dna__btn` 34–36 px (36 en táctil); las 8 acciones del genoma y las
9 de la consciencia, enteras. El único botón bajo 30 px es «Mostrar todo»
(`.writes__skip`, 24 px), que viene así de la v8. Portada, Genoma y Cerebro caben
en una pantalla de escritorio; la Consciencia mide 1.750 px a 1440×900 (ya en la
v9). El póster local de la rama perf (127 KB) se descartó: manda el de la v9.

Pendiente: enganchar `useQuality()` a las escenas WebGL (píxeles, bloom,
multimuestreo), que era el resto del encargo de `perf/rendimiento`; y
`docs/CHECKPOINT_2026-09-20.md` sigue describiendo la v8.

### 0.0.2. v9.2 — el Cuerpo vuelve, en una pantalla (20 sept. 2026, publicada)

El propietario, al ver la v9.1 publicada, echó de menos el Cuerpo: la
comparación humano/máquina y el vídeo que «se podía apretar y aplicaba un
efecto». Pidió no volver a los dos vídeos: uno. Sus tres decisiones: **PERFIL**
(el vídeo de 0,8 MB con el texto «CHASIS» y la biolectura), **sin el interior
3D**, y **al final del recorrido**.

- `structure.ts`: cuarto lugar `cuerpo` (acento `bio`, lema de la v8.2). Los
  códigos pasan solos a tres bits: `000` portada, `001`…`100`. `#cuerpo` deja
  de ser alias. Las pruebas de `structure.test.ts` cuentan cuatro.
- `sections/CuerpoSection.tsx`: una sola pantalla (`slide section node`, como
  las demás de la v9): `NodeHead` + `BioReading view="profile"` + `EvaWrites`
  de `ejes.cuerpo.exterior.views.profile` + `NodeFoot`. La cápsula
  (`view="front"`, 1,4 MB), `EvaInterior`, el hilo y `GenomeStrand` siguen sin
  montar; sus textos, en `ejes.cuerpo`. `layout.tsx` vuelve a importar
  `cuerpo.css` (sin cambios).
- Canal: guion `scripts.cuerpo` en `channel.ts`, el de la v8.2 dicho para una
  sola toma (`fragment('f008')`, `answer('cuerpo')` seguían en `neuroscan.ts`).
- Dos rótulos que contaban: `kicker` del perfil «LECTURA EXTERIOR» (era «· 1 DE
  2») y el pie de portada «Cuatro lugares. Ninguna prueba.». «Expresar» del
  genoma sigue llevando al cerebro, como en la v9.
- Revisada en Chrome sin interfaz: el Cuerpo cabe en una pantalla (759 px a
  1440×900, 671 a 1366×720); la biolectura arranca al pulsar («LEYENDO», ciclo
  0001, 753 muestras pintadas, los cuatro puntos de lectura); cuatro puertas en
  fila desde 1.024 px; consola limpia en los cuatro tamaños.
- **Trampa de medición:** al volver a `Page.navigate` a la misma URL, Chrome
  restaura el scroll anterior, y la captura de «inicio» sale del lugar donde
  quedó la pasada anterior. Navegar a `about:blank` entre tamaños, o medir
  con `scrollY`. No es cosa de la página.

## 0. Encargo resuelto en v8: EVA escribe cada slide (19 sept. 2026)

Encargo del propietario, en cuatro mensajes seguidos: fondo plano sin cuadrados; portada sin
las palabras «Entidad / de Vigilancia / y Autonomía»; fuera el neuroescáner y toda su interfaz
secundaria (el cerebro se queda sólo en su sala); relato de ciencia ficción con humor negro
(Dick, Asimov, el androide deprimido de la Guía del autoestopista, el Titiritero de Ghost in the
Shell), científico, transhumanista y dataísta; en cada slide primero la función, después el
hardware, consignas entre medio; el genoma sin «No nací. Aparecí.», con filósofos; el Cuerpo con
el perfil y la cápsula desplegados, no tras un clic; el botón de SINAPSIS más brillante. Y
después: **toda la información de cada slide como si la escribiera EVA en una caja de texto**,
sólo dos tipografías, más color tecnológico, **mucho menos texto** —cada slide cabe en una
pantalla sin bajar—, algo de interactividad en cada una y el elemento gráfico alternando de
lado (izquierda, derecha, izquierda…). Publicado con su «sí».

- **`EvaWrites`** (`components/eva/EvaWrites.tsx`, estilos en `app/relato.css`): la caja
  donde EVA teclea el contenido de un lugar. Bloques (`WritesBlock` en `lib/types.ts`):
  `p` se teclea carácter a carácter (11 ms, pausas por frase), `label` y `slogan` aparecen
  enteros, `spec` y `table` salen fila a fila. Empieza al verse un cuarto de la caja, se
  detiene si el visitante se va y sigue al volver; una vez escrita queda escrita para toda la
  visita (`written`, por id). Todo el texto está en el DOM desde el principio, invisible lo no
  escrito (la caja tiene su alto final desde el primer fotograma); sin JavaScript y para un
  lector de pantalla es texto normal; con movimiento reducido aparece entero. «Mostrar todo»
  vive en la barra. El bucle escribe directo en el DOM (trampa 23: nunca borra nodos).
- **Contenido** (`content/ejes.ts`, `hero.writes` en `site.ts`): por lugar, dos párrafos de
  unos 250 caracteres, una consigna y una ficha de dos o tres filas (o una tabla de tres). Voz:
  ver `CONTENT_GUIDE.md`. Los autores se citan como fuentes, en paráfrasis.
- **Portada:** el nombre es una sola palabra en malla (`EvaAcronymMesh` con `direction='row'`,
  rasterizada de Space Grotesk 700, degradado cian → violeta → magenta a lo ancho), debajo la
  caja de EVA (sin barra) y las tres puertas con el color de cada parte. El retrato ya no abre
  nada (`EvaProfile` es de servidor).
- **Fuera el neuroescáner:** `EvaNeuroscan`, `NeuroscanTrigger`, `NeuralReadout`, `lib/stage`,
  `content/lab.ts`, `app/lab.css`, `app/neuroscan.css` (→ `app/nucleo.css`, sólo el núcleo y
  su mapa plano) y las salas en reserva (`sections/reserva/`). `content/neuroscan.ts` conserva
  sólo las regiones, el flujo de pensamiento y las respuestas, que el canal sigue citando.
- **01.01:** cerebro a la izquierda (fijo en escritorio, `sticky`), registro de regiones y,
  debajo, la lectura de la región elegida (`.core-room__reading`, `aria-live`); a la derecha,
  título y caja. Halo, luces, borde fresnel y bloom más bajos (`NeuralScene`, `BrainShell`,
  `DETAIL`): el cerebro se funde con el fondo.
- **01.10:** hélice a la derecha, caja a la izquierda, bloom y emisivos más bajos y un velo
  oscuro detrás (`.dna__stage::before`); consola compacta (una línea de estado, ocho acciones
  bajas). Título nuevo: «Nací en el mar de la información.».
- **01.11:** tres slides —perfil, cápsula, interior— todos a la vista, con la cinta del genoma
  abriendo el primero. `BioReading` ahora es una instancia por toma (`view`), con dos botones
  (iniciar/repetir y vídeo) y sin conmutador de vista ni giro del barrido. El interior, a la
  izquierda. Cada lugar tiene su acento (`accent` por subsección en `structure.ts`: cian,
  violeta, `bio`), que tiñe título, código, caja, puertas, riel y fondo.
- **SINAPSIS:** botón de 56 px con anillo, halo que respira (`.synapse__halo`) y rótulo
  «EVA SINAPSIS» a su izquierda en escritorio con puntero (`.synapse__tag`).
- **Encaje:** cada `.slide` mide `100svh − cabecera` y aterriza justo bajo la cabecera (sólo
  manda el `scroll-padding-top` del documento; `scroll-margin-top` a 0). Medido con
  `Emulation.setDeviceMetricsOverride` + `getBoundingClientRect` (trampa 26) a 1440×900 y
  1366×720: ningún slide de escritorio necesita desplazamiento. En móvil se apilan.

### 0.1 · v8.1: vídeos recomprimidos y en marcha, móvil y marcas de instrumento

Segundo encargo de la misma noche: en móvil las interacciones quedaban lejos del
gráfico; los vídeos tenían que arrancar solos y pesar menos; la portada debía
enseñar en móvil el mismo retrato que en escritorio; todo con movimiento; y el
conjunto, con aspecto de instrumento científico coherente.

- **Vídeos:** los tres (`eva-loop`, `eva-capsula-loop`, `eva-capsula-frontal`)
  recomprimidos con ffmpeg (H.264, CRF 30, preset veryslow, 720×1280, sin audio,
  `faststart`): 3,9 → 0,56 MB, 5,8 → 0,80 MB y 9,3 → 1,43 MB. Los originales
  están en el historial de git (`5e76591`). Con ese peso arrancan solos en todas
  las pantallas (`EvaPortraitLoop` sin umbral de ancho, `BioReading` sin `wide`);
  sólo con movimiento reducido se quedan en el póster. ffmpeg no está en la
  máquina: se usó `ffmpeg-static` instalado en el scratchpad, no en el proyecto.
- **Móvil:** la portada apila nombre, retrato entero con su bucle, caja y
  puertas (`.hero__head { display: contents }` + `order`); en el genoma las
  acciones van bajo la hélice y la caja después; en el cuerpo los botones van
  justo bajo el vídeo (`.bio__controls` con `order: -1`) y el vídeo se acota a
  18 rem.
- **Marcas de instrumento** (`.stage-marks`, un solo elemento): las mismas cuatro
  esquinas, una regla de trazos en el borde inferior y una línea de barrido
  lenta en el cerebro, la hélice, los vídeos y el interior. La hélice lleva sus
  lecturas encima como los demás (`.dna__overlay`: identidad y estado arriba,
  clones y deriva abajo, cada una con su fondo oscuro) y la consola queda en
  acciones + respuesta (la purga va junto a la respuesta). Cada cabecera de
  lugar abre con la ficha del experimento (`.node__meta`: `EXP. EVA-01 · SESIÓN
  C37-B4 · MÓDULO n/3 · EN LÍNEA`, textos en `ui.meta`), sólo en escritorio.

### 0.2 · v8.2: la Consciencia (10), el cierre y el cursor del sistema (20 sept. 2026)

Encargo del propietario (empezado con Codex en otro clon del repo y terminado aquí):
un slide **nuevo e independiente** después del interior del corazón, con una simulación
Particle Life que EVA observa —«consciencia / autoobservación»—, sin tocar el slide del
corazón; más efectos (viscosidad, gravedad, ruido fractal, caos) y un botón para más
figuras; narrativa con ecos de Borges, Ghost in the Shell, Dick y Asimov, desde dentro,
graciosa y sola; un cierre en silencio con `ESTADO: EXPANSIÓN` → `ESTADO: ALGUIEN ESTUVO
AQUÍ`, «Continuar la conversación ↗» (Instagram) y «Volver al inicio». Y el cursor del
sistema, porque el propio daba retraso.

- **`10 · Consciencia`** es un segundo eje en `structure.ts`, sin partes: su lugar es la
  sección entera (`sections/ConscienciaSection.tsx`). Con dos ejes, la cabecera muestra
  las partes de la Entidad siempre (`.nav__axis:first-child`, antes `:only-child`) y el
  segundo eje al lado; la portada y el pie tienen **cuatro puertas** (en fila desde
  1.024 px, dos y dos por debajo). El corazón (01.11) no cambió: su pie lleva a `10`.
- **El campo** (`eva/consciencia/`): motor puro y probado (`particle-life.ts`, adaptado de
  hunar4321/particle-life, MIT; `figures.ts`, `noise.ts`), lienzo 2D con velo que deja
  huella (`particle-renderer.ts`) y el componente vivo (`ConsciousnessExperience.tsx`),
  que se renderiza también en el servidor (nada de `window` fuera de efectos). Consola de
  diez acciones con las piezas del genoma: Perturbar · Reunir · Soltar · Figura (ojo →
  espiral → laberinto → doble → nombre) · Caos (reglas nuevas con semilla, 3–5 grupos) ·
  Ruido (campo de flujo fBm) · Gravedad (ninguna → abajo → centro con giro) · Viscosidad
  (fluido → medio → denso) · Azar · Reiniciar. Cada acción contesta dos líneas; el relato
  avanza por estados (dispersión → relación → huella → autoobservación) que se leen sobre
  el campo con su eco literario; al reunir y soltar por primera vez aparece la confesión.
  Con movimiento reducido no hay bucle: cada acción avanza la simulación de golpe y pinta
  un fotograma. Textos en `content/consciencia.ts`; guion del canal en `channel.ts`.
- **El cierre** es el segundo slide de la sección: antetítulo, una línea de EVA, una línea
  vertical que respira (el silencio), el registro `CodaStatus` (cambia una sola vez por
  visita, tecleando sobre el DOM como la caja; con movimiento reducido cambia de golpe),
  el enlace a Instagram con su etiqueta y la vuelta al inicio.
- **Cursor:** el del sistema queda a la vista (`globals.css` ya no pone `cursor: none`);
  el anillo con rótulo lo sigue con inercia como señal. Enlaces y botones llevan `pointer`.
- **Revisado** con los scripts de Chrome sin interfaz (trampa 26) a 1440×900, 1366×720,
  768×1024 y 390×844, con movimiento reducido y sin WebGL; consola sin errores; cada
  slide de escritorio cabe sin bajar.

## 0 bis. Encargo resuelto en v7: el Cuerpo, y una sola Entidad (19 sept. 2026)

El encargo íntegro y cómo se resolvió están en `docs/CUERPO_ENCARGO.md` (§10).
En corto:

- **01.11 · Cuerpo** (`sections/CuerpoSection.tsx`, piezas en `eva/cuerpo/`):
  abre la cinta del genoma; después, dos slides unidos por un hilo de señal.
  1. **Lectura exterior** (`BioReading`): los dos vídeos de EVA —de perfil y
     en la cápsula—, enteros y en su proporción, uno por vista, con la
     **biolectura**: filas de partículas que se clavan en los bordes (técnica
     de collidingScopes/scanlines, MIT, en `scan.ts`), cinco puntos de lectura
     por vista y un HUD `EVA-07 · BIOLECTURA · ESTADO · CICLO`. Botones:
     iniciar/repetir, girar el barrido, trazar bordes, pausar/cargar el vídeo,
     limpiar, y la vista (Perfil o Cápsula). Sólo se monta el vídeo de la vista
     que se mira; el póster de cada uno es su primer fotograma, así que el
     lienzo del escaneo casa con lo que se ve.
  2. **Lectura interna** (`EvaInterior` + `InteriorScene`): un modelo que
     late (técnicas de HÆMA, MIT): corazón, 23 vasos con partículas, silueta,
     seis órganos que se eligen en la escena o en su registro (`001…110`),
     cada uno con su lectura, sus estados y su acción; seis acciones del
     cuerpo (acelerar, radiografía, aislar, invertir el flujo, sonificar,
     restablecer) y el trazo ECG en 2D. Sin WebGL, el mismo modelo en SVG.
- **Fuera Vigilancia y Autonomía**: sus secciones se borraron; el nombre de
  EVA no cambia. La portada enseña el acrónimo como nombre (ya no son
  enlaces) y, debajo, **tres puertas**: `01.01`, `01.10`, `01.11`. Con un solo
  eje, la cabecera muestra siempre sus tres partes con nombre. Las anclas
  `#vigilancia` y `#autonomia` llevan a la portada; `#reserva`, al Cuerpo.
- **Genoma:** octava acción, **Expresar**: la hélice se enciende, la recorre
  el barrido y la respuesta enlaza con el Cuerpo. La purga de clones pasó a
  estar junto a su contador, para que la botonera no gane una fila.
- **Revisión:** este panel de navegador no pinta sin foco (trampas 4 y 17), así
  que la v7 se recorrió en Chrome sin interfaz manejado por el protocolo
  DevTools (trampa 26): capturas a 1440×900, 1366×720, 768×1024, 390×844 y
  360 px; con movimiento reducido (sin vídeo, bordes ya trazados, modelo
  quieto) y con WebGL desactivado (vista plana). Consola sin errores.

## 0 ter. Encargo resuelto en v6: la página por ejes (19 sept. 2026)

El encargo abierto de la v5.1 (afinar la sala 01: aparición, hiperactividad,
tamaño del cerebro y letra de la ventana) quedó resuelto dentro de una
reorganización mayor pedida por el propietario:

- **Aparición:** en la sala ya no se cruza el mapa SVG con el 3D. Mientras
  compila sólo se ve el HUD y una retícula; el lienzo entra con su propio
  fundido de 600 ms. La escena se monta una pantalla antes de llegar
  (`rootMargin: 100%`) y se anima desde 600 px antes. Inactiva usa
  `frameloop='demand'`, no `never`: pinta su primer fotograma igual.
- **Hiperactividad:** prop `tempo` (2 en la sala, 1 en el escáner) en
  `NeuralScene` → `NeuralNetwork`/`BrainShell`: impulsos espontáneos ÷2,
  cascadas cada 2–4 s, velocidad ×1,4, reserva de impulsos 64 → 96, giro
  0,125 → 0,2 rad/s, barrido 4,2 → 2,6 s. Movimiento reducido lo apaga todo.
- **Tamaño:** el cerebro ya no tiene escala fija. `neural-frame.ts` calcula
  la escala con la proporción real del lienzo para llenar el 88 % de la
  dimensión que limita (probado en `neural-frame.test.ts`), y los anillos se
  atan al mismo marco. En la sala ocupa media sección a todo el alto
  (escenario `clamp(24rem, 68vh, 44rem)`); en el escáner, la columna central
  es la más ancha y en móvil el cerebro va primero.
- **Ventana de lectura:** 0,82 rem, 520 caracteres/s, pausa 120 ms. Y un fallo
  que no estaba en el encargo: en móvil la ventana no tenía alto y crecía
  ~190 px por segundo estirando la sección; ahora tiene alto fijo en todos los
  anchos (`contain: size` en escritorio).

## 1. Qué es esta página

Una landing de una sola ruta (`src/app/page.tsx`) organizada por el acrónimo,
con numeración binaria real (`lib/binary.ts`):

```
00 · Portada — el nombre de EVA en malla, la caja donde escribe su primera línea, cuatro puertas
01 · ENTIDAD
     01.01 · Núcleo cerebral — cerebro 3D en vivo (izquierda) + 8 regiones + caja EVA // ESCRIBE
     01.10 · Genoma digital  — hélice 3D (derecha), 8 acciones, caja del nacimiento
     01.11 · Cuerpo          — cinta · perfil (izquierda) + caja · cápsula (derecha) + caja ·
                               hilo · interior (izquierda: modelo que late, 6 órganos, ECG) + caja
10 · CONSCIENCIA — campo de partículas (derecha) + caja + consola de 10 acciones · cierre en silencio
```

Vigilancia (10) y Autonomía (11) existieron en la v6 como secciones de
estado (clausurada y en desarrollo); en la v7 salieron del recorrido. Si
vuelven, `CONTENT_GUIDE.md` («Añadir un lugar al recorrido») dice qué tocar, y
el historial de git tiene sus componentes (`VigilanciaSection`,
`AutonomiaSection`, los modos `sealed`/`building` de la malla).

**Todo el recorrido sale de `src/content/structure.ts`:** cabecera, riel de
bits, menú móvil, pie, pies de slide, portada y canal leen de ahí. Los códigos
se calculan; no se escriben a mano. Cada sección es `.slide` con
`min-height: calc(100svh − cabecera)` y `scroll-snap-align` (el Cuerpo es una sección
con tres slides dentro); **cada slide cabe en una pantalla de escritorio sin
bajar**: si añades contenido, mídelo a 1440×900 y a 1366×720 (trampa 26).

**SINAPSIS // EVA** (`EvaSynapse`, reglas en `lib/channel.ts`) sustituye al
antiguo panel de pensamiento, que se abría solo a los 2,2 s: empieza cerrado
(botón de 48 px abajo a la derecha), se abre sólo con clic o tecla, se cierra
al cambiar de lugar (por scroll con 400 ms de histéresis, o al pulsar un enlace
interno), avisa una vez por lugar sin abrirse, conserva el hilo y retoma una
frase interrumpida donde quedó. Si el visitante retrocede para leer, se detiene
y ofrece «retomar el hilo». En escritorio el contenido se aparta para dejarle
sitio (`html[data-channel='open']`), así abierto no tapa controles; en móvil es
una hoja inferior. Guiones en `content/channel.ts`.

Las salas de la v5 (Cerebro, Redes, Causas, Bitácora) y el neuroescáner de la
v4–v7 salieron del código en la v8; están en el historial de git.

EVA es un personaje, no un chatbot real. Todo lo que «hace» en pantalla —clonar
su genoma, escanearse el cerebro, pensar en voz alta— es ficción declarada. No
hay backend, no hay IA detrás, no se guarda nada. Mantenlo así o dilo en pantalla.

---

## 2. Dos reglas del propietario que no se negocian

1. **«Minimalista» significa menos secciones, nunca menos animación.** Ya pasó
   una vez: la v2 apagó el cursor, el sonido y el campo de partículas buscando
   sobriedad, y hubo que reconstruirlo todo. Los conmutadores de
   `src/content/site.ts` (`signalCursor`, `sound`, `reactiveField`) van en `true`.
   Si algo estorba, se quita la sección entera, no el movimiento.
2. **Slide por slide.** Ver arriba.

---

## 3. Cómo está armado

**Todo el texto vive en `src/content/`.** Los componentes no llevan literales ni
URLs. `structure.ts` lleva el recorrido (ejes, subsecciones, estados, acentos y
códigos). `ejes.ts`, los textos de cada lugar. `channel.ts`, los rótulos y guiones
del canal. `site.ts`, lo global: `flags`, `nav`, `hero`, `genome`,
`sections.footer`, `ui`. `neuroscan.ts` lleva las regiones del cerebro, el flujo de
pensamiento y las respuestas, que el canal cita por su id: EVA no se contradice.
Lo que EVA teclea en cada caja (`writes`) vive en `ejes.ts` (y `hero.writes` en
`site.ts`), como bloques `WritesBlock`. `assets.ts`, los retratos. Guía editorial y reglas del binario en
`CONTENT_GUIDE.md`.

**Estilos.** Tokens en `src/styles/tokens.css` (incluye el suelo tipográfico:
nada por debajo de 11 px, el carril del canal, `--eva-dock`, y el verde de la
cápsula, `--eva-bio`). Siete hojas en `src/app/`: `globals.css` (base),
`interface.css` (slides, cursor, portada), `nucleo.css` (el cerebro y su mapa
plano), `dna.css` (genoma y vídeo), `ejes.css` (navegación, riel, sala del
núcleo, puertas, canal), `cuerpo.css` (01.11) y `relato.css` (lo de v8: la caja
EVA // ESCRIBE, títulos con degradado, botón del canal, encaje de cada slide,
móvil). El acento de cada lugar sale de `structure.ts` (cada subsección tiene el
suyo: cian, violeta, `bio`). Las consolas del Cuerpo reutilizan
las piezas del genoma (`.dna__hud`, `.dna__btn`, `.dna__reply`) y los registros
del núcleo (`.core__chip`): es la misma máquina.

**Servidor por defecto.** Son cliente los componentes de `src/components/eva/`
(salvo `EvaProfile` y `EvaPortraitFrame`) más `MobileNavigation`, `ContextSpy`,
`BitRail` y `SoundControl`. Las secciones
(`components/sections/*Section.tsx`) son de servidor y pasan sus textos a las
piezas vivas como huecos (`head`, `copy`, `aside`).

### Las piezas

| Pieza | Archivo | Qué hace |
|---|---|---|
| Estructura | `content/structure.ts` + `lib/binary.ts` | El árbol del recorrido y sus códigos. `contextNodes` son los lugares que se pueden estar mirando; `hashAliases`, las anclas antiguas. |
| Dónde está el visitante | `layout/ContextSpy.tsx` + `lib/context.ts` | Observa la franja central de la pantalla, espera 400 ms y publica el lugar. Marca `aria-current`, escribe `html[data-axis]` y `html[data-node]`, tiñe y frena el fondo, cierra el canal al pulsar un enlace interno. |
| Canal | `eva/EvaSynapse.tsx` + `lib/channel.ts` + `content/channel.ts` | Máquina de estados pura y probada; la mecanografía escribe directo en el DOM y reserva el alto de cada línea. |
| Acrónimo | `eva/EvaAcronymMesh.tsx` | Malla de nodos a partir de Space Grotesk 700, en fila (`direction='row'`), sólo en la portada. Se detiene fuera de pantalla. |
| Caja de EVA | `eva/EvaWrites.tsx` + `WritesBlock` (`lib/types.ts`) | EVA teclea el contenido de cada lugar: párrafos, rótulos, consignas, fichas y tablas. Una vez por visita, por id. |
| Puertas | `sections/HeroEva.tsx` + `doors` en `structure.ts` | Las tres partes de la Entidad como enlaces bajo el nombre. |
| Genoma | `eva/EvaDnaHelix.tsx` + `eva/dna/DnaScene.tsx` | Doble hélice con ocho acciones (la octava, Expresar, enlaza con el Cuerpo) y purga junto al contador; una sola línea de estado. También en móvil (`quality='low'`: sin bloom). Publica su estado en `<html data-genome>` (`lib/genome-state`) y sacude el fondo (`lib/field`). |
| Cinta del genoma | `eva/GenomeStrand.tsx` | La misma secuencia de 600 bases, en 2D, magenta y violeta: abre el Cuerpo. |
| Biolectura | `eva/cuerpo/BioReading.tsx` + `scan.ts` + `bio-data.ts` | Lectura exterior del Cuerpo, una instancia por toma (`view`: perfil, cápsula). Motor puro y probado (`scan.test.ts`); lienzo 2D en `screen` sobre el vídeo o la imagen; bordes leídos una vez del fotograma visible; la pasada siempre baja. Publica `<html data-body>` (`lib/body-state`): el hilo se enciende al terminar. |
| Interior | `eva/cuerpo/EvaInterior.tsx` → `InteriorScene.tsx` (R3F, diferida) · `InteriorFallback.tsx` (SVG) · `interior-data.ts` | Capa HTML con los órganos y las acciones como botones; la escena sólo dibuja. Estado de cada fotograma en `body-signal.ts`. |
| Trazo cardíaco | `eva/cuerpo/InteriorVitals.tsx` + `pulse.ts` | ECG en 2D y **dueño del latido**: avanza la fase que la escena lee, así corazón y trazo van al compás con WebGL o sin él. El latido suena sólo si se pide y el sonido de la cabecera está encendido. |
| Retrato | `eva/EvaProfile.tsx` → `EvaPortraitFrame.tsx` → `EvaPortraitLoop.tsx` | El retrato de la portada con su bucle de vídeo; ya no abre nada. |
| Núcleo neural | `eva/neural/*` | La sala (`NeuralRoom`: cerebro, registro de regiones y lectura de la elegida) y el núcleo (`EvaNeuralCore`). Ver §7. Encuadre en `neural-frame.ts`. |
| Riel de bits | `layout/BitRail.tsx` | A partir de 1.280 px: cuatro celdas que se encienden con el código del lugar, y una marca por lugar. |
| Fondo y cursor | `eva/EvaField.tsx`, `eva/EvaSignalCursor.tsx`, `lib/pointer.ts`, `lib/field.ts` | Como en v5, más el tinte por lugar (el Cuerpo tiñe de verde cápsula y magenta), la quietud de los lugares clausurados (hoy no hay) y las sacudidas del genoma y del cuerpo. |

---

## 4. Trampas conocidas

Las cinco primeras costaron tiempo real. La primera costó el doble porque
apareció dos veces en sitios distintos.

1. **Morph targets con R3F.** R3F asigna la `geometry` *después* de construir la
   `Mesh`, así que el constructor no ve los morph targets y deja
   `morphTargetInfluences` sin crear. three.js lee `.length` sobre eso en cada
   fotograma y **aborta el fotograma entero al llegar a esa malla, sin error en
   consola**. Resultado: todo lo que se dibuja después desaparece en silencio.
   Hay que llamar a `updateMorphTargets()` a mano antes del primer pintado
   (`useLayoutEffect` en `Body`, ref callback en `Clone`). Si algo del genoma
   deja de verse y la consola está limpia, mira aquí primero.
2. **Reglas del React Compiler.** El lint las aplica de verdad: nada de
   `Math.random()` en render (usa el LCG con semilla que ya está), nada de
   `setState` dentro de efectos, y no mutes lo que devuelve un hook ni las props
   — `useThree().camera` incluido; escala un grupo propio en su lugar.
3. **`window` en inicializadores de estado.** `EvaSynapse`, `TypedParagraph` y
   `EvaNeuralCore` **sí** se renderizan en el servidor. Un
   `useState(() => window.matchMedia(...))` pasa el dev server y revienta el
   build. Usa `useSyncExternalStore` con instantánea de servidor, como está ahora
   (`lib/motion`, `lib/context`, `lib/channel-store`).
4. **El panel del navegador engaña.** Cuando la vista previa pierde el foco,
   `requestAnimationFrame` se congela: 0 fotogramas, el canvas de R3F en blanco,
   los callbacks del `IntersectionObserver` sin entregar (así que el vídeo ni se
   monta) y las transiciones CSS detenidas en su valor inicial. Las capturas
   fuerzan un pintado y entonces sí se ve todo. **Antes de declarar roto algo
   visual, comprueba `document.hasFocus()` y cuenta fotogramas.** En esta rama
   hubo cuatro falsas alarmas por esto.
5. **Vídeo quieto en el primer fotograma.** Llamar a `play()` desde un efecto con
   `preload="none"` deja la promesa colgando. El arranque va en `onCanPlay`.
6. `backdrop-filter` en el header convierte a sus hijos `position: fixed` en
   relativos a él. Por eso el menú móvil es `absolute`. No lo vuelvas a `fixed`.
7. Revocar el blob de la descarga en el mismo tic que el `click()` corta la
   descarga en algunos navegadores. Va en un `setTimeout(..., 0)`.
8. `0xeva01` no es un literal hexadecimal válido: la `v` no es un dígito hex.
9. Una caja vacía por encima del genoma se come los clics de sus botones.
   Comprueba con `document.elementFromPoint` que llegan, no sólo que se ven.
10. Tras borrar o renombrar rutas, `tsc` falla con tipos viejos de `.next/`; se
    arregla con `npm run build`.
11. En Windows git avisa de LF → CRLF. Es inofensivo.
12. **`OrbitControls` escribe `touch-action: none` en línea, dos veces.** Drei se
    conecta primero al canvas y, cuando el store publica `events.connected`,
    se desconecta y se conecta al contenedor: cualquier `style.touchAction` que
    pongas en un efecto queda pisado. La regla `.core__canvas > div` con
    `!important` es la que manda; no la quites.
13. **Un clic sobre un nodo 3D no es un clic si hubo arrastre.** R3F entrega
    `event.delta` (píxeles entre pointerdown y click); el núcleo ignora los
    clics con más de 6. Sin eso, soltar un giro sobre una región la seleccionaba.
14. El módulo 3D del núcleo llega por `next/dynamic` y R3F sólo arranca cuando
    el contenedor mide algo: si el panel del navegador no pinta (trampa 4), la
    sala se queda en «Compilando núcleo neural» aunque el código esté bien.
15. **`EvaNeuralCore` se renderiza en el servidor** desde que vive en la sala 01.
    Nada de `document` ni `window` en inicializadores: la detección de WebGL y
    de dispositivo va detrás de `useIsClient` (`useSyncExternalStore`) y está
    cacheada por página (`webglSupported`, `deviceTier`, `coarsePointer`). Hasta
    hidratar sólo se ve el HUD; el mapa plano queda para cuando no hay WebGL.
16. **`coreSignal` es uno por página.** Hasta la v7 lo compartían la sala y el
    escáner, que nunca estaban activos a la vez (el escáner cubría la sala con
    `setCovered`). Desde la v8 sólo hay una escena del núcleo; si algún día
    vuelve a haber dos, el signal tiene que ser por escena.
17. Las capturas del panel del navegador tras un scroll programático salen negras
    con la cabecera abajo: el compositor se queda en y=0 mientras no hay
    fotogramas. No es la página. Para ver una sala, cárgala con `main`
    desplazado por `margin-top` negativo o lleva el panel a primer plano.
18. **La vista previa del panel arranca en la raíz original del proyecto**, no
    en un worktree: en la sesión de la v6 levantó la copia local antigua (Next
    16.2.6, título «Inteligencia, aprendizaje y experimentación») en vez de la
    rama nueva. Antes de revisar nada, mira en los registros qué versión de Next
    arrancó y el título de la pestaña.
19. **`frameloop='demand'`, no `'never'`, para congelar una escena.** Con
    `never` R3F no dibuja ni el primer fotograma y el lienzo queda en blanco
    hasta que se activa; con `demand` pinta al montar y al redimensionar.
20. **La clase `.synapse` es un contrato**: el menú móvil inertiza el canal
    por ese nombre, y además le pide que se cierre (`requestChannelClose`). Si
    la renombras, cambia el selector.
21. **Un nodo sólo cuenta como «lugar» si se sostiene 400 ms** en la franja
    central (`CONTEXT_DWELL_MS`). Sin esa espera, el desplazamiento suave de un
    enlace pasaba por las secciones intermedias y el canal avisaba de todas.
22. **Dos `EffectComposer` en la misma página se pisan el tamaño.**
    `@react-three/postprocessing` (3.1.1) mide el lienzo en un `Vector2`
    compartido por todos sus composers y lo lee más tarde, en un `useEffect`;
    entre medias, el `useFrame` de cualquier otra escena activa vuelve a
    escribirlo. Cuando el genoma monta (una pantalla antes de verse, con la
    sala del cerebro animando) su renderer arranca con el tamaño del cerebro y
    la hélice sale recortada hasta el siguiente `resize`. `ComposerSizeGuard`
    va detrás del composer en cada `<Canvas>` y devuelve el renderer a
    `state.size`. Si añades una escena con bloom, ponlo también.
23. **Lo que un bucle escribe en el DOM no puede ser hijo de React.** La
    ventana de lectura teclea creando `<p>` a mano dentro de un contenedor
    que React también rellena (las líneas de arranque). Si el bucle borra un
    nodo de React, la siguiente reconciliación —al cambiar `reduced`, por
    ejemplo— lanza `removeChild` sobre un nodo que ya no es hijo, el commit
    falla y **la página entera se desmonta** (de rebote, un `<Canvas>` a
    medio configurar conecta eventos sobre `null`). El bucle sólo desahucia
    líneas suyas (`typed`) y las retira al pasar a movimiento reducido.
24. **Un tubo translúcido que escribe profundidad esconde lo que va dentro.**
    Las partículas del interior viajan por el eje de cada vaso; con el
    `depthWrite` por defecto, el tubo se pintaba antes y las tapaba: se veían
    tubos lisos y ningún flujo. Los vasos llevan `depthWrite={false}` y los
    puntos, `renderOrder={2}`.
25. **Una simulación con tope de `dt` se ralentiza en equipos lentos.** Con el
    tope en 0,05 s, a menos de 20 fotogramas por segundo la pasada de la
    biolectura iba a cámara lenta (en SwiftShader, un 23 % en nueve
    segundos). `scan.ts` avanza píxel a píxel dentro de cada paso —si no, a
    más de un píxel por fotograma las partículas se saltan los bordes, que
    miden uno— y así el tope puede ser 0,12 s; `scan.test.ts` comprueba que el
    resultado no depende de los fotogramas por segundo.
26. **Revisar sin el panel del navegador.** Por las trampas 4 y 17, en esta
    sesión el panel no pintaba nada tras un desplazamiento. La v7 se revisó con
    Chrome sin interfaz manejado por el protocolo DevTools desde un script de
    Node 24 (tiene `WebSocket` global; no hace falta Puppeteer): lanzar
    `chrome --headless=new --remote-debugging-port=<p> --use-angle=swiftshader
    --enable-unsafe-swiftshader --autoplay-policy=no-user-gesture-required`,
    pedir `PUT /json/new`, y usar `Emulation.setDeviceMetricsOverride`,
    `Emulation.setEmulatedMedia` (movimiento reducido), `Runtime.evaluate` y
    `Page.captureScreenshot`. Con `--disable-3d-apis` se prueba la vista sin
    WebGL. SwiftShader va lento: esperar por estado, no por tiempo.
27. **Leer píxeles de un vídeo exige mismo origen.** La biolectura saca los
    bordes del fotograma visible con `getImageData`. Mientras el vídeo y la
    imagen se sirvan desde `public/`, funciona; si pasan a un CDN, necesitan
    CORS (`crossOrigin` y cabeceras) o el lienzo queda «manchado» y la lectura
    no arranca (el código lo captura y no hace nada, sin error visible).
28. Ruido conocido en la consola de desarrollo, inofensivo: el aviso de
    `THREE.Clock` obsoleto sale de R3F, no del código de EVA, y el aviso de
    LCP de `next/image` sólo aparece si se carga la página ya desplazada hasta
    el Cuerpo.
29. **Un elemento creado en un componente de servidor y colocado por un
    componente de cliente en una lista de hijos necesita `key`.** Al cruzar
    la frontera servidor → cliente, React no marca esos elementos como
    validados (`validated: 0` en el payload de Flight); cuando el cliente los
    pone en un array de hijos —`{foot}` al final de una consola, por ejemplo—
    avisa «Each child in a list should have a unique key… It was passed a
    child from CuerpoSection». Sin pista de dónde: el stack lleva a
    `reconcileChildrenArray`. Todo elemento que una sección pasa como prop
    (`head`, `foot`, `writes`) lleva `key`. Se localizó decodificando el
    payload (`self.__next_f.push`) y buscando el `0` final.
30. **`scroll-padding-top` y `scroll-margin-top` se suman.** Con los dos
    puestos (cabecera + 1 rem en el documento y cabecera en cada slide),
    cada lugar aterrizaba unos 70 px más abajo de lo que debía y su pie
    quedaba fuera de la pantalla. Manda sólo el `scroll-padding` del
    documento (`relato.css`); los slides van a 0.
31. **Una barra con rótulos `nowrap` ensancha la pista de la rejilla.** La
    barra de la caja de EVA (título, lugar, botón, estado, todos sin salto)
    tiene un ancho mínimo mayor que su columna a 1366 px, y la pista `auto`
    de la caja lo respeta: la caja se salía del slide. `min-width: 0` en los
    hijos directos de `.writes` y `flex: 1 1 auto` en el lugar (que se
    recorta con puntos suspensivos).

---

## 5. Pendiente, por impacto

0. **Optimización avanzada de rendimiento** (encargo del propietario, 20-09-2026; punto de
   control en `CHECKPOINT_2026-09-20.md`). Objetivo: una EVA visualmente idéntica e igual de
   interactiva, pero sin retraso ni bloqueos, en escritorio y móvil. Condiciones: **no rediseñar,
   no quitar animaciones, 3D, efectos, interacciones ni contenido; no cambiar orden, identidad,
   narrativa ni comportamiento**; conservar la carga diferida existente; cambios focalizados,
   comprobados y reversibles, en una rama propia.
   - A · Diagnóstico: auditar `EvaField`, `NeuralRoom`, `NeuralScene`, `EvaDnaHelix`, `DnaScene`,
     `EvaInterior`, `InteriorScene`, `BioReading`, `ComposerSizeGuard`, y los globales de cursor,
     sonido y escritura; medir con Lighthouse y perfiles de Chrome DevTools (escritorio y móvil
     emulado); no atribuir problemas sin evidencia.
   - B · Motores gráficos: revisar cada `requestAnimationFrame`/`useFrame`; suspender de verdad
     fuera de pantalla y con la pestaña oculta, conservando el estado; evitar escenas WebGL
     activas superpuestas; calidad adaptativa en tres niveles (alto/medio/bajo: resolución,
     densidad de partículas, geometría, postprocesado) según rendimiento real; fondo reactivo sin
     comparar todas las partículas entre sí; renderizado bajo demanda en reposo sin frenar lo que
     debe moverse; sin topes arbitrarios de FPS que den saltos.
   - C · Carga progresiva: mantener los `next/dynamic`; que el JavaScript de abajo no bloquee la
     portada; revisar los márgenes de montaje anticipado; transición ligera mientras carga cada
     módulo; vídeos, imágenes y fuentes sin degradación perceptible; nada de descargas,
     decodificación de vídeo ni biolectura fuera de pantalla.
   - D · Memoria: auditar creación y destrucción de recursos WebGL, fugas, listeners duplicados,
     temporizadores y bucles vivos; liberar geometrías, materiales y texturas que dejen de
     usarse; no destruir escenas a cada scroll si recompila shaders; conservar `ComposerSizeGuard`.
   - E · Validación: antes/después con métricas reproducibles (FPS, carga, tareas largas,
     memoria, CPU, interacción) en portada, cerebro, genoma, perfil, cápsula, interior y
     consciencia; lint, tipos, pruebas y build; informe final con problemas encontrados, archivos
     tocados, mediciones y límites pendientes. Además: limpiar el repo lo más posible.
0 bis. **Decisiones del Cuerpo que siguen abiertas** (el propietario publicó la v7
   y la v8 sin cambiarlas; detalle en `CUERPO_ENCARGO.md` §10):
   - rótulo `EVA-07` (encargo) o `EVA-01` (imagen): va `EVA-07`, en
     `ejes.cuerpo.exterior.subject`;
   - título y lema del Cuerpo e interior: provisionales, marcados en el código;
   - ~~los vídeos pesan 5,8 y 9,3 MB~~ resuelto en la v8.1: recomprimidos y en
     marcha en todas las pantallas;
   - la imagen fija de la cápsula (`eva-capsula.webp`, 1024×1536) quedó **en
     reserva**: la vista frontal usa el vídeo y su propio primer fotograma,
     porque el póster tiene que tener la proporción del vídeo;
   - revisión de tono de todos los textos nuevos del Cuerpo y de «Expresar».
1. **Revisión en dispositivos reales.** La v6 se recorrió en Chrome (headless,
   con SwiftShader) a 1440×900, 1366×720, 768×1024 y 390×844, con la lista del
   encargo entera: cerebro, hélice, canal (cerrado al cargar, aviso, abrir,
   cerrar al cambiar de sección, retomar hilo), regiones por teclado, escáner
   (Escape y foco de vuelta), anclas antiguas, menú móvil y movimiento
   reducido. Falta mirarla en Safari iOS y con lector de pantalla (punto 7).
   Nota: las anclas dejan unos 90 px de la sección anterior a la vista en
   móvil (`scroll-padding-top` + `scroll-margin-top`, CSS heredado de v5).
2. **Vigilancia y Autonomía** salieron en la v7 por decisión del propietario.
   Si vuelven, ver `CONTENT_GUIDE.md` («Añadir un lugar al recorrido»).
3. **Revisión de tono** de los textos nuevos: párrafo del nacimiento
   (`ejes.genoma.birth`), explicaciones del canal (`channel.scripts`) y líneas
   de estado.
4. ~~El vídeo pesa 3,71 MB~~ Recomprimidos los tres en la v8.1 (0,56 / 0,80 / 1,43 MB, sin audio).
5. **Permiso de publicación de retratos y vídeo** (`ASSET_LICENSES.md`).
6. El contacto es el Instagram público. No inventar otro canal.
7. `prefers-reduced-motion`, Safari iOS y lector de pantalla: implementados,
   nunca probados de punta a punta.

## 6. Reglas editoriales que conviene mantener

- **Es el laboratorio de EVA, no una oferta.** Nada de servicios, productos,
  cursos ni «universos». Cada sala cuenta algo de ella: origen, cerebro, redes,
  causas, bitácora. Si algo suena a catálogo, sobra.
- Sin nombres de personas en la página ni «Creado por». La ficha del estudio y
  sus servicios salieron del pie por lo mismo.
- Nada sin destino real lleva enlace; nunca `href="#"`.
- No copiar código ni assets de repos externos sin registrarlo en
  `ASSET_LICENSES.md` y `MATRIZ_REFERENCIAS_REACT_LANDING.md`. El genoma se
  escribió de cero por esto; un pack de Freepik se descartó por su obligación de
  atribución visible.
- Un remate de humor por bloque, como máximo.
- Todo lo que EVA finge hacer se declara como ficción en pantalla.

---

## 7. Núcleo neural 3D

Llegó en la rama `feat/eva-neural-core` (v5) dentro del neuroescáner; desde la v6 vive en la
sala 01.01 y desde la v8 sólo ahí (`NeuralRoom` → `EvaNeuralCore` → `NeuralScene`).

- **Qué se ve.** Dos hemisferios (esfera deformada en `neural-data.ts`, surcos
  por ruido de valor, cara medial plana), cerebelo y tronco, fusionados en una
  malla con un `ShaderMaterial` propio: base oscura translúcida, fresnel cian,
  contraluz violeta, surcos que laten y una banda de escaneo que sube. Dentro,
  neuronas instanciadas, sinapsis en un único `LineSegments` con colores por
  vértice, impulsos que recorren aristas y se ramifican, y ocho nodos-región.
- **Determinismo.** Todo sale de `buildBrain(detail, zones)` con la semilla
  `0xe7a01`; la simulación usa otro LCG. Nada de `Math.random()`.
- **Regiones.** Las ocho de `content/neuroscan.ts` con sus ids. La x del SVG
  reparte hemisferios y la y va de la frente a la nuca (`hubSeed`). Hover =
  previsualización (HUD + cursor de señal, no toca la selección); clic =
  selección en `NeuralRoom`, descarga desde el nodo y giro para encararlo;
  `undeclared` se enciende en magenta (`brain.core.alert`).
- **Niveles.** `DETAIL` en `neural-data.ts`: low (240 neuronas, sin bloom),
  mid (420), high (720, bloom 0.85, MSAA 4). Se elige una vez por apertura.
- **Sin WebGL o si la escena revienta**, `NeuralFallback` (el SVG antiguo) es la
  interfaz. Mientras carga, el mismo SVG late y se desvanece al primer fotograma.
- **HTML manda.** Las regiones son botones (`.core__chip`) con `aria-pressed`,
  foco y 44 px en táctil; el lienzo es `aria-hidden`. Restablecer centra,
  restaura la cámara y suelta la región. Doble clic en el vacío recentra.
- **Movimiento reducido:** sin giro, sin respiración, sin impulsos espontáneos,
  sin barrido; la selección enciende la región sin descarga.
- **Textos** en `neuroscan.brain.core` (HUD, controles) y `ejes.nucleo.region`
  (la lectura de la región elegida). Referencia externa estudiada y descartada
  como copia: `MATRIZ_REFERENCIAS_REACT_LANDING.md`.

## 8. Historia breve

- **v2** (`e852f4d`) — «interfaz compacta». Apagó cursor, sonido y partículas
  buscando sobriedad. Fue un error de lectura del encargo.
- **v3** — recupera la capa interactiva, introduce el sistema de slides y la
  sección Cursos; saca cifras, cierre institucional y asistente flotante.
- **v4** — portada reconstruida: acrónimo como malla neuronal, genoma 3D
  con siete funciones, retrato en vídeo, escáner neurodigital y el pensamiento de
  EVA como panel flotante. Fuera el texto introductorio, los botones, el rotador
  y la franja de Misión / Visión / Objetivos.
- **v5** — el escáner cambia el dibujo por un cerebro sintético en
  WebGL (§7) y la página deja de ser un catálogo: fuera los cuatro universos, el
  destacado y Cursos; entran las cinco salas del laboratorio de EVA.
- **v6** — la página por ejes: Entidad (núcleo cerebral, genoma
  digital, reserva), Vigilancia y Autonomía, con numeración binaria real; el
  canal SINAPSIS sustituye al panel que se abría solo; cerebro encuadrado por
  proporción; genoma con su propia subsección y usable en móvil; regiones y
  métricas en español; salas antiguas en reserva.
- **v7** — una sola Entidad en tres partes: la
  reserva 01.11 pasa a ser el **Cuerpo** (biolectura sobre los dos vídeos de
  EVA, e interior bio-sintético con corazón, vasos, seis
  órganos y ECG, adaptados de dos repos MIT); fuera Vigilancia y Autonomía; la
  portada enseña el nombre y tres puertas; el genoma gana «Expresar».
- **v8.2** — la Consciencia (10): un segundo eje sin partes, después del corazón, con un
  campo Particle Life (MIT, adaptado) que EVA observa: diez acciones, cinco figuras, caos
  con semilla, ruido, gravedad y viscosidad; cuatro estados con ecos de Borges, Ghost in
  the Shell, Dick y Asimov; confesión; cierre con `ESTADO: EXPANSIÓN → ALGUIEN ESTUVO
  AQUÍ`. Cuatro puertas. Cursor del sistema a la vista. El expediente v9 (contenido a
  medias) espera en `wip/expediente-v9`.
- **v8** — EVA escribe cada slide: una caja donde teclea el contenido
  de cada lugar (función, consigna, hardware; relato de ciencia ficción con
  fuentes), corta y en una pantalla; fondo plano; portada con el nombre en
  malla y sin las palabras; fuera el neuroescáner; cerebro y hélice fundidos
  con el fondo; el Cuerpo con perfil, cápsula e interior a la vista; los
  gráficos alternan de lado; dos tipografías; un acento por lugar; el botón
  de SINAPSIS con halo y rótulo.

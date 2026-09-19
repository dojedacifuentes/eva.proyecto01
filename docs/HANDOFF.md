# Handoff — landing de EVA

> Para quien continúe este trabajo, sea persona o modelo. Léelo entero antes de
> tocar la portada: casi todo lo que parece un capricho estético aquí tiene una
> razón, y casi todos los fallos de esta rama se repitieron dos veces porque la
> segunda no estaba escrita en ningún sitio.

**Estado:** `main` = v6 (`900e5e5`, la página organizada en Entidad / Vigilancia / Autonomía, con numeración binaria y el canal SINAPSIS), **publicada** en https://evaproyecto01.vercel.app/ el 19-09-2026, revisada en navegador a 1440×900, 1366×720, 768×1024 y 390×844 · **encargo abierto: la subsección 01.11 pasa a ser CUERPO** (vídeo de la cápsula + biolectura + interior bio-sintético). Todo lo necesario está en `docs/CUERPO_ENCARGO.md`; rama de trabajo `feat/cuerpo`.
**Fecha:** 19 de septiembre de 2026
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

## 0. Encargo resuelto en v6: la página por ejes (19 sept. 2026)

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
00 · Portada — el acrónimo como tres puertas, y el retrato que abre el escáner
01 · ENTIDAD
     01.01 · Núcleo cerebral — cerebro 3D en vivo + ventana de lectura + 8 regiones
     01.10 · Genoma digital  — hélice 3D, 7 acciones, párrafo del nacimiento (se teclea una vez)
     01.11 · Por definir     — banda de reserva: el genoma a la vista (→ será CUERPO, ver docs/CUERPO_ENCARGO.md)
10 · VIGILANCIA — clausurada (la «V» quieta con faja de clausura; el fondo se frena)
11 · AUTONOMÍA  — en desarrollo (la «A» a medio ensamblar; registro listo para subsecciones)
```

**Todo el recorrido sale de `src/content/structure.ts`:** cabecera, riel de
bits, menú móvil, pie, pies de slide, portada y canal leen de ahí. Los códigos
se calculan; no se escriben a mano. Cada sección es `.slide` con
`min-height: 100svh` y `scroll-snap-align` (salvo la banda 01.11); si añades
contenido, comprueba que sigue cabiendo a 1440×900 y a 1366×720.

**SINAPSIS // EVA** (`EvaSynapse`, reglas en `lib/channel.ts`) sustituye al
antiguo panel de pensamiento, que se abría solo a los 2,2 s: empieza cerrado
(botón de 48 px abajo a la derecha), se abre sólo con clic o tecla, se cierra
al cambiar de lugar (por scroll con 400 ms de histéresis, o al pulsar un enlace
interno), avisa una vez por lugar sin abrirse, conserva el hilo y retoma una
frase interrumpida donde quedó. Si el visitante retrocede para leer, se detiene
y ofrece «retomar el hilo». En escritorio el contenido se aparta para dejarle
sitio (`html[data-channel='open']`), así abierto no tapa controles; en móvil es
una hoja inferior. Guiones en `content/channel.ts`.

Las salas de la v5 (Cerebro, Redes, Causas, Bitácora) salieron del recorrido:
sus textos siguen en `content/lab.ts` y sus componentes en
`components/sections/reserva/`, compilando pero sin montar, para reutilizarlos
cuando Vigilancia, Autonomía o 01.11 tengan contenido. No asignarlos sin
decisión del propietario.

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
`sections.footer`, `ui`. `neuroscan.ts` lleva el escáner y es la fuente de todo
lo que se repite (regiones, flujo, declaración dataísta, respuestas): EVA no se
contradice. `lab.ts` guarda las salas en reserva y el vocabulario de la ventana
de lectura. `assets.ts`, los retratos. Guía editorial y reglas del binario en
`CONTENT_GUIDE.md`.

**Estilos.** Tokens en `src/styles/tokens.css` (incluye el suelo tipográfico:
nada por debajo de 11 px, y el carril del canal, `--eva-dock`). Seis hojas en
`src/app/`: `globals.css` (base), `interface.css` (slides, cursor, portada),
`neuroscan.css` (escáner y núcleo), `dna.css` (genoma y vídeo), `lab.css` (salas
en reserva) y `ejes.css` (todo lo de v6: ejes, navegación, riel, secciones,
canal). El acento de cada lugar sale de `structure.ts`; Vigilancia y Autonomía
lo redefinen con `[data-axis]`.

**Servidor por defecto.** Son cliente los componentes de `src/components/eva/`
más `MobileNavigation`, `ContextSpy`, `BitRail` y `SoundControl`. Las secciones
(`components/sections/*Section.tsx`) son de servidor y pasan sus textos a las
piezas vivas como huecos (`head`, `copy`, `aside`). El escáner se abre desde
cualquier sitio con un evento (`lib/stage.ts`) que atiende `EvaProfile`.

### Las piezas

| Pieza | Archivo | Qué hace |
|---|---|---|
| Estructura | `content/structure.ts` + `lib/binary.ts` | El árbol del recorrido y sus códigos. `contextNodes` son los lugares que se pueden estar mirando; `hashAliases`, las anclas antiguas. |
| Dónde está el visitante | `layout/ContextSpy.tsx` + `lib/context.ts` | Observa la franja central de la pantalla, espera 400 ms y publica el lugar. Marca `aria-current`, escribe `html[data-axis]` y `html[data-node]`, tiñe y frena el fondo, cierra el canal al pulsar un enlace interno. |
| Canal | `eva/EvaSynapse.tsx` + `lib/channel.ts` + `content/channel.ts` | Máquina de estados pura y probada; la mecanografía escribe directo en el DOM y reserva el alto de cada línea. |
| Acrónimo | `eva/EvaAcronymMesh.tsx` | Malla de nodos a partir de Orbitron. Modos `alive` (portada), `sealed` (Vigilancia: quieta, con estremecimientos) y `building` (Autonomía: aristas que se conectan y se sueltan); paletas `signal`, `seal`, `growth`. Se detiene fuera de pantalla. |
| Genoma | `eva/EvaDnaHelix.tsx` + `eva/dna/DnaScene.tsx` | Doble hélice con siete acciones y purga. Ahora también en móvil (`quality='low'`: sin bloom). Publica su estado en `<html data-genome>` (`lib/genome-state`) y sacude el fondo (`lib/field`). |
| Cinta del genoma | `eva/GenomeStrand.tsx` | La misma secuencia de 600 bases, en 2D, magenta y violeta, cruzando la banda 01.11. |
| Párrafo del nacimiento | `eva/TypedParagraph.tsx` | Se teclea una vez por visita; el texto completo está en el DOM desde el principio (invisible lo no escrito), así no salta nada y se lee sin JavaScript. |
| Retrato | `eva/EvaProfile.tsx` → `EvaPortraitFrame.tsx` → `EvaPortraitLoop.tsx` | Igual que en v5; abre el escáner. |
| Escáner | `eva/EvaNeuroscan.tsx` | Modal a pantalla completa. Cierra el canal al abrirse y devuelve el foco a quien lo abrió. El cerebro va primero y en la columna más ancha. |
| Núcleo neural | `eva/neural/*` | Ver §0 y §7. Encuadre en `neural-frame.ts`. |
| Riel de bits | `layout/BitRail.tsx` | A partir de 1.280 px: cuatro celdas que se encienden con el código del lugar, y una marca por lugar. |
| Fondo y cursor | `eva/EvaField.tsx`, `eva/EvaSignalCursor.tsx`, `lib/pointer.ts`, `lib/field.ts` | Como en v5, más el tinte por eje, la quietud de Vigilancia y las sacudidas del genoma. |

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
14. El módulo 3D del escáner llega por `next/dynamic` y R3F sólo arranca cuando
    el contenedor mide algo: si el panel del navegador no pinta (trampa 4), el
    escáner se queda en «Compilando núcleo neural» aunque el código esté bien.
15. **`EvaNeuralCore` se renderiza en el servidor** desde que vive en la sala 01.
    Nada de `document` ni `window` en inicializadores: la detección de WebGL y
    de dispositivo va detrás de `useIsClient` (`useSyncExternalStore`) y está
    cacheada por página (`webglSupported`, `deviceTier`, `coarsePointer`). Hasta
    hidratar sólo se ve el HUD; el mapa plano queda para cuando no hay WebGL.
16. **Dos escenas del núcleo comparten `coreSignal`** (sala y escáner). No chocan
    porque nunca están activas a la vez: el escáner enciende `setCovered` y la
    sala congela su bucle. Si algún día conviven, el signal tiene que ser por escena.
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
20. **La clase `.synapse` es un contrato**: el escáner y el menú móvil inertizan
    el canal por ese nombre, y además le piden que se cierre
    (`requestChannelClose`). Si la renombras, cambia los dos selectores.
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

---

## 5. Pendiente, por impacto

0. **Subsección 01.11 · CUERPO.** Encargo del propietario del 19-09-2026, íntegro y
   estructurado en `docs/CUERPO_ENCARGO.md`: el vídeo de EVA en la cápsula
   (`public/eva/eva-capsula-loop.mp4`, ya en el repo) con una biolectura de
   partículas (técnica de collidingScopes/scanlines, MIT) y, debajo, el interior
   bio-sintético (corazón, vasos, órganos seleccionables y ECG, adaptado de
   christianpasinrey/human-blood-system, MIT). Rama `feat/cuerpo`. Sin publicar.
1. **Revisión en dispositivos reales.** La v6 se recorrió en Chrome (headless,
   con SwiftShader) a 1440×900, 1366×720, 768×1024 y 390×844, con la lista del
   encargo entera: cerebro, hélice, canal (cerrado al cargar, aviso, abrir,
   cerrar al cambiar de sección, retomar hilo), regiones por teclado, escáner
   (Escape y foco de vuelta), anclas antiguas, menú móvil y movimiento
   reducido. Falta mirarla en Safari iOS y con lector de pantalla (punto 7).
   Nota: las anclas dejan unos 90 px de la sección anterior a la vista en
   móvil (`scroll-padding-top` + `scroll-margin-top`, CSS heredado de v5).
2. **Contenido de Vigilancia y Autonomía**: decisión del propietario.
   Las salas en reserva están disponibles.
3. **Revisión de tono** de los textos nuevos: párrafo del nacimiento
   (`ejes.genoma.birth`), explicaciones del canal (`channel.scripts`) y líneas
   de estado.
4. **El vídeo pesa 3,71 MB**, sin recomprimir y con audio que no se usa.
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

Llegó en la rama `feat/eva-neural-core` (v5). Sustituye el dibujo SVG del escáner por un cerebro
sintético en WebGL, dentro del mismo `.brain` y con la misma lógica de selección.

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
  `selectZone` del escáner, descarga desde el nodo y giro para encararlo;
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
- **Textos** nuevos en `neuroscan.brain.core`. Referencia externa estudiada y
  descartada como copia: `MATRIZ_REFERENCIAS_REACT_LANDING.md`.

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
- **v6** (esta) — la página por ejes: Entidad (núcleo cerebral, genoma
  digital, reserva), Vigilancia y Autonomía, con numeración binaria real; el
  canal SINAPSIS sustituye al panel que se abría solo; cerebro encuadrado por
  proporción; genoma con su propia subsección y usable en móvil; regiones y
  métricas en español; salas antiguas en reserva.

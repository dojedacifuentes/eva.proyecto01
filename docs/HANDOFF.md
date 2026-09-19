# Handoff — landing de EVA

> Para quien continúe este trabajo, sea persona o modelo. Léelo entero antes de
> tocar la portada: casi todo lo que parece un capricho estético aquí tiene una
> razón, y casi todos los fallos de esta rama se repitieron dos veces porque la
> segunda no estaba escrita en ningún sitio.

**Estado:** `main` = v5 (núcleo neural 3D + laboratorio; rama `feat/eva-neural-core` fusionada) · publicado en https://evaproyecto01.vercel.app/
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

## 1. Qué es esta página

Una landing de una sola ruta (`src/app/page.tsx`) partida en secciones que
**caben una a una en la pantalla**. Cada sección es `.slide` con
`min-height: 100svh` y `scroll-snap-align`. Si añades contenido a una sección,
comprueba que sigue cupiendo a 1440×900 y a 1366×720 antes de darla por buena.

Orden actual: portada → **Origen** → **Cerebro** →
**Redes** → **Causas** → **Bitácora**. Son las cinco salas del laboratorio de EVA:
ella contándose. Los cuatro universos (Academy, News, Arcade, Lab), el destacado
y la sección Cursos salieron de la página por decisión del propietario: esto es
el laboratorio personal de un personaje, no un catálogo de servicios ni de
productos. Su código y sus colecciones quedan en el historial (último commit con
ellos: `751d6ca`) por si «luego reorganizamos la info».

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
URLs. `site.ts` lleva lo global: `flags`, `nav`, `hero`, `genome`, `synapse`,
`sections.footer`, `ui`. `lab.ts` lleva las cinco salas (`rooms`, `navItems`,
`lab.origin/brain/networks/causes/log`). `neuroscan.ts` lleva el escáner y es la
fuente de todo lo que las salas repiten (regiones, declaración dataísta,
respuestas del interrogatorio): EVA no se contradice entre salas. `assets.ts`,
los retratos. Guía de estilo editorial en `CONTENT_GUIDE.md`.

**Estilos.** Tokens en `src/styles/tokens.css`. Cinco hojas en `src/app/`:
`globals.css` (base y secciones), `interface.css` (slides, cursor, portada),
`neuroscan.css` (el escáner), `dna.css` (genoma, panel de pensamiento y vídeo) y
`lab.css` (las salas). El acento de cada sala se fija con `data-accent` desde
`rooms`.

**Servidor por defecto.** Sólo son cliente los componentes de
`src/components/eva/` más `MobileNavigation`, `NavSpy` y `SoundControl`. Las
salas (`components/sections/*Section.tsx`, sobre `LabSection`) son de servidor;
el único botón vivo que llevan es `NeuroscanTrigger`, que pide abrir el escáner
con un evento (`lib/stage.ts`) y `EvaProfile` lo atiende.

### La portada, pieza por pieza

| Pieza | Archivo | Qué hace |
|---|---|---|
| Acrónimo | `eva/EvaAcronymMesh.tsx` | Rasteriza E / V / A en un lienzo oculto con Orbitron, muestrea los píxeles opacos en nodos y los une con aristas largas. La letra es una malla, no un polígono dibujado a mano: si cambias la fuente, cambian las letras. Una única onda viajera recorre toda la red, así se mueve como tela y no como enjambre. |
| Genoma | `eva/EvaDnaHelix.tsx` + `eva/dna/DnaScene.tsx` | Doble hélice procedural en R3F con siete acciones: clonar, utilizar, mutar, escanear, desplegar, sonificar y descargar. `lib/genome.ts` guarda la secuencia con semilla fija (600 bases) y genera el FASTA y las notas. `lib/spin.ts` lleva la inercia del arrastre. |
| Retrato | `eva/EvaProfile.tsx` → `EvaPortraitFrame.tsx` → `EvaPortraitLoop.tsx` | Marco técnico con la ficha del estudio. Encima, un bucle de vídeo mudo que sólo se carga en pantallas de 1024 px o más. Debajo siempre está la imagen, que hace de póster. |
| Pensamiento | `eva/EvaThoughtStream.tsx` | Panel flotante abajo a la derecha, montado en el **layout** (acompaña toda la página, no sólo la portada). Se despliega solo a los 2,2 s y teclea sin parar. El texto sale de `content/neuroscan.ts` para que EVA no se contradiga entre lo que piensa fuera y lo que piensa dentro del escáner. |
| Escáner | `eva/EvaNeuroscan.tsx` | Modal a pantalla completa al pulsar el retrato. Inertiza `main`, `header`, `footer` y `.synapse`. Al abrirse enciende `lib/stage.ts` (`setCovered`) y el genoma congela su bucle hasta que se cierra. |
| Núcleo neural | `eva/neural/EvaNeuralCore.tsx` + `NeuralScene.tsx`, `BrainShell.tsx`, `NeuralNetwork.tsx`, `neural-data.ts`, `neural-signal.ts`, `NeuralFallback.tsx` | El cerebro 3D del escáner. Ver §7. |
| Fondo y cursor | `eva/EvaField.tsx`, `eva/EvaSignalCursor.tsx`, `lib/pointer.ts` | Partículas que se enganchan al puntero y se vuelven cuadradas sobre lo interactivo; el cursor es un círculo que se convierte en cuadrado con esquinas de puntería. Comparten estado por un módulo, no por eventos por fotograma. |

El genoma publica su estado en `.hero__grid` con `data-genome`, y el retrato
reacciona desde CSS. Son el mismo sistema visto dos veces; no pases props entre
hermanos para esto.

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
3. **`window` en inicializadores de estado.** `EvaThoughtStream` **sí** se
   renderiza en el servidor. Un `useState(() => window.matchMedia(...))` pasa el
   dev server y revienta el build. Usa `useSyncExternalStore` con instantánea de
   servidor, como está ahora.
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

---

## 5. Pendiente, por impacto

1. **El vídeo pesa 3,71 MB**, sin recomprimir y con una pista de audio que no se
   usa. En la máquina donde se integró no había ffmpeg. Está mitigado —sólo se
   pide a partir de 1024 px, sólo al entrar en pantalla, y debajo queda la imagen
   de 116 kB— pero no resuelto. A 720p sin audio debería bajar a 600–900 kB.
2. **Permiso de publicación de retratos y vídeo**: todo figura como «por
   confirmar por el propietario» en `ASSET_LICENSES.md`. Hay que cerrarlo.
3. El contacto es el Instagram público («Escribir a EVA»). No inventar otro canal.
4. Isotipo en `src/app/icon.svg` y Open Graph definitiva.
5. Revisión de los textos de humor de EVA por el propietario, ahora también los
   de `lab.ts`.
6. Las colecciones de los universos (proyectos, noticias, rutas) ya no están en
   el árbol; si vuelven a hacer falta, están en `751d6ca`.
7. Capturas y tratamiento de imagen quedan sin objeto mientras no haya fichas.
8. Sección de contacto propia: hoy no existe y las redirecciones antiguas van a `/`.
9. `prefers-reduced-motion` está implementado en todas las piezas pero **nunca se
   ha probado de punta a punta**. Igual Safari iOS y lector de pantalla.
10. **Reorganizar la información del laboratorio** con el propietario: las cinco
    salas son una primera pasada («luego reorganizaremos la info»). Los textos
    nuevos de `lab.ts` también esperan su revisión de humor y de tono.

Detalle histórico: `LANDING_ROADMAP.md`, `AUDITORIA_FINAL_LANDING_EVA.md`,
`RELEASE_2026-09-19.md`.

---

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
- **v5** (esta) — el escáner cambia el dibujo por un cerebro sintético en
  WebGL (§7) y la página deja de ser un catálogo: fuera los cuatro universos, el
  destacado y Cursos; entran las cinco salas del laboratorio de EVA.

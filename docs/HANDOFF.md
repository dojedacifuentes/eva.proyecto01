# Handoff — landing de EVA

> Para quien continúe este trabajo, sea persona o modelo. Léelo entero antes de
> tocar la portada: casi todo lo que parece un capricho estético aquí tiene una
> razón, y casi todos los fallos de esta rama se repitieron dos veces porque la
> segunda no estaba escrita en ningún sitio.

**Estado:** `main` @ `0af47e0` · publicado en https://evaproyecto01.vercel.app/
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

Orden actual: portada → cuatro universos → destacado → Academy → **Cursos**
(vacía a propósito) → News → Arcade → Lab.

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
URLs. `site.ts` es el grande: `flags`, `nav`, `hero`, `studio`, `genome`,
`synapse`, `sections`, `ui`. El resto: `modules`, `projects`, `resources`,
`news`, `neuroscan`, `assets`. Guía de estilo editorial en `CONTENT_GUIDE.md`.

**Estilos.** Tokens en `src/styles/tokens.css`. Cuatro hojas en `src/app/`:
`globals.css` (base y secciones), `interface.css` (slides, cursor, portada),
`neuroscan.css` (el escáner) y `dna.css` (genoma, panel de pensamiento y vídeo).
El acento de cada universo se fija con `data-accent`.

**Servidor por defecto.** Sólo son cliente los componentes de
`src/components/eva/` más `MobileNavigation`, `NavSpy` y `SoundControl`.

### La portada, pieza por pieza

| Pieza | Archivo | Qué hace |
|---|---|---|
| Acrónimo | `eva/EvaAcronymMesh.tsx` | Rasteriza E / V / A en un lienzo oculto con Orbitron, muestrea los píxeles opacos en nodos y los une con aristas largas. La letra es una malla, no un polígono dibujado a mano: si cambias la fuente, cambian las letras. Una única onda viajera recorre toda la red, así se mueve como tela y no como enjambre. |
| Genoma | `eva/EvaDnaHelix.tsx` + `eva/dna/DnaScene.tsx` | Doble hélice procedural en R3F con siete acciones: clonar, utilizar, mutar, escanear, desplegar, sonificar y descargar. `lib/genome.ts` guarda la secuencia con semilla fija (600 bases) y genera el FASTA y las notas. `lib/spin.ts` lleva la inercia del arrastre. |
| Retrato | `eva/EvaProfile.tsx` → `EvaPortraitFrame.tsx` → `EvaPortraitLoop.tsx` | Marco técnico con la ficha del estudio. Encima, un bucle de vídeo mudo que sólo se carga en pantallas de 1024 px o más. Debajo siempre está la imagen, que hace de póster. |
| Pensamiento | `eva/EvaThoughtStream.tsx` | Panel flotante abajo a la derecha, montado en el **layout** (acompaña toda la página, no sólo la portada). Se despliega solo a los 2,2 s y teclea sin parar. El texto sale de `content/neuroscan.ts` para que EVA no se contradiga entre lo que piensa fuera y lo que piensa dentro del escáner. |
| Escáner | `eva/EvaNeuroscan.tsx` | Modal a pantalla completa al pulsar el retrato. Inertiza `main`, `header`, `footer` y `.synapse`. |
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

---

## 5. Pendiente, por impacto

1. **El vídeo pesa 3,71 MB**, sin recomprimir y con una pista de audio que no se
   usa. En la máquina donde se integró no había ffmpeg. Está mitigado —sólo se
   pide a partir de 1024 px, sólo al entrar en pantalla, y debajo queda la imagen
   de 116 kB— pero no resuelto. A 720p sin audio debería bajar a 600–900 kB.
2. **Permiso de publicación de retratos y vídeo**: todo figura como «por
   confirmar por el propietario» en `ASSET_LICENSES.md`. Hay que cerrarlo.
3. `site.contact.href` está vacío; el botón de cierre sale desactivado. No
   inventar datos.
4. Noticias reales con `source` + `sourceUrl` y `demo: false` en `content/news.ts`.
5. Capturas reales de Prompt Lab y FORO [in]VISIBLE; falta el tratamiento de
   imagen en `EntryCard`.
6. Isotipo en `src/app/icon.svg` y Open Graph definitiva.
7. URL del repositorio del juego (`TODO_GAME_REPOSITORY_URL`, hoy no se muestra).
8. Revisión de los textos de humor de EVA por el propietario.
9. `prefers-reduced-motion` está implementado en todas las piezas pero **nunca se
   ha probado de punta a punta**. Igual Safari iOS y lector de pantalla.
10. La sección **Cursos** sigue vacía a propósito. Rellenarla sólo cuando existan
    cursos de verdad.

Detalle histórico: `LANDING_ROADMAP.md`, `AUDITORIA_FINAL_LANDING_EVA.md`,
`RELEASE_2026-09-19.md`.

---

## 6. Reglas editoriales que conviene mantener

- Cuatro universos exactos; el nombre es «EVA News»; sin «Legal» ni «Studio».
- Sin nombres de personas en la página ni «Creado por».
- Nada sin destino real lleva enlace; nunca `href="#"`.
- **No anunciar servicios que el destino no declara.** La ficha del estudio lista
  sólo lo que aparece en iusmachina.vercel.app. Se pidió añadir
  «sostenibilidad» y no se añadió porque allá no existe.
- No copiar código ni assets de repos externos sin registrarlo en
  `ASSET_LICENSES.md` y `MATRIZ_REFERENCIAS_REACT_LANDING.md`. El genoma se
  escribió de cero por esto; un pack de Freepik se descartó por su obligación de
  atribución visible.
- Un remate de humor por bloque, como máximo.
- Todo lo que EVA finge hacer se declara como ficción en pantalla.

---

## 7. Historia breve

- **v2** (`e852f4d`) — «interfaz compacta». Apagó cursor, sonido y partículas
  buscando sobriedad. Fue un error de lectura del encargo.
- **v3** — recupera la capa interactiva, introduce el sistema de slides y la
  sección Cursos; saca cifras, cierre institucional y asistente flotante.
- **v4** (esta) — portada reconstruida: acrónimo como malla neuronal, genoma 3D
  con siete funciones, retrato en vídeo, escáner neurodigital y el pensamiento de
  EVA como panel flotante. Fuera el texto introductorio, los botones, el rotador
  y la franja de Misión / Visión / Objetivos.

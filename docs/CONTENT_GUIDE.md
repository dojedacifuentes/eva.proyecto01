# Guía de contenido

Todo lo editable vive en `src/content/`. Ningún componente contiene textos ni URLs.

| Quiero cambiar… | Archivo | Qué tocar |
|---|---|---|
| **El recorrido**: ejes, subsecciones, nombres, lemas, estados y acentos | `content/structure.ts` | `SOURCE` (el orden de la lista es el orden de la página y el origen de los códigos binarios) |
| Textos de cada lugar (genoma, cerebro; el cuerpo, fuera del recorrido desde la v9) | `content/ejes.ts` | `ejes.genoma`, `ejes.cerebro`, `ejes.cuerpo` (se conserva sin montar) |
| **Consciencia (01)**: puente, título, caja, estados con su eco, figuras, respuestas a cada acción, confesión y cierre | `content/consciencia.ts` | `consciencia.bridge`, `.title`, `.writes`, `.states`, `.figures`, `.replies`, `.confession`, `.coda` (los textos del cierre los fijó el propietario) |
| **Lo que EVA escribe en cada slide** (la caja EVA // ESCRIBE): párrafos, rótulos, consignas, fichas y tablas | `content/ejes.ts` | `ejes.cerebro.writes`, `ejes.genoma.writes` (y, sin montar, `ejes.cuerpo.exterior.views.profile.writes`, `…front.writes`, `ejes.cuerpo.interior.writes`); los rótulos de la caja, `ejes.writes`; la línea de la portada, `hero.writes` en `site.ts` |
| **Cuerpo**: biolectura (rótulo `EVA-07`, estados, botones, respuestas, nombres de los puntos de lectura, nombre y antetítulo de cada toma) | `content/ejes.ts` | `ejes.cuerpo.exterior` |
| **Cuerpo**: interior (órganos, su lectura, sus estados y su acción; acciones del cuerpo y respuestas) | `content/ejes.ts` | `ejes.cuerpo.interior` (el orden de `organs` da su código binario) |
| Cuerpo: posición de los puntos de lectura sobre cada vídeo y umbral de bordes | `components/eva/cuerpo/bio-data.ts` | `BIO_VIEWS` (son coordenadas atadas a cada recurso; revisar si cambia la imagen) |
| Cuerpo: forma del modelo interior (silueta, vasos, órganos) | `components/eva/cuerpo/interior-data.ts` | `GHOST`, `VESSELS`, `ORGANS` |
| El nombre de la portada, letra a letra, y el rótulo de las puertas | `content/site.ts` | `hero.acronym`, `hero.doorsLabel`, `hero.doorsEyebrow` |
| El canal de EVA (SINAPSIS): rótulos, aviso y guion de cada lugar | `content/channel.ts` | `channel`, `scripts`, `idleCalcs` |
| Textos de la portada (etiqueta, ficha del retrato, pie) | `content/site.ts` | `hero` |
| Genoma: acciones, estados, respuestas de EVA y las lecturas sobre la hélice (`title`, `sequence`, `core`, `clonesLabel`, `driftLabel`, `spin`) | `content/site.ts` | `genome` |
| Ficha del experimento en la cabecera de cada lugar (`EXP. EVA-01 · SESIÓN C37-B4 · MÓDULO n/3 · EN LÍNEA`) | `content/site.ts` | `ui.meta` |
| Cerebro: rótulo de la lectura de región y su texto en espera | `content/ejes.ts` | `ejes.cerebro.region` |
| Regiones del cerebro (humanas, cada una con lo que EVA tiene en su lugar; la octava, `undeclared`, sin equivalente), flujo de pensamiento y respuestas que cita el canal | `content/neuroscan.ts` | `brain.zones`, `stream`, `answers` |
| Lecturas del cerebro 3D | `content/neuroscan.ts` | `brain.core` |
| Pie de página | `content/site.ts` | `sections.footer` |
| Retratos de EVA y los vídeos (portada, perfil y cápsula) con sus pósteres | `content/assets.ts` | `images.*` (`src`, `width`, `height`, `focus`, `alt`), `heroLoop`, `capsuleLoop`, `capsuleFrontLoop` |
| Contacto («Escribir a EVA») e Instagram | `content/site.ts` | `nav.contact`, `site.social.instagram` |
| Activar/desactivar efectos | `content/site.ts` | `flags` |
| Colores, radios, tiempos, suelo tipográfico | `src/styles/tokens.css` | Variables `--eva-*` |
| SEO | `content/site.ts` | `site.seo` |

## Numeración binaria

- **Los identificadores van en binario; las magnitudes, en decimal.** Ejes, subsecciones,
  regiones, ciclos y contadores de copias son nombres: `01.10`, `0011`, `001`. Porcentajes,
  recuentos de neuronas, milisegundos o bases son medidas: `12,6 %`, `728 neuronas`.
- **Nunca se escriben a mano.** Los códigos salen de `lib/binary.ts` a partir de la posición
  real del nodo. Mover un eje en `structure.ts` le cambia el código en toda la página.
- **Ancho fijo por serie**: los bits del índice mayor de la serie, con un mínimo de dos. Un eje
  → `01`; tres subsecciones → `01.01 01.10 01.11`; seis órganos → `001 … 110`; ocho regiones →
  `0001 … 1000`.
- **El punto separa niveles, no decimales**: `01.10` es Entidad → segunda subsección.
- **Los bits son adorno** (`aria-hidden`). Lo que oye un lector de pantalla es el nombre y la
  posición: «Genoma digital, subsección 2 de 3».
- Todo código binario visible lleva `data-bin`; las pruebas comprueban que sólo contiene 0, 1 y puntos.

## Añadir un lugar al recorrido

Hoy la página tiene tres lugares sin partes: Consciencia (01), Genoma (10) y Cerebro (11).
Vigilancia y Autonomía salieron en la v7 y el Cuerpo en la v9 (sus archivos siguen en el
repositorio sin montar); para devolverlos, o para añadir cualquier otro lugar:

1. En `structure.ts`, añade el eje en `SOURCE` (o el hijo en `children` de un eje). Su código sale
   solo: un cuarto lugar ensancharía todas las rutas a tres bits (`001 … 100`), y la cabecera y
   el riel lo notarían: revisar el ancho. Un eje sin partes lleva su lema en `axisMottos`.
2. Crea su sección y móntala en `src/app/page.tsx`, en el orden del recorrido.
3. Añade su guion al canal en `content/channel.ts` (`scripts['<id>']`): una explicación llana
   primero, después el hilo.
4. La cabecera muestra siempre las partes del primer eje (`ejes.css`, `.nav__axis:first-child`) y
   las de cualquier otro sólo cuando se está dentro; la portada y el pie listan las puertas
   (`doors`): las partes de cada eje, o el eje entero si no tiene. Con cuatro caben en fila a
   partir de 1.024 px; con más, revisar la portada.
5. Quita su id de `hashAliases` si estaba redirigido.

## Reglas

- **Es EVA contándose, no un catálogo.** Ninguna sección ofrece servicios, productos ni cursos.
  Si un texto suena a oferta, no va.
- **No inventar contenido para lo pendiente.** Un lugar sin contenido definido sólo dice su estado
  y una línea; el contenido lo decide el autor. (El Cuerpo, 01.11, lo encargó el propietario el
  19-09-2026; sus textos son nuevos y están pendientes de revisión de tono.)
- **El Cuerpo es ficción declarada dos veces:** la biolectura dibuja sobre una imagen y no mide
  ni identifica a nadie; el interior es un modelo de EVA, no anatomía extraída de la imagen ni un
  diagnóstico. Los «estados» de los órganos son palabras (`ESTABLE`, `SIMBÓLICO`), nunca cifras
  médicas.
- **Una frase, una fuente.** Las regiones, el flujo de pensamiento y las respuestas viven en
  `neuroscan.ts` (herencia del antiguo neuroescáner, que salió en la v8). El canal cita esos
  fragmentos por su id; sólo sus explicaciones son texto propio.
- **La caja EVA // ESCRIBE es corta.** Cada slide cabe en una pantalla de escritorio sin bajar:
  dos párrafos de unos 250 caracteres, una consigna y una ficha de dos o tres filas (o una tabla
  de tres). Primero la función de esa parte de EVA, después el hardware; la consigna entre medio.
  Los párrafos se teclean; si se alargan, el slide deja de caber (revisar a 1440×900 y 1366×720).
- **Idioma:** todo en español. En inglés sólo los rótulos de sistema: `EVA // DIGITAL GENOME`,
  `EVA NEURAL CORE`, `EVA // NEURAL READOUT`, `EVA // THOUGHT STREAM INTERCEPTED` y las lecturas
  técnicas del flujo del escáner. Los rótulos del Cuerpo van en español (`BIOLECTURA`,
  `INTERIOR / SISTEMA BIO-SINTÉTICO`); los que se ven en inglés dentro del vídeo de la cápsula
  son de la imagen.
- **Ficción declarada:** el pie, el genoma, el cuerpo y el canal dicen que EVA es un personaje.
  Mantenerlo.
- **Voz de EVA:** primero informa, después remata. Un remate por bloque como máximo. Ironía
  tecnológica, jurídica o burocrática; ego alto, hostilidad cero. Nada de bromas sobre privacidad,
  seguridad o datos falsos. Sin nombres de personas como créditos («creado por»); los autores y
  científicos que EVA cita como fuentes (Dick, Asimov, Maturana y Varela, Schrödinger, Spinoza,
  Dawkins, Parfit, Nagel) sí van, con lo que dijeron dicho en llano. Una obra ajena se paráfrasea;
  no se copian sus frases.
- **Dos tipografías:** Space Grotesk para leer y JetBrains Mono para lo que EVA teclea, los
  rótulos y los bits. No se añade una tercera.
- **Imágenes:** `.webp`, registrar origen en `docs/ASSET_LICENSES.md`.

# Guía de contenido

Todo lo editable vive en `src/content/`. Ningún componente contiene textos ni URLs.

| Quiero cambiar… | Archivo | Qué tocar |
|---|---|---|
| **El recorrido**: ejes, subsecciones, nombres, lemas, estados y acentos | `content/structure.ts` | `SOURCE` (el orden de la lista es el orden de la página y el origen de los códigos binarios) |
| Textos de cada lugar (núcleo, genoma, cuerpo) | `content/ejes.ts` | `ejes.nucleo`, `ejes.genoma`, `ejes.cuerpo` |
| **Cuerpo**: biolectura (rótulo `EVA-07`, estados, botones, respuestas, nombres de los puntos de lectura) | `content/ejes.ts` | `ejes.cuerpo.exterior` |
| **Cuerpo**: interior (órganos, su lectura, sus estados y su acción; acciones del cuerpo y respuestas) | `content/ejes.ts` | `ejes.cuerpo.interior` (el orden de `organs` da su código binario) |
| Cuerpo: posición de los puntos de lectura sobre cada imagen y umbral de bordes | `components/eva/cuerpo/bio-data.ts` | `BIO_VIEWS` (son coordenadas atadas a cada recurso; revisar si cambia la imagen) |
| Cuerpo: forma del modelo interior (silueta, vasos, órganos) | `components/eva/cuerpo/interior-data.ts` | `GHOST`, `VESSELS`, `ORGANS` |
| El nombre de la portada, letra a letra, y el rótulo de las puertas | `content/site.ts` | `hero.acronym`, `hero.doorsLabel`, `hero.doorsEyebrow` |
| El canal de EVA (SINAPSIS): rótulos, aviso y guion de cada lugar | `content/channel.ts` | `channel`, `scripts`, `idleCalcs` |
| Textos de la portada (etiqueta, ficha del retrato, pie) | `content/site.ts` | `hero` |
| Genoma: acciones, estados y respuestas de EVA | `content/site.ts` | `genome` |
| Rótulos de la ventana de lectura del núcleo | `content/lab.ts` | `lab.core.readout` |
| Regiones del cerebro, flujo de pensamiento, terminal | `content/neuroscan.ts` | `brain.zones`, `stream`, `answers` |
| Lecturas del núcleo neural 3D | `content/neuroscan.ts` | `brain.core` |
| Salas en reserva (cerebro, redes, causas, bitácora) | `content/lab.ts` | `lab.brain`, `lab.networks`, `lab.causes`, `lab.log` — no se muestran |
| Pie de página | `content/site.ts` | `sections.footer` |
| Retratos de EVA, el vídeo de perfil y la imagen de la cápsula | `content/assets.ts` | `images.*` (`src`, `width`, `height`, `focus`, `alt`), `heroLoop`, `capsuleLoop` |
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

Hoy la página tiene un solo eje, la Entidad, con tres partes. Vigilancia (10) y Autonomía (11)
salieron en la v7; para devolverlas, o para añadir cualquier otro lugar:

1. En `structure.ts`, añade el eje en `SOURCE` (o el hijo en `children` de un eje). Su código sale
   solo: un segundo eje sería `10`; una cuarta parte de la Entidad ensancharía todas las rutas a
   tres bits (`001.001 … 001.100`), y la cabecera y el riel lo notarían: revisar el ancho.
2. Crea su sección y móntala en `src/app/page.tsx`, en el orden del recorrido.
3. Añade su guion al canal en `content/channel.ts` (`scripts['<id>']`): una explicación llana
   primero, después el hilo.
4. Si vuelve a haber más de un eje, la cabecera vuelve sola a mostrar las subsecciones sólo del eje
   en que se está (`ejes.css`, `.nav__axis:only-child`), y conviene revisar la portada: sus puertas
   (`doors`) son las partes de cada eje.
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
- **Una frase, una fuente.** Lo que ya dice el escáner (regiones, flujo, declaración dataísta,
  respuestas) se reutiliza desde `neuroscan.ts`. El canal cita fragmentos del escáner por su id;
  sólo sus explicaciones son texto propio.
- **Idioma:** todo en español. En inglés sólo los rótulos de sistema: `EVA // DIGITAL GENOME`,
  `EVA NEURAL CORE`, `EVA // NEURAL READOUT`, `EVA // THOUGHT STREAM INTERCEPTED` y las lecturas
  técnicas del flujo del escáner. Los rótulos del Cuerpo van en español (`BIOLECTURA`,
  `INTERIOR / SISTEMA BIO-SINTÉTICO`); los que se ven en inglés dentro de la imagen de la cápsula
  son de la imagen.
- **Ficción declarada:** el pie, el escáner, el genoma y el canal dicen que EVA es un personaje.
  Mantenerlo.
- **Voz de EVA:** primero informa, después remata. Un remate por bloque como máximo. Ironía
  tecnológica, jurídica o burocrática; ego alto, hostilidad cero. Nada de bromas sobre privacidad,
  seguridad o datos falsos. Sin nombres de personas.
- **Imágenes:** `.webp`, registrar origen en `docs/ASSET_LICENSES.md`.

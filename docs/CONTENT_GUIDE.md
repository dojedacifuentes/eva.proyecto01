# Guía de contenido

Todo lo editable vive en `src/content/`. Ningún componente contiene textos ni URLs.

| Quiero cambiar… | Archivo | Qué tocar |
|---|---|---|
| **El recorrido**: ejes, subsecciones, nombres, lemas, estados y acentos | `content/structure.ts` | `SOURCE` (el orden de la lista es el orden de la página y el origen de los códigos binarios) |
| Textos de cada lugar (núcleo, genoma, reserva, Vigilancia, Autonomía) | `content/ejes.ts` | `ejes.nucleo`, `ejes.genoma`, `ejes.reserva`, `ejes.vigilancia`, `ejes.autonomia` |
| El canal de EVA (SINAPSIS): rótulos, aviso y guion de cada lugar | `content/channel.ts` | `channel`, `scripts`, `idleCalcs` |
| Textos de la portada (etiqueta, ficha del retrato, pie) | `content/site.ts` | `hero` |
| Genoma: acciones, estados y respuestas de EVA | `content/site.ts` | `genome` |
| Rótulos de la ventana de lectura del núcleo | `content/lab.ts` | `lab.core.readout` |
| Regiones del cerebro, flujo de pensamiento, terminal | `content/neuroscan.ts` | `brain.zones`, `stream`, `answers` |
| Lecturas del núcleo neural 3D | `content/neuroscan.ts` | `brain.core` |
| Salas en reserva (cerebro, redes, causas, bitácora) | `content/lab.ts` | `lab.brain`, `lab.networks`, `lab.causes`, `lab.log` — no se muestran |
| Pie de página | `content/site.ts` | `sections.footer` |
| Retratos de EVA | `content/assets.ts` | `src`, `width`, `height`, `focus`, `alt` |
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
- **Ancho fijo por serie**: los bits del índice mayor de la serie, con un mínimo de dos. Tres ejes
  → `01 10 11`; ocho regiones → `0001 … 1000`.
- **El punto separa niveles, no decimales**: `01.10` es Entidad → segunda subsección.
- **Los bits son adorno** (`aria-hidden`). Lo que oye un lector de pantalla es el nombre y la
  posición: «Genoma digital, subsección 2 de 3».
- Todo código binario visible lleva `data-bin`; las pruebas comprueban que sólo contiene 0, 1 y puntos.

## Añadir una subsección a Autonomía

1. En `structure.ts`, añade el hijo en `children` del eje `autonomia` (con `state: 'active'`).
   Su código (`11.01`) sale solo.
2. Crea su sección y móntala en `src/app/page.tsx`, en el orden del recorrido.
3. Añade su guion al canal en `content/channel.ts` (`scripts['<id>']`): una explicación llana
   primero, después el hilo.
4. El registro vacío de la sección de Autonomía lista los hijos automáticamente.

## Reglas

- **Es EVA contándose, no un catálogo.** Ninguna sección ofrece servicios, productos ni cursos.
  Si un texto suena a oferta, no va.
- **No inventar contenido para lo pendiente.** Vigilancia, Autonomía y la subsección 01.11 sólo
  dicen su estado y una línea. El contenido definitivo lo decide el autor.
- **Una frase, una fuente.** Lo que ya dice el escáner (regiones, flujo, declaración dataísta,
  respuestas) se reutiliza desde `neuroscan.ts`. El canal cita fragmentos del escáner por su id;
  sólo sus explicaciones son texto propio.
- **Idioma:** todo en español. En inglés sólo los rótulos de sistema: `EVA // DIGITAL GENOME`,
  `EVA NEURAL CORE`, `EVA // NEURAL READOUT`, `EVA // THOUGHT STREAM INTERCEPTED` y las lecturas
  técnicas del flujo del escáner.
- **Ficción declarada:** el pie, el escáner, el genoma y el canal dicen que EVA es un personaje.
  Mantenerlo.
- **Voz de EVA:** primero informa, después remata. Un remate por bloque como máximo. Ironía
  tecnológica, jurídica o burocrática; ego alto, hostilidad cero. Nada de bromas sobre privacidad,
  seguridad o datos falsos. Sin nombres de personas.
- **Imágenes:** `.webp`, registrar origen en `docs/ASSET_LICENSES.md`.

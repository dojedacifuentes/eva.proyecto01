# Auditoría final — landing de EVA v2.0

**Fecha:** 2026-09-18 · **Rama:** `landing-eva-v2` · Actualizada después de la segunda pasada de corrección.

## Línea base vs. resultado

| | v0.1 (`main`) | v2.0 |
|---|---|---|
| Arquitectura | 5 capítulos + panel, 6 rutas vacías | 4 universos en una página con anclas |
| Identidad | «proyecto de exploración» | Entidad Virtual de Aprendizaje, acrónimo vertical en el hero |
| Contenido real enlazado | Instagram | Microcurso, Prompt Lab, FORO [in]VISIBLE, Instagram |
| Retrato de EVA | ninguno | 2, con ruta centralizada |
| Interacción | tema claro/oscuro, ⌘K | fondo reactivo, cursor de señal, sonido opt-in, menú móvil |
| Dependencias | next, react | las mismas (0 nuevas) |
| JS de cliente propio | 3 componentes | 5 componentes pequeños (campo, cursor, sonido, rotador, menú) |

## Segunda pasada: hallazgos sobre la primera implementación y corrección

| # | Sev. | Hallazgo | Evidencia | Corrección |
|---|---|---|---|---|
| F1 | **P1** | El menú móvil se abría como una franja de 60 px y dejaba ver el hero | Captura a 390 px. `backdrop-filter` del header lo convertía en bloque contenedor del `position: fixed` | Menú `absolute` bajo el header con alto `100dvh − header`; fondo opaco. Reverificado: abre, Escape cierra y devuelve el foco al botón |
| F2 | P2 | Las palabras del acrónimo no quedaban alineadas (E, V y A tienen anchos distintos) | Captura a 1440 px | Columna de letra con ancho fijo `clamp()` |
| F3 | P2 | La portada abstracta del destacado no mostraba sus barras | Alturas en % sobre contenedor con `min-height` | Alto definido en `.skyline` |
| F4 | P2 | `<dd>` antes de `<dt>` en los contadores | Revisión de DOM | Orden semántico correcto + `column-reverse` visual |
| F5 | P3 | Las fichas en concepto repetían «Aún no disponible» | Captura de Arcade | Etiqueta superior «En cola» |
| F6 | P3 | `tsc` fallaba por tipos antiguos en `.next/` de las rutas eliminadas | Salida de `tsc` | Se regeneran con `next build`; no es un fallo del código |

## Tercera pasada (refinamiento)

- Navegación con sección activa (`NavSpy`, `aria-current`), verificada al desplazarse a Arcade.
- Parallax leve del retrato (±7 px, desactivado con movimiento reducido).
- Página 404 con la voz de EVA (`src/app/not-found.tsx`, textos en `content/site.ts`).
- Foco por teclado comprobado visualmente: anillo con el acento del universo.

**P0 restantes: 0. P1 restantes: 0.**

## Hallazgos abiertos

| Sev. | Hallazgo | Motivo |
|---|---|---|
| P2 | CTA institucional desactivado | No existe destino de contacto aprobado; no se inventa. Instagram como canal temporal |
| P2 | Permiso de publicación de los retratos sin confirmar por escrito | Registrado en `ASSET_LICENSES.md` |
| P3 | En móvil el retrato va antes que la definición (el prompt sugería después) | Decisión visual: la primera pantalla gana presencia; acrónimo y estado siguen primero |
| P3 | Sin favicon | No hay isotipo oficial |
| P3 | Revelado por scroll sin efecto en Firefox | Mejora progresiva; el contenido se ve igual |
| P3 | Sin tests automatizados | Fuera del alcance del MVP; ver roadmap |

## Criterios de aceptación

| # | Criterio | Estado |
|---|---|---|
| 1 | Compila | Cumplido |
| 2 | Comunica qué es EVA en segundos | Cumplido |
| 3 | Cuatro universos distinguibles | Cumplido (acento + textura + intención) |
| 4 | Prompting en Academy y Lab sin duplicar datos | Cumplido (`eva-prompting` + `contexts`) |
| 5 | FORO [in]VISIBLE enlazado desde Arcade | Cumplido (HTTP 200) |
| 6 | Cierre sin nombres de personas | Cumplido (búsqueda en `src/`: sin coincidencias) |
| 7 | Contenido y enlaces centralizados | Cumplido (`src/content/`) |
| 8 | Imágenes reemplazables en un punto | Cumplido (`content/assets.ts`, con reserva si `src` está vacío) |
| 9 | Móvil, tablet, escritorio | Cumplido (390, 768, 1440) |
| 10 | Sin scroll horizontal | Cumplido (`scrollWidth ≤ innerWidth` en los tres anchos) |
| 11 | Foco visible | Cumplido (`:focus-visible` con el acento del universo) |
| 12 | `prefers-reduced-motion` | Cumplido por código: CSS global, campo estático, cursor nativo, rotador detenido. **No se pudo emular en el navegador de pruebas** |
| 13 | Consola sin errores | Cumplido |
| 14 | lint / typecheck / build | Cumplido |
| 15 | Roadmap | Cumplido |
| 16 | Conceptos no presentados como productos | Cumplido (fichas punteadas, sin enlace; demos rotuladas) |
| 17 | No parece SaaS ni portafolio | Cumplido a juicio propio; pendiente de validación del propietario |
| 18–19 | Acrónimo vertical y orden accesible | Cumplido (`h1` lineal + acrónimo `aria-hidden`; un solo `h1`) |
| 20–21 | Misión clara; fin último como remate | Cumplido |
| 22 | Sin «News Teller» / «Newsletter» | Cumplido (búsqueda sin coincidencias) |
| 23–25 | Auditoría inicial, final y segunda pasada | Cumplido |
| — | Audio apagado al cargar, con control visible | Cumplido (el `AudioContext` se crea con el primer clic) |
| — | Cursor desactivado en táctil | Cumplido por código (`hover: hover` y `pointer: fine`); no verificado en dispositivo físico |

## Pruebas ejecutadas

| Comando / prueba | Resultado |
|---|---|
| `npm run lint` | correcto, sin avisos |
| `npm run typecheck` | correcto |
| `npm run build` | correcto — `/`, OG, robots, sitemap, todo estático |
| Tests | no existen |
| Enlaces externos (curl) | `/curso` 200 · `/prompt-lab` 200 · `/juego` 200 · Instagram 200 |
| Visual 1440×900, 768×1024, 390×844 | hero, universos, destacado, EVA News, archivo, cierre |
| Botones táctiles < 44 px (390 px) | ninguno, salvo el enlace de salto (sólo visible con foco) |
| Menú móvil | abre, cierra con Escape, devuelve el foco |

## Limitaciones reales

- La revisión de repositorios externos fue sobre su información pública; no se clonaron porque no se adoptó código de ninguno.
- No se probó en Safari iOS ni con lector de pantalla real.
- No se midió Lighthouse.
- Los textos de humor son una propuesta de voz; conviene que el propietario los revise antes de publicar.

## Mejoras siguientes, por impacto

1. Definir `site.contact.href` y activar el CTA.
2. Sustituir las entradas demo por 2–3 noticias reales con fuente.
3. Capturas reales de Prompt Lab y FORO [in]VISIBLE en las fichas y el destacado.
4. Isotipo → favicon y Open Graph definitivos.
5. Página `/news` cuando haya volumen, alimentada por MDX.

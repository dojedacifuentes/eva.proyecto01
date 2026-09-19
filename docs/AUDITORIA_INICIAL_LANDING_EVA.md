# Auditoría inicial — landing de EVA

**Fecha:** 2026-09-18 · **Rama base:** `main` @ `de4c587` · **Rama de trabajo:** `landing-eva-v2`

## Línea base

| Comprobación | Resultado |
|---|---|
| `git status` | limpio, sin cambios locales |
| `npm install` | correcto |
| `npm run lint` | correcto, sin avisos |
| `npm run build` | correcto — 9 rutas estáticas (`/`, `/cursos`, `/estudios-juridicos`, `/eva`, `/informes`, `/panel`, `/prototipos`, OG, robots, sitemap) |
| Typecheck / tests | no existían scripts |

**Stack encontrado:** Next.js 16 (App Router) · React 19 · TypeScript estricto · Tailwind CSS 4 · Geist.
Sin librerías de animación, 3D ni audio. **Decisión: conservar el stack**; es coherente,
es el mismo de `evaprompts` y despliega en Vercel sin configuración.

**Instrucción del propietario:** no conservar la landing v0.1; rehacerla completa.
El historial de `main` la mantiene recuperable.

## Hallazgos

| # | Área | Evidencia | Afecta | Sev. | Impacto | Acción | Estado |
|---|---|---|---|---|---|---|---|
| 1 | Arquitectura de información | La v0.1 se organiza en «capítulos»: cursos, prototipos, informes, estudios jurídicos, panel | `src/data/eva.ts`, rutas | P1 | No existen Academy / EVA News / Arcade / Lab; contradice la arquitectura definida | Rehacer sobre cuatro universos | Corregir ahora |
| 2 | Identidad | «EVA» se presenta como proyecto de exploración, no como entidad; el acrónimo no aparece | `Hero`, `README` | P1 | No se entiende qué es EVA en 10 s | Hero con acrónimo vertical + h1 accesible | Corregir ahora |
| 3 | Contenido | Colecciones vacías (`collections.ts`) y seis rutas interiores con estado vacío | `src/app/*/page.tsx` | P1 | Rutas que aparentan profundidad sin contenido | Una sola página con anclas | Corregir ahora |
| 4 | Narrativa | «Estudios jurídicos» como sección principal | `/estudios-juridicos` | P2 | Equivale a «EVA Legal», descartada | Integrar lo jurídico en Academy, Arcade y Lab | Corregir ahora |
| 5 | Sistema visual | Paleta cálida (`#16130f`, naranja `#fd7c46`), tema claro/oscuro | `globals.css`, `theme.ts` | P2 | No coincide con el lenguaje de `evaprompts` (negro profundo, cian) | Tokens nuevos, sólo oscuro | Corregir ahora |
| 6 | Imagen de EVA | Ningún retrato en el repositorio (no hay `public/`) | — | P1 | El hero carece de presencia visual | Incorporar retratos entregados, ruta centralizada | Corregir ahora |
| 7 | Interacción | Sin fondo reactivo, cursor ni sonido | — | P3 | Falta la capa «interfaz viva» pedida | Canvas propio + cursor propio + audio opt-in | Corregir ahora |
| 8 | Calidad técnica | Sin script de typecheck | `package.json` | P3 | Verificación incompleta | Añadir `typecheck` | Corregir ahora |
| 9 | Aprovechable | `lib/site.ts` (URL pública), patrón robots/sitemap, enlace real de Instagram, datos centralizados en `src/data` | — | — | Buenas decisiones previas | Conservar el patrón | Conservar |
| 10 | Favicon | `icon.svg` naranja de la identidad anterior | `src/app/icon.svg` | P3 | Incoherente con la marca nueva; no hay isotipo oficial | Retirar; no inventar uno | Corregir ahora |
| 11 | Contacto | Único canal público verificable: Instagram | `eva.ts` | P2 | No hay correo ni formulario aprobados | CTA desactivado + Instagram como canal temporal | Corregir ahora |

## Hipótesis de mejora

**Problema principal:** la v0.1 es un marco editorial vacío que no dice qué es EVA ni conduce a lo
que ya existe y funciona (Prompt Lab, microcurso, FORO [in]VISIBLE).

**Principios de diseño**

1. *El acrónimo es el hero.* E-V-A en vertical, en HTML, antes que cualquier otra cosa.
2. *Un acento, una textura, una intención por universo.* Sin iconos; la diferencia es tipográfica y cromática.
3. *Honestidad de estado.* Lo que no existe se rotula «Concepto» y no lleva enlace; las cifras se calculan.

**De `evaprompts` se conserva:** negro profundo, cian estructural, bordes finos, etiquetas
monoespaciadas, Space Grotesk, radios contenidos. **Se reinterpreta:** la barra lateral de
laboratorio pasa a un header abierto; el avatar pequeño pasa a retrato protagonista.

**Estructura y prioridad:** header → hero (estado, acrónimo, retrato, misión, acciones) →
selector de universos → destacado → identidad de EVA → Academy → EVA News → Arcade → Lab →
archivo → cierre institucional → footer.

**Definitivo:** cuatro universos, nombre «EVA News», acrónimo, stack. **Provisional:** copys de
humor, retratos, entradas demo de noticias, OG. **Pendiente del propietario:** destino de
contacto, repositorio del juego, isotipo.

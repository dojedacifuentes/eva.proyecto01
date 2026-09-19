# Guía de contenido

Todo lo editable vive en `src/content/`. Ningún componente contiene textos ni URLs.

| Quiero cambiar… | Archivo | Qué tocar |
|---|---|---|
| Textos de la portada (acrónimo, pie, ficha del retrato) | `content/site.ts` | `hero` |
| Genoma: acciones y respuestas de EVA | `content/site.ts` | `genome` |
| Salas del laboratorio: orden, nombres y acentos | `content/lab.ts` | `rooms` |
| Origen, cerebro, redes, causas, bitácora | `content/lab.ts` | `lab.origin`, `lab.brain`, `lab.networks`, `lab.causes`, `lab.log` |
| Preguntas del interrogatorio de la bitácora | `content/lab.ts` + `content/neuroscan.ts` | `lab.log.questions` elige ids de `neuroscan.answers` |
| Regiones del cerebro, flujo de pensamiento, terminal | `content/neuroscan.ts` | `brain.zones`, `stream`, `answers` (las salas los reutilizan) |
| Lecturas del núcleo neural 3D | `content/neuroscan.ts` | `brain.core` |
| Pie de página | `content/site.ts` | `sections.footer` |
| Retratos de EVA | `content/assets.ts` | `src`, `width`, `height`, `focus`, `alt` |
| Contacto («Escribir a EVA») e Instagram | `content/site.ts` | `nav.contact`, `site.social.instagram` |
| Activar/desactivar efectos | `content/site.ts` | `flags` |
| Colores, radios, tiempos | `src/styles/tokens.css` | Variables `--eva-*` |
| SEO | `content/site.ts` | `site.seo` |

## Reglas

- **Es EVA contándose, no un catálogo.** Ninguna sala ofrece servicios, productos ni cursos.
  Si un texto suena a oferta, no va.
- **Una frase, una fuente.** Lo que ya dice el escáner (regiones, declaración dataísta,
  respuestas) se reutiliza desde `neuroscan.ts`; no se reescribe en `lab.ts`.
- **Ficción declarada:** el pie y el escáner dicen que EVA es un personaje. Mantenerlo.
- **Voz de EVA:** primero informa, después remata. Un remate por bloque como máximo. Ironía
  tecnológica, jurídica o burocrática; ego alto, hostilidad cero. Nada de bromas sobre privacidad,
  seguridad o datos falsos. Sin nombres de personas.
- **Imágenes:** `.webp`, registrar origen en `docs/ASSET_LICENSES.md`.

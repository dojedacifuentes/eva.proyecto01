# Guía de contenido

Todo lo editable vive en `src/content/`. Ningún componente contiene textos ni URLs.

| Quiero cambiar… | Archivo | Qué tocar |
|---|---|---|
| Textos del hero, misión, fin último, frases rotativas | `content/site.ts` | `hero` |
| Texto «Conocer a EVA» | `content/site.ts` | `about` |
| Títulos de sección, cierre institucional, footer | `content/site.ts` | `sections` |
| Nombre de EVA News | `content/site.ts` | `NEWS_NAME` |
| Noticias | `content/news.ts` | Añadir objeto; noticia real = `demo: false` + `source` + `sourceUrl` |
| Universos (nombre, bajada, acento, remate) | `content/modules.ts` | `modules` |
| Proyectos, enlaces y estados | `content/projects.ts` | Un objeto por proyecto; `contexts` por universo |
| Proyecto destacado | `content/projects.ts` | `featured: true` (gana el primero con enlace real) |
| Rutas y biblioteca, temas | `content/resources.ts` | `resources`, `topics`, `libraryItems` |
| Retratos de EVA | `content/assets.ts` | `src`, `width`, `height`, `focus`, `alt` |
| Destino del CTA institucional | `content/site.ts` | `site.contact.href` (vacío = botón desactivado) |
| Instagram | `content/site.ts` | `site.social.instagram` |
| Activar/desactivar secciones y efectos | `content/site.ts` | `flags` |
| Colores, radios, tiempos | `src/styles/tokens.css` | Variables `--eva-*` |
| SEO | `content/site.ts` | `site.seo` |

## Reglas

- **Un proyecto, un objeto.** Si aparece en dos universos, se añade a `modules` y se describe en
  `contexts`; nunca se duplica. Ejemplo: `eva-prompting` (Academy → `/curso`, Lab → `/prompt-lab`).
- **Estados:** `available`, `prototype`, `in-development`, `concept`. Sin `href` http(s) real la
  ficha se dibuja punteada y sin enlace. No usar `#` ni URLs supuestas.
- **Cifras:** el archivo y las tarjetas cuentan desde las colecciones (`lib/content.ts`). Los
  conceptos y las entradas demo no suman.
- **Voz de EVA:** primero informa, después remata. Un remate por bloque como máximo. Ironía
  tecnológica, jurídica o burocrática; ego alto, hostilidad cero. Nada de bromas sobre privacidad,
  seguridad o datos falsos. Sin nombres de personas.
- **Imágenes:** `.webp`, registrar origen en `docs/ASSET_LICENSES.md`.

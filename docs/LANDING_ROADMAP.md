# Roadmap de la landing

## Decisiones tomadas

- Cuatro universos: Academy, EVA News, Arcade, Lab. Sin «Legal» ni «Studio».
- Stack conservado: Next.js 16 · React 19 · TypeScript · Tailwind 4. Cero dependencias nuevas.
- Una sola página con anclas; sin rutas interiores hasta que tengan contenido.
- Movimiento sólo con CSS; un canvas 2D propio; cursor propio; audio sintetizado y opt-in.
- Sólo tema oscuro. Cierre institucional sin nombres de personas.

## Provisional

- Copys de humor de EVA (`content/site.ts`, `content/modules.ts`).
- Retratos actuales (confirmar permiso de publicación en `ASSET_LICENSES.md`).
- Dos entradas **demo** en EVA News.
- Portada abstracta «skyline» del destacado, hasta tener captura real del juego.
- Imagen Open Graph generada (acrónimo sobre negro).
- CTA institucional desactivado; Instagram como canal temporal.

## Pendiente del propietario

1. `site.contact.href`: correo, formulario o WhatsApp definitivo.
2. URL del repositorio del juego (`TODO_GAME_REPOSITORY_URL` en `projects.ts`; hoy no se muestra).
3. Isotipo oficial → favicon (`src/app/icon.svg`) y OG definitiva.
4. Dominio propio → variable `NEXT_PUBLIC_SITE_URL` en Vercel.

## Imágenes pendientes

Miniatura del microcurso · captura de Prompt Lab · escena de FORO [in]VISIBLE · portadas de
noticias. Los tipos ya admiten `image` y `alt`; falta el tratamiento visual en `EntryCard`.

## Contenidos pendientes

Primeras noticias reales con fuente · ruta «IA desde cero» · primeros recursos de biblioteca
(`libraryItems`) · más rutas (Derecho, docentes, primera herramienta).

## Páginas interiores posibles

`/news` y `/news/[slug]` cuando haya ≥ 4 noticias reales (entonces aparece «Ver todas las
señales») · `/academy` con biblioteca filtrable · `/arcade` · `/lab`.

## Mejoras de movimiento e interacción

- Línea de señal que conecte hero y selector de universos.
- Campo con ruido procedural (WebGL) con fallback al canvas actual.
- Más microsonidos por universo; evaluar Howler si se pasa a archivos de audio.

## Integraciones futuras

Noticias desde MDX o CMS (el tipo `NewsItem` ya es el contrato) · formulario de contacto con
backend aprobado · analítica respetuosa de la privacidad.

## Deuda técnica real

- `EvaField` y `EvaSignalCursor` usan cada uno su propio `requestAnimationFrame`; el del cursor
  sólo corre mientras hay movimiento. Unificarlos si se añade una tercera capa.
- Sin tests automatizados. Primer candidato: `lib/content.ts` (proyecciones y contadores).
- El revelado por scroll depende de `animation-timeline`; en Firefox el contenido aparece sin animación.

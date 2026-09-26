@AGENTS.md

# EVA: por dónde empezar

- Estado real y trampas conocidas: `docs/HANDOFF.md` (léelo entero antes de tocar nada; §0.0 a
  §0.0.4 son la v9 hasta la v9.4, la que está en producción; §0–§0.2, la v8.2 anterior).
- **v9.4 en `main` y publicada** (24-09-2026): la v9.3 más la marca y la calidad adaptativa en
  todas las escenas. Desde la v9.3 (textos del dilema reescritos): cuatro lugares —Consciencia `001`, Genoma `010`,
  Cerebro `011`, Cuerpo `100`—, la Consciencia abre la página y el Cuerpo la cierra en una sola
  pantalla (el perfil con su biolectura; la cápsula y el interior 3D siguen sin montar). Toda la
  interacción del genoma y del campo de consciencia se conserva: si hay que aligerar, se encogen
  los botones, no se quitan. Rendimiento: calidad adaptativa (`src/lib/quality.ts`), el fondo
  cede ante la Consciencia, luz del puntero por compositor.
- EVA escribe cada slide en una caja (`EvaWrites`); lo que dice vive en `src/content/ejes.ts`
  (`writes`) y en `src/content/consciencia.ts`; la voz y los límites de largo, en
  `docs/CONTENT_GUIDE.md`.
- **La marca** (el símbolo □X y el nombre ƎVΛ son las mismas ocho piezas): geometría en
  `src/lib/brand.ts`, guía en `docs/MARCA.md`. El logotipo de cabecera y pie, el nombre en malla
  de la portada, los iconos y la vista previa para redes salen de ahí.
- **`/links`** (publicada el 24-09-2026): EVA ARCADE, la puerta desde las redes, en
  `src/app/links/` y `src/components/links/`; textos en `src/content/links.ts`. No pasa por el
  marco de la landing (`SiteChrome`, que montan `app/(eva)/layout.tsx` y la 404). HANDOFF §0.0.5.
  Desde el 26-09 (publicado) lleva también EVA ACADEMY y EVA LAB, que
  enlazan a evaprompts; y el sitio entero, la estadística de Vercel (§0.0.6).
- **EVA LAB** (evaprompts, `../eva.prompts`) y los dos juegos del Arcade (`../eva.game.proce-main`,
  `../famialiarpg`) llevan la marca de EVA. Su logotipo sale de aquí: `node scripts/brand-assets.mjs
  --kit <repositorio>`; no se copia la geometría. El clon `../eva.game.proce` tiene trabajo ajeno sin
  guardar: no tocarlo (§0.0.7).
- **Sistema de contenido** (26-09-2026, rama `feat/eva-content-system` hasta el «sí»): cuatro
  dimensiones (Entity · Arcade · Academy · Lab), guía en `docs/CONTENT_SYSTEM.md`. Herramientas de
  Lab sin dependencias en `scripts/` (marca a fotogramas, SVG → PNG con Chrome, campo de partículas,
  transmisiones) y el EVA Social Studio en `tools/social-studio/` (doble clic en su `index.html`;
  se regenera con `npm run studio`). El paquete de origen —auditoría, Brand OS, banco de ideas,
  piezas de Instagram y LinkedIn— está en `../EVA_CONTENT_SYSTEM_v1/`. HANDOFF §0.0.8.
- Los vídeos e imágenes de `public/eva/` son del propietario: no se borran aunque dejen de usarse.
- No integrar en `main` ni publicar sin el «sí» del propietario.

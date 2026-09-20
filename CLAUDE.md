@AGENTS.md

# EVA: por dónde empezar

- Estado real y trampas conocidas: `docs/HANDOFF.md` (léelo entero antes de tocar nada; §0.0 a
  §0.0.2 son la v9.2, la que está en producción; §0–§0.2, la v8.2 anterior).
- **v9.2 en `main` y publicada** (20-09-2026): cuatro lugares —Consciencia `001`, Genoma `010`,
  Cerebro `011`, Cuerpo `100`—, la Consciencia abre la página y el Cuerpo la cierra en una sola
  pantalla (el perfil con su biolectura; la cápsula y el interior 3D siguen sin montar). Toda la
  interacción del genoma y del campo de consciencia se conserva: si hay que aligerar, se encogen
  los botones, no se quitan. Rendimiento: calidad adaptativa (`src/lib/quality.ts`), el fondo
  cede ante la Consciencia, luz del puntero por compositor.
- EVA escribe cada slide en una caja (`EvaWrites`); lo que dice vive en `src/content/ejes.ts`
  (`writes`) y en `src/content/consciencia.ts`; la voz y los límites de largo, en
  `docs/CONTENT_GUIDE.md`.
- Los vídeos e imágenes de `public/eva/` son del propietario: no se borran aunque dejen de usarse.
- No integrar en `main` ni publicar sin el «sí» del propietario.

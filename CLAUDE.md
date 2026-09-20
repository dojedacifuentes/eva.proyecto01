@AGENTS.md

# EVA: por dónde empezar

- Estado real y trampas conocidas: `docs/HANDOFF.md` (léelo entero antes de tocar nada; §0.0 es
  la v9, en curso; §0 es la v8.2, la que está en producción).
- **v9 en `feat/v9-consciencia`, sin publicar**: tres lugares —Consciencia `01`, Genoma `10`,
  Cerebro `11`—, la Consciencia abre la página y el Cuerpo sale del recorrido (sus archivos se
  conservan sin montar). Toda la interacción del genoma y del campo de consciencia se conserva:
  si hay que aligerar, se encogen los botones, no se quitan.
- **v8.2 en `main` y publicada** (20-09-2026): EVA escribe cada slide en una caja (`EvaWrites`),
  cada slide cabe en una pantalla de escritorio, el neuroescáner ya no existe. Lo que EVA dice vive
  en `src/content/ejes.ts` (`writes`) y en `src/content/consciencia.ts`; la voz y los límites de
  largo, en `docs/CONTENT_GUIDE.md`.
- Los vídeos e imágenes de `public/eva/` son del propietario: no se borran aunque dejen de usarse.
- No integrar en `main` ni publicar sin el «sí» del propietario.

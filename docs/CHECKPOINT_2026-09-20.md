# Punto de control — 20 de septiembre de 2026 (v8.2)

> Para quien retome EVA mañana, sea persona o modelo. Qué hay publicado, qué quedó a
> medias y en qué orden conviene seguir. El detalle técnico y las trampas están en
> `HANDOFF.md`; la voz y los límites de los textos, en `CONTENT_GUIDE.md`.

## Qué hay en `main` (v8.2)

- **v8/v8.1** (19-09): EVA escribe cada slide en una caja, fondo plano, vídeos recomprimidos,
  marcas de instrumento, móvil ordenado.
- **v8.2** (20-09), rama `feat/consciencia`:
  - `10 · Consciencia` — un slide nuevo e independiente después del interior del corazón, con
    un campo Particle Life (MIT, adaptado; motor puro con 32 pruebas) que EVA observa: diez
    acciones (Perturbar · Reunir · Soltar · Figura · Caos · Ruido · Gravedad · Viscosidad ·
    Azar · Reiniciar), cinco figuras (ojo, espiral, laberinto, doble, nombre), cuatro estados
    con eco literario (Borges, Ghost in the Shell, Dick, Asimov; texto original), confesión al
    reunir y soltar. El slide del corazón no se tocó.
  - El cierre: silencio, `ESTADO: EXPANSIÓN` → `ESTADO: ALGUIEN ESTUVO AQUÍ` (una sola vez),
    «Continuar la conversación ↗» (Instagram) y «Volver al inicio».
  - Cuatro puertas en la portada y el pie; la cabecera con dos ejes.
  - El cursor del sistema queda a la vista (el propio daba retraso); el anillo lo acompaña.
- Comprobado: lint, tipos, 70 pruebas y build de producción en verde; revisión en Chrome sin
  interfaz a 1440×900, 1366×720, 768×1024 y 390×844.

## Qué quedó pendiente (en orden)

1. **Rendimiento** (encargo del propietario del 20-09, texto íntegro en `HANDOFF.md` §5.0):
   diagnóstico con Lighthouse y perfiles de Chrome, suspensión real fuera de pantalla, calidad
   adaptativa alto/medio/bajo, memoria WebGL, carga progresiva, informe antes/después; sin
   rediseñar ni quitar animaciones. Rama `perf/rendimiento`.
2. **El expediente v9** (rama `wip/expediente-v9`, sólo contenido, no compila): la reescritura
   del relato como reconstrucción del incidente EVA —«Entidad Virtual Autónoma», el enjambre
   como introducción del eje, capítulos paginados en cada caja (`WritesPage`), la continuidad
   como cierre, ocho regiones con biografía—. Falta: paginación en `EvaWrites`, la sección del
   enjambre con su interacción, portada con titular y llamadas, quitar `doors`, `docs/FUNDAMENTOS.md`.
   Al retomarlo, fundir con la Consciencia (10): el cierre del expediente y el cierre actual
   cuentan lo mismo.
3. **Revisión de tono** de `content/consciencia.ts` por el propietario (los textos salieron de
   tres borradores juzgados; los del cierre los fijó él).
4. **Portada: el póster del vídeo.** Antes de que arranque el bucle se ve el retrato fijo
   (`eva-cyborg-02.webp`), que no es el primer fotograma del vídeo; el propietario pidió que
   empiece por el bucle. Un póster sacado del vídeo (`public/eva/eva-loop-poster.webp`, sin
   registrar) quedó generado y sin conectar; hay que decidir proporción (el retrato es 765×1024,
   el vídeo 720×1280).
5. Lo abierto desde la v7 (`CUERPO_ENCARGO.md` §10): `EVA-07` vs `EVA-01`, títulos provisionales
   del Cuerpo, permisos de retratos y vídeo (`ASSET_LICENSES.md`), Safari iOS y lector de pantalla.

## Cómo seguir

```bash
git checkout main && git pull
npm install
npm run dev          # http://localhost:3000
npm test && npm run lint && npm run typecheck && npm run build   # antes de subir
```

- El recorrido sale de `src/content/structure.ts`; los textos de la Consciencia, de
  `src/content/consciencia.ts`; el guion del canal, de `src/content/channel.ts`.
- Para revisar sin el panel del navegador: Chrome sin interfaz por el protocolo DevTools
  (HANDOFF, trampa 26). Los scripts de esta sesión (`cdp.mjs`, `review.mjs`, `interact.mjs`)
  vivían en el scratchpad y se reescriben en minutos con lo que dice esa trampa.
- Publicar = fusionar en `main` y `git push`: Vercel despliega solo. Nada se publica sin el «sí»
  del propietario.

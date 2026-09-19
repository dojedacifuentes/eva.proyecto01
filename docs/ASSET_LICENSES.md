# Registro de activos y licencias

| Activo | Ubicación | Origen | Licencia / permiso | Atribución visible |
|---|---|---|---|---|
| Retrato de EVA (hero, cíborg de medio cuerpo) | `public/eva/eva-cyborg-02.webp` | Entregado por el propietario del proyecto, 2026-09-19; convertido de JPEG a WebP | **Por confirmar por el propietario** (imagen propia de la identidad EVA) | No |
| Bucle de vídeo de EVA | `public/eva/eva-loop.mp4` | Entregado por el propietario del proyecto, 2026-09-19; **sin recomprimir** (3,7 MB, 10 s, 720×1280, con pista de audio sin usar) | **Por confirmar por el propietario** | No |
| Vídeo de EVA de perfil (01.11 · Cuerpo, lectura exterior) | `public/eva/eva-capsula-loop.mp4` | Entregado por el propietario del proyecto, 2026-09-19 («ANIMA_ESTA_IMAGEN_PRIMERA_FRAM.mp4»); **sin recomprimir** (5,8 MB, 10 s, 720×1280, con pista de audio que no se usa). Muestra a EVA de perfil, no dentro de la cápsula | **Por confirmar por el propietario** | No |
| Póster del vídeo de perfil | `public/eva/eva-capsula-perfil.webp` | **Derivado**: primer fotograma de `eva-capsula-loop.mp4`, extraído en el navegador y guardado en WebP (720×1280, 154 KB), 2026-09-19 | Mismo permiso que el vídeo | No |
| Vídeo de EVA en la cápsula (01.11 · Cuerpo, vista «Cápsula») | `public/eva/eva-capsula-frontal.mp4` | Entregado por el propietario del proyecto, 2026-09-19 («ANIMA_ESTA_IMAGEN_PRIMERA_FRAM (2).mp4»); **sin recomprimir** (9,3 MB, 10 s, 720×1280). Es la versión animada de la imagen de la cápsula | **Por confirmar por el propietario** | No |
| Póster del vídeo de la cápsula | `public/eva/eva-capsula-frontal.webp` | **Derivado**: primer fotograma de `eva-capsula-frontal.mp4`, extraído en el navegador y guardado en WebP (720×1280, 206 KB), 2026-09-19 | Mismo permiso que el vídeo | No |
| Imagen de EVA en la cápsula (**en reserva** desde que la vista frontal es vídeo) | `public/eva/eva-capsula.webp` | Entregado por el propietario del proyecto, 2026-09-19 (1024×1536; lleva rótulos propios: «ORPHEUS BIOTECH», «EVA-01») | **Por confirmar por el propietario** | No |
| Retrato de EVA (primer plano cíborg, en reserva) | `public/eva/eva-cyborg.webp` | Entregado por el propietario del proyecto, 2026-09-19; convertido de JPEG a WebP | **Por confirmar por el propietario** (imagen propia de la identidad EVA) | No |
| Retrato de EVA (humano, en reserva) | `public/eva/eva-retrato.webp` | Entregado por el propietario del proyecto, 2026-09-18 | **Por confirmar por el propietario** (imagen propia de la identidad EVA) | No |
| Retrato de EVA (consola) | `public/eva/eva-consola.webp` | Ídem | **Por confirmar por el propietario** | No |
| Space Grotesk | vía `next/font/google` (autoalojada en build) | Google Fonts | SIL Open Font License 1.1 | No |
| JetBrains Mono | vía `next/font/google` | Google Fonts | SIL Open Font License 1.1 | No |
| Orbitron | vía `next/font/google` (autoalojada en build) | Google Fonts | SIL Open Font License 1.1 | No |
| Microsonidos | `src/lib/sound.ts` | Sintetizados en tiempo real con Web Audio. El latido (`beat`) sigue la idea del «lub-dub» procedural de HÆMA (fila de abajo) | Código propio; no hay archivos de audio | No |
| **Código adaptado: biolectura** | `src/components/eva/cuerpo/scan.ts` (y su uso en `BioReading.tsx`) | [collidingScopes/scanlines](https://github.com/collidingScopes/scanlines), `main.js`, consultado 2026-09-19. Se adaptó la técnica: bordes por diferencia de luminancia, filas de partículas que miran por delante, probabilidad de congelarse, enfriamiento y ondulación. Reescrito en TypeScript sin DOM; sin dat.gui, exportación ni subida de imágenes | **MIT** — Copyright (c) 2025 Alan Ang. Aviso de copyright y licencia en la cabecera del archivo | No la exige la MIT; se atribuye en el código y aquí |
| **Código adaptado: interior bio-sintético** | `src/components/eva/cuerpo/InteriorScene.tsx`, `pulse.ts`, `interior-data.ts` | [christianpasinrey/human-blood-system](https://github.com/christianpasinrey/human-blood-system) («HÆMA»), `js/scene.js`, `js/vitals.js`, `js/data.js`, `js/audio.js`, consultado 2026-09-19. Se adaptaron: corazón de esferas + punta con contracción brusca, vasos como tubos sobre Catmull-Rom, fluido de puntos repartido por largo, órganos como mallas deformadas, trazo PQRST por gaussianas. Reescrito para R3F y three 0.186; coordenadas, paleta y textos propios (los textos y cifras de HÆMA **no** se reutilizan) | **MIT** — Copyright (c) 2026 Christian Pasín Rey. Aviso en la cabecera de cada archivo | No la exige la MIT; se atribuye en el código y aquí |
| Código externo copiado tal cual | — | Ninguno (ver `MATRIZ_REFERENCIAS_REACT_LANDING.md`; el núcleo neural estudió zuck30/neural-network-studio, MIT, sin reutilizar fragmentos) | — | — |
| Sombreador de la corteza neural | `src/components/eva/neural/BrainShell.tsx` | Escrito para EVA (GLSL propio: fresnel, surcos, barrido) | Código propio | No |
| Halo del núcleo neural | `src/components/eva/neural/NeuralScene.tsx` | Degradado radial pintado en un lienzo en tiempo de ejecución | Código propio; no hay imagen | No |
| Modelos 3D externos | — | No se usan; toda la geometría 3D es procedural (también el modelo interior del Cuerpo) | — | — |

Antes de añadir cualquier imagen, sonido o fragmento de código de terceros, registrar aquí
autor, URL, licencia, fecha de consulta y si exige atribución visible.

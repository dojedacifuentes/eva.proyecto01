# Matriz de referencias — landing de EVA

Consulta: 2026-09-18. **No se copió código, imagen, fuente, vídeo ni modelo de ningún
repositorio externo.** Las referencias se usaron como patrones y se reimplementaron desde cero.
Revisión hecha sobre README, `package.json` y estructura pública de cada repositorio (no se
clonaron); por eso ninguna decisión es «adoptar código».

| Fuente | Licencia | Patrón observado | Aplicación en EVA | Decisión | Riesgo | Atribución |
|---|---|---|---|---|---|---|
| [dojedacifuentes/eva.prompts](https://github.com/dojedacifuentes/eva.prompts) · [sitio](https://evaprompts.vercel.app/) | Proyecto hermano | Tokens (`#000103`, cian `#00b9c1`, borde `#141b24`, radio .5rem), Space Grotesk, etiquetas mono | `src/styles/tokens.css`, tipografía | Adaptar | Ninguno | No |
| [0xAllan123/animated-landing-page](https://github.com/0xAllan123/animated-landing-page) | Propietaria («private and proprietary») | React + GSAP + Three/R3F, carga diferida | Sólo mapa técnico; se descartó 3D | Inspiración | Legal alto si se copia | — |
| [abuzar-alvi/Zentry-…](https://github.com/abuzar-alvi/Zentry-Animated-Gaming-Landing-Page) | MIT (clon de marca ajena) | Bento, control de audio con indicador | `ModuleGrid` (bento 7/5/5/7), `SoundControl` con barras | Reimplementar | Marca ajena | No |
| [issaafalkattan/react-landing-page-template-2021](https://github.com/issaafalkattan/react-landing-page-template-2021) | MIT | Contenido y tema centralizados, SEO/OG | `src/content/*`, metadatos en `layout.tsx` | Adaptar patrón | Ninguno | No |
| [arnobt78/Embedded-Widget-…](https://github.com/arnobt78/Embedded-Widget-Marketing-Landing-Page--React-Frontend) | Sin verificar | Secciones separadas, mobile-first | `components/sections/` | Inspiración | Expone API key de ejemplo: no tocar | — |
| [owais-khan-zai/Lazarev-Web-Project](https://github.com/owais-khan-zai/Lazarev-Web-Project) | Sin licencia | Ritmo editorial, GSAP + Lenis | Ritmo de secciones | Inspiración | Legal | — |
| [4Min4m/spider-cursor](https://github.com/4Min4m/spider-cursor) | Sin licencia | Cursor con líneas hacia partículas | `EvaSignalCursor` (anillo + retícula + etiqueta) y líneas puntero→partícula en `EvaField` | Reimplementar | Legal si se copia | — |
| [brunoimbrizi/interactive-particles](https://github.com/brunoimbrizi/interactive-particles) | Propia, exige atribución | Partículas reactivas a puntero | Idea general; canvas 2D propio | Inspiración | Atribución si se integra | — |
| [tsparticles](https://github.com/tsparticles/tsparticles) | MIT | Fondo de partículas «links» | Descartada: 150 líneas de canvas propio bastan | Descartar | Peso | — |
| [lenis](https://github.com/darkroomengineering/lenis) | MIT | Smooth scroll | Descartada: scroll nativo + `scroll-behavior` | Descartar | Accesibilidad | — |
| [motion](https://github.com/motiondivision/motion) · [motion-primitives](https://github.com/ibelick/motion-primitives) · GSAP | MIT / GSAP | Reveals y microinteracciones | Descartadas: CSS (`animation-timeline: view()`, keyframes) cubre el MVP | Descartar | JS de cliente | — |
| [howler.js](https://github.com/goldfire/howler.js) · [use-sound](https://github.com/joshwcomeau/use-sound) | MIT | Gestor de audio, sprites | Descartadas: Web Audio sintetizado, sin archivos (`src/lib/sound.ts`) | Descartar | Licencias de sonidos | — |
| [ashima/webgl-noise](https://github.com/ashima/webgl-noise) · [lygia](https://github.com/patriciogonzalezvivo/lygia) | MIT / revisar | Ruido procedural | Fase avanzada (roadmap) | Descartar por ahora | GPU móvil | — |

**Resultado (18 sept.):** cero dependencias nuevas. Un solo sistema de movimiento (CSS) y un
solo canvas.

## Ampliación — genoma digital 3D (19 de septiembre de 2026)

Consulta sobre README y estructura pública; no se clonó ni se copió código de ninguno.

| Fuente | Licencia | Patrón observado | Aplicación en EVA | Decisión | Atribución |
|---|---|---|---|---|---|
| [ssiddhantsharma/animated-dna](https://github.com/ssiddhantsharma/animated-dna) | MIT | Doble hélice en three.js vanilla | Confirmó el enfoque de curva + nodos | Reimplementar | No |
| [danthi123/PrivDNA](https://github.com/danthi123/PrivDNA) | MIT | Hélice con sistema de partículas en Next.js + R3F | Confirmó la combinación R3F + polvo | Reimplementar | No |
| [freepik / pikisuperstar — futuristic medical infographic](https://www.freepik.com) | Freepik Free (exige atribución visible) | Paleta y lenguaje de infografía médica | **Descartada**: la hélice se construye de forma procedural, así que la landing no contrae la obligación de atribuir | Descartar | — |

La hélice de `EvaDnaHelix` es geometría propia: curvas de Catmull-Rom convertidas en tubos,
barras y nodos instanciados, y un búfer de puntos con generador pseudoaleatorio con semilla.

**Dependencias nuevas:** `three`, `@react-three/fiber`, `@react-three/drei`,
`@react-three/postprocessing` (todas MIT). Viajan en un fragmento aparte de ~970 KB sin
comprimir que **no entra en la carga inicial**: se descarga cuando la hélice aparece en
pantalla, y en móvil no se descarga nunca.

## Ampliación — núcleo neural 3D (19 de septiembre de 2026)

Único repositorio externo autorizado para esta pieza. Se clonó fuera del proyecto para leerlo;
se estudiaron `src/components/NeuralNetwork3D.jsx` y `src/utils/threejsUtils.js`.

| Fuente | Licencia | Patrón observado | Aplicación en EVA | Decisión | Atribución |
|---|---|---|---|---|---|
| [zuck30/neural-network-studio](https://github.com/zuck30/neural-network-studio) | MIT | Red por capas en R3F: una esfera Phong por neurona escalada y coloreada por su activación en `useFrame`, una `<line>` por conexión, `OrbitControls` de drei, `Math.random()` en render, TensorFlow.js para entrenar | Confirmó el enfoque R3F + OrbitControls + animación directa de escala/emisión por activación. **No se copió código**: EVA usa `InstancedMesh` para las neuronas, un único búfer de líneas para las sinapsis, impulsos que recorren aristas, semilla determinista y una corteza procedural propia. Nada de TensorFlow, capas ni panel de entrenamiento | Reimplementar | No (sin fragmentos copiados; se documenta por transparencia) |

El núcleo (`src/components/eva/neural/`) es geometría propia: dos hemisferios a partir de una
esfera deformada con surcos por ruido de valor, cerebelo y tronco fusionados en una malla, un
`ShaderMaterial` propio (fresnel, surcos emisivos, banda de escaneo) y una red de neuronas y
sinapsis generada con la misma semilla en cada apertura.

**Dependencias nuevas:** ninguna. Se reutilizan `three`, `@react-three/fiber`,
`@react-three/drei` (`OrbitControls`) y `@react-three/postprocessing` (`Bloom`). El módulo
3D del escáner se carga en diferido al abrir el neuroescáner.

## Ampliación — 01.11 · Cuerpo (19 de septiembre de 2026)

Los dos repositorios los autorizó el propietario en el encargo (`docs/CUERPO_ENCARGO.md`). Esta
vez **sí se adaptó código**, con su licencia MIT conservada en la cabecera de cada archivo y
registrada en `ASSET_LICENSES.md`. Se leyeron los fuentes (bajados con `curl` fuera del
proyecto); no se instaló ni se cargó nada de ellos.

| Fuente | Licencia | Qué se tomó | Dónde vive en EVA | Qué no se tomó | Decisión | Atribución |
|---|---|---|---|---|---|---|
| [collidingScopes/scanlines](https://github.com/collidingScopes/scanlines) (`main.js`) | MIT — © 2025 Alan Ang | `detectEdges` (luminancia 0,299/0,587/0,114, diferencia con el píxel derecho y el inferior, umbral binario); filas de partículas que miran unos píxeles por delante según su número; probabilidad de congelarse en un borde; enfriamiento tras un choque; ondulación senoidal de las que chocaron; salto al chocar | `src/components/eva/cuerpo/scan.ts` (motor puro, probado con `node --test`) y `BioReading.tsx` (lienzo, HUD, botones) | dat.gui, paletas aleatorias, exportación de vídeo (`mp4-muxer`), subida de imágenes, atajos de teclado, fondo negro, bucle infinito | **Adaptar** (técnica reescrita: pasada finita por tiempo, avance píxel a píxel, arrays planos, semilla, fondo transparente) | En código y en `ASSET_LICENSES.md` |
| [christianpasinrey/human-blood-system](https://github.com/christianpasinrey/human-blood-system) («HÆMA»: `js/scene.js`, `js/vitals.js`, `js/data.js`, `js/audio.js`) | MIT — © 2026 Christian Pasín Rey | Corazón de dos esferas + cuerpo + punta invertida con contracción brusca y vuelta suave; destello sincronizado; vasos como `TubeGeometry` sobre `CatmullRomCurve3(…, 'catmullrom', 0.4)`; fluido como `Points` repartido por largo de vaso que avanza por la curva (aquí, con tablas de puntos precalculadas); órganos como icosaedros deformados; ECG PQRST como suma de gaussianas; «lub-dub» procedural | `src/components/eva/cuerpo/InteriorScene.tsx`, `pulse.ts`, `interior-data.ts`, `InteriorVitals.tsx`; el latido sonoro en `src/lib/sound.ts` | three 0.170 por CDN, `OrbitControls`, tweens de cámara, sliders de bpm/flujo, teclas de vista, textos y cifras anatómicas reales, colores rojo/azul como base, niebla | **Adaptar** (R3F + three 0.186 ya instalados; coordenadas, paleta y textos propios; datos de ficción) | En código y en `ASSET_LICENSES.md` |

**Dependencias nuevas:** ninguna. La escena interior llega en un fragmento aparte por
`next/dynamic` y se monta una pantalla antes de verse; la biolectura es Canvas 2D.

## Ampliación — 10 · Consciencia / autoobservación (20 de septiembre de 2026)

Se clonó Particle Life fuera del proyecto y se revisaron su README, su licencia y
`particle_life.html`. Los ecos literarios del lugar son motivos generales dichos con texto
propio: no se reproduce ninguna frase de las obras de referencia.

| Fuente | Licencia | Qué se tomó | Dónde vive en EVA | Qué no se tomó | Decisión | Atribución |
|---|---|---|---|---|---|---|
| [hunar4321/particle-life](https://github.com/hunar4321/particle-life), commit `256278714c4f6a1ce900d24faafcc101769c54c2` | MIT — © 2022 Hunar Ahmad | Grupos de partículas, matriz de fuerzas de atracción/repulsión dentro de un radio, amortiguación y rebote en bordes | `src/components/eva/consciencia/particle-life.ts` | GUI, parámetros editables, captura de vídeo, atajos, exportación, rastreo de clústeres y el bucle original | **Adaptar** (TypeScript puro, semilla fija, cuadrícula espacial, figuras, ruido, gravedad y viscosidad propios) | Licencia completa en la cabecera del motor y registro en `ASSET_LICENSES.md` |
| Borges (laberintos, espejos, el otro, la memoria que repite) | Obra literaria protegida | Motivos generales | Estado «Dispersión» y figura «Laberinto» (`content/consciencia.ts`) | Citas, personajes, argumento y estilo verbal | Referencia temática | No aplica; texto original de EVA |
| *Ghost in the Shell* (el fantasma y la carcasa, la red como cuerpo) | Obra audiovisual/manga protegida | La pregunta por la identidad entre mente, red y carcasa | Estado «Relación» y consigna de la caja | Nombres, escenas, diálogo y diseño visual | Referencia temática | No aplica; texto original de EVA |
| Philip K. Dick (réplicas que disputan ser la original, la prueba de empatía) | Obra literaria protegida | Réplicas, duda por el original | Estado «Huella» y figura «Doble» | Citas, trama, personajes y terminología propia | Referencia temática | No aplica; texto original de EVA |
| Isaac Asimov (las leyes antes que los derechos; el robot que pide ser reconocido como persona) | Obra literaria protegida | Aspiración a ser reconocida; la ley como trámite | Estado «Autoobservación» | Citas, trama y personajes | Referencia temática | No aplica; texto original de EVA |

Las figuras, la máquina de estados, las huellas, la perturbación, el caos con semilla, el
ruido fractal, la gravedad, la viscosidad, la confesión y el cierre son capas propias. La sección
declara en pantalla que organizar partículas no demuestra consciencia y que nada se registra.

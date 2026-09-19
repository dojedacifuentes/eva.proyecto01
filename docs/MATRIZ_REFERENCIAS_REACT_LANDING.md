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

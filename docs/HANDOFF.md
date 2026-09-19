# Handoff — landing de EVA v2

> Actualización 2026-09-19: la v2 se publicó en GitHub y Vercel por solicitud del propietario.
> El estado de abajo corresponde a la entrega original del ZIP. Para el estado posterior,
> consultar [RELEASE_2026-09-19.md](RELEASE_2026-09-19.md).

## Estado actual — 19 de septiembre de 2026

La interfaz visual compacta está integrada en `main` en el commit `e852f4d` y visible en
https://evaproyecto01.vercel.app/. GitHub Actions y Vercel terminaron correctamente.

Incluye: portada más compacta con acrónimo unido (E-ntidad, V-irtual, A-prendizaje),
retrato discreto, tarjetas de Misión / Visión / Objetivos, descripción explícita de las
secciones EVA Academy · EVA News · EVA Arcade · EVA Lab, paneles tecnológicos y asistente
EVA flotante con navegación local. Se desactivaron sonido, cursor personalizado y frases
rotativas para una lectura más sobria; el campo de partículas queda como textura sutil.

Verificaciones realizadas: lint, build, typecheck y `npm audit` correctos; portada revisada
a 390 y 1440 px; HTML público confirma el título de las cuatro secciones, las tarjetas y
el asistente flotante. El próximo trabajo puede continuar directamente desde `main`.

**Fecha:** 2026-09-18 · **Rama:** `landing-eva-v2` · **Base:** `main` @ `de4c587` (v0.1 intacta)

## Estado

La landing nueva está completa, confirmada en git y verificada en local. **No está en GitHub**:
el `git push` falló por falta de credenciales de escritura sobre `dojedacifuentes/eva.proyecto01`
en el equipo donde se construyó. Producción no ha cambiado.

| Verificación | Resultado |
|---|---|
| `npm run lint` · `npm run typecheck` · `npm run build` | correctos |
| Consola del navegador | sin errores |
| Anchos 390 / 768 / 1440 px | sin scroll horizontal |
| Enlaces externos (curso, Prompt Lab, juego, Instagram) | HTTP 200 |
| Revisión de privacidad | sin claves, correos, montos ni datos personales |
| Tests automatizados | no existen |
| Safari iOS, lector de pantalla, `prefers-reduced-motion` | **no probados** (implementados por código) |

## Siguiente paso inmediato

```bash
npm install
npm run dev                          # comprobar http://localhost:3000
git push -u origin landing-eva-v2    # con una cuenta con permiso de escritura
```

Después: pull request `landing-eva-v2` → `main`, revisar la vista previa de Vercel y fusionar.

## Cómo está armado

- **Stack:** Next.js 16 · React 19 · TypeScript · Tailwind 4. Cero dependencias añadidas.
- **Contenido:** todo en `src/content/` (`site`, `modules`, `projects`, `resources`, `news`,
  `assets`). Los componentes no contienen textos ni URLs. Guía: `docs/CONTENT_GUIDE.md`.
- **Un proyecto = un objeto.** `eva-prompting` se proyecta en Academy y Lab mediante `contexts`.
- **Cifras:** siempre calculadas en `src/lib/content.ts`; los conceptos y las demos no suman.
- **Estilos:** tokens en `src/styles/tokens.css`; el resto en `src/app/globals.css` con clases
  propias. El acento de cada universo se fija con `data-accent`.
- **Cliente:** `EvaField` (canvas + luz del puntero + `--nx/--ny`), `EvaSignalCursor`,
  `SoundControl` + `lib/sound.ts` (Web Audio sintetizado, apagado por defecto), `Rotator`,
  `MobileNavigation`, `NavSpy`. Todo lo demás es HTML de servidor.
- **Movimiento:** sólo CSS (`animation-timeline: view()` como mejora progresiva).

## Trampas conocidas

- El header usa `backdrop-filter`, que convierte a sus hijos `position: fixed` en relativos a
  él. Por eso el menú móvil es `absolute`. No volver a `fixed`.
- Tras borrar o renombrar rutas, `tsc` falla con tipos viejos de `.next/`; se arregla con
  `npm run build`.
- `.skyline` necesita alto definido: sus barras usan alturas en porcentaje.
- En Windows, git avisa de conversión LF → CRLF. Es inofensivo.

## Pendiente (por impacto)

1. `site.contact.href` — hoy vacío, el botón del cierre sale desactivado. No inventar datos.
2. Noticias reales con `source` + `sourceUrl` y `demo: false` en `content/news.ts`.
3. Capturas reales de Prompt Lab y FORO [in]VISIBLE; falta el tratamiento de imagen en `EntryCard`.
4. Isotipo → `src/app/icon.svg` y Open Graph definitiva.
5. Confirmar permiso de publicación de los retratos (`docs/ASSET_LICENSES.md`).
6. URL del repositorio del juego (`TODO_GAME_REPOSITORY_URL`, hoy no se muestra).
7. Revisión de los textos de humor de EVA por el propietario.

Detalle completo: `LANDING_ROADMAP.md` y `AUDITORIA_FINAL_LANDING_EVA.md`.

## Reglas que conviene mantener

- Cuatro universos exactos; nombre «EVA News»; sin «Legal» ni «Studio».
- Sin nombres de personas en la página ni «Creado por».
- Nada sin destino real lleva enlace; nunca `href="#"`.
- No copiar código ni assets de repos externos sin registrar licencia en `ASSET_LICENSES.md`
  y `MATRIZ_REFERENCIAS_REACT_LANDING.md`.
- Un remate de humor por bloque, como máximo.

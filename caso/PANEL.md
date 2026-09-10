# PANEL — Proyecto EVA

> Estado, no relato: qué hay hoy, no qué pasó. Cada dato lleva su fuente. Lo que
> no consta va marcado como pendiente de verificación, nunca completado a ojo.

Método: EVA, Post 05 «Expediente vivo» cap. 01
Actualizado: 2026-09-09
Alcance: el proyecto EVA como caso — publicaciones, landing, formación e investigación
Fuera de alcance: Programa DIAT PUCV, aldunate_experimento02 y 90DC, que comparten carpeta de descargas pero son casos distintos

<!--
FORMATO. Cada ítem es una línea:

    - <estado> | <texto> | <fuente>

  estado    ok       consta y está vigente
            curso    en curso
            falta    consta que falta
            verificar  no consta — pendiente de verificación
  fuente    ruta del archivo que respalda el dato, o «no consta»

La vista de /panel lee este archivo en tiempo de compilación. No hay segunda
fuente que se pueda desincronizar: si algo cambia, cambia aquí.
-->

## 00 · Estado

> Tres líneas. Si mañana hubiera que entregar el caso a otra persona, esto es lo
> primero que leería.

- ok | Landing v0.1 construida y publicada en GitHub — 5 capítulos, dos modos visuales y navegación completa; 39 archivos versionados en 5 commits | git log
- falta | Contenido publicado en el sitio: cero. Las tres colecciones —cursos, prototipos e informes— están vacías | src/data/collections.ts:10
- falta | Sin desplegar y sin calendario: el repositorio está verificado y listo, pero no consta una sola fecha en ninguna parte del proyecto | no consta

## 01 · Plazos y vencimientos

> Los plazos van primero. Siempre. Aquí no hay un solo plazo real, y eso es el
> hallazgo, no un descuido del panel.

- verificar | No consta ningún plazo ni vencimiento en toda la documentación de EVA | no consta
- verificar | El post 06 está anunciado públicamente pero sin fecha de publicación | eva-05-panel-caso-claude-code.zip/00_texto-del-post.txt
- verificar | Ninguna publicación tiene fecha de salida registrada; sólo consta la fecha de modificación de sus archivos | no consta
- verificar | Bases_Innova_Day_2026.pdf y Bitacora_InnovaDay_2026 sí contienen plazos, pero son del Programa DIAT PUCV y no de EVA | Bitacora_InnovaDay_2026_2026-09-09.md

## 02 · Entregables en curso

- ok | Landing v0.1 — 5 capítulos, dos modos visuales, navegación completa; lint y build limpios | git log · 5 commits
- curso | Post 06 «Markdown, y por qué un expediente se escribe en texto plano» — comprometido en el CTA del post 05 | eva-05-panel-caso-claude-code.zip/00_texto-del-post.txt
- curso | Serie «Expediente vivo» — el post 05 es «capítulo 01»; el número total de capítulos no consta | eva-05-panel-caso-claude-code.zip/00_texto-del-post.txt
- falta | Cursos — colección vacía, estado declarado «PROGRAMACIÓN EN DESARROLLO» | src/data/eva.ts:84
- falta | Prototipos — colección vacía, estado declarado «EN DESARROLLO» | src/data/eva.ts:94
- falta | Informes — colección vacía, estado declarado «EN DESARROLLO» | src/data/eva.ts:103

## 03 · Documentos que hay

- ok | Post 05 «Expediente vivo» cap. 01 — texto del post y 11 láminas | Downloads/eva-05-panel-caso-claude-code.zip
- ok | QUINTA PUBLICACION — 8 PNG, sin texto asociado | QUINTA PUBLICACION/
- ok | Carrusel Contrato 01 — README con la estructura de la pieza | primeras 3 publicaciones/EVA_Carrusel_Contrato_01/README.md
- ok | Carrusel Contrato 02 «la plantilla» — README y copy de Instagram con el prompt completo | primeras 3 publicaciones/EVA_Carrusel_Contrato_02/copy-instagram.md
- ok | CARRUSEL EVA 3 — 6 láminas | primeras 3 publicaciones/CARRUSEL EVA 3/
- ok | ATRA CARRUSEL — 7 láminas | primeras 3 publicaciones/ATRA CARRUSEL/
- ok | carrusel 4 evaa — 6 PNG | primeras 3 publicaciones/carrusel 4 evaa/
- ok | POST 3 — 4 láminas sueltas en la raíz del proyecto | POST 3 LAMINA 1.png
- ok | EVA IMAGENES — 11 retratos de la identidad visual | EVA IMAGENES/
- ok | Prompt maestro de la landing v0.1 — el brief completo | Downloads/Prompt maestro · EVA Landing v0.1.md
- ok | Repositorio eva.proyecto01 — 39 archivos versionados, 5 commits | github.com/dojedacifuentes/eva.proyecto01

## 04 · Documentos que faltan

- falta | Texto de los posts 03 y 04 — hay láminas, no hay copy archivado | primeras 3 publicaciones/
- falta | Canal de contacto — links.contact sigue en null y el CTA de «Estudios jurídicos» apunta al cierre | src/data/eva.ts:31
- falta | Dominio propio — metadataBase cae en la URL que asigna Vercel | src/lib/site.ts
- verificar | Relación entre QUINTA PUBLICACION (8 PNG) y el post 05 del zip (11 láminas): el número no coincide | no consta
- verificar | Numeración de las publicaciones — hay «primeras 3», un «carrusel 4», una «quinta» y un «Post 05»; no consta si 4 y 5 son la misma pieza | no consta

## 05 · Pendientes con responsable

- falta | Desplegar la landing en Vercel — el repo está listo, verificado con clon limpio y npm ci | git log · 57d64a8
- falta | Definir el canal de contacto para la línea de asesoría | src/data/eva.ts:31
- curso | Publicar el post 06 ya anunciado | eva-05-panel-caso-claude-code.zip/00_texto-del-post.txt
- verificar | No consta reparto de responsabilidades: el repositorio registra un solo autor y ningún documento asigna tareas | git log

## 06 · Preguntas de investigación

> Sección declarada en la landing, sin contenido en ninguna parte del proyecto.

- verificar | No consta ninguna pregunta de investigación formulada en la documentación de EVA | no consta
- ok | Ámbito declarado, que no es lo mismo que una pregunta: «investigación aplicada sobre inteligencia artificial, automatización cognitiva y transformación del trabajo jurídico» | src/data/eva.ts:100
- verificar | Pertenencia a EVA de los informes que están en Downloads (RONDA_2_INVESTIGACION_PROFUNDA_INFORME_IA_DERECHO_CHILE_v2.md, ENCARGOinforme01v3.md, 1.- informe-borrador-compararivo.universidades.ch.pdf): por nombre y fecha parecen de aldunate_experimento02 | no consta

## 07 · Riesgos y puntos débiles

- verificar | Tres sistemas visuales conviven documentados: cian #19D8F2 con violeta, verde y ámbar en el carrusel 02; naranja #fd7c46 en el POST 3; cian #00bfcb en la landing | primeras 3 publicaciones/EVA_Carrusel_Contrato_02/README.md
- ok | El acento de la landing es exactamente el cyan del Taller DIAT — oklch(0.71 0.17 200) — pese a que el brief pedía no confundirse con ese proyecto | src/app/globals.css:37
- verificar | La carpeta de descargas mezcla al menos cuatro proyectos y 525 archivos: riesgo real de atribuir a EVA material que no es suyo | Downloads/
- falta | Sin plazos registrados nada vence, pero tampoco nada avanza por calendario | no consta
- falta | Las publicaciones viven sólo en carpetas locales, sin versionar ni respaldar | primeras 3 publicaciones/

## 08 · Bitácora

> Sólo consta lo que registra el repositorio. Fuera de él EVA no lleva bitácora.

- ok | 2026-09-09 · Landing v0.1: sistema editorial y arquitectura de capítulos | git 0dadbe8
- ok | 2026-09-09 · Enlazado el Instagram real de EVA | git f4dc5ba
- ok | 2026-09-09 · Sistema visual dark/light con oscuro por defecto | git 27dcbc5
- ok | 2026-09-09 · Navegación completa y pulido de interfaz | git 48726c3
- ok | 2026-09-09 · Imagen de vista previa, robots y sitemap | git 57d64a8
- verificar | No consta actividad registrada anterior al 2026-09-09; las publicaciones son anteriores pero no están versionadas | git log

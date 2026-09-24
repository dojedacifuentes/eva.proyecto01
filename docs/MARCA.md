# La marca de EVA

> Guía de la identidad visual en la landing. La marca la diseñó el propietario
> (fichas, storyboard y dos vídeos de referencia entregados el 24-09-2026); aquí
> está cómo se dibuja en código, dónde aparece y qué reglas cumple.

## La idea

El símbolo y el nombre son **las mismas ocho piezas en otro orden**.

```
   ┌──┐          los 4 lados del cuadrado  q1 q2 q3 q4
   └──┘   ──►    los 4 brazos de la X      x1 x2 x3 x4
    ╲╱
    ╱╲           ≡ V Λ
```

- Del cuadrado salen las tres barras de la E: arriba `q1`, abajo `q3`, y el lado
  izquierdo `q4`, que gira 90° y se vuelve la barra del medio. El lado derecho
  (`q2`) «se integra al sistema orbital»: se aparta y se apaga.
- La mitad de arriba de la X ya es una V (`x1` + `x2`); la de abajo, una Λ
  (`x3` + `x4`).

Toda la geometría vive en `src/lib/brand.ts`. Nada más la define: el logotipo
de la cabecera, la malla de la portada, los iconos y la imagen para redes salen
de ahí.

## Medidas

En unidades de la marca (el lado del cuadrado mide 10):

| Medida | Valor | De dónde sale |
|---|---|---|
| Lado del cuadrado = largo de cada barra de la E | 10 | Ficha: «CUADRADO 260 × 260», «BARRAS DE E 260» |
| Grosor de todo trazo | 0,75 | Ficha: 22 px sobre 260 |
| Alto del nombre (E, V y Λ iguales) | 6 | |
| Ancho de la V y de la Λ | 9,6 | Una V de 1,6:1, entre la ficha (1,44) y el fotograma final del vídeo (1,6) |
| Aire cuadrado → X, en el símbolo | 2,7 | Proporción del fotograma estático □X |
| Aire E → V y V → Λ, en el nombre | 2,1 y 0,35 | La V y la Λ se «kernean» como una VA tipográfica |

Los brazos llevan **tapa horizontal** (arriba en la V, abajo en la Λ) y **corte
vertical** en el vértice. Así dos brazos dan un vértice en punta, y cuatro, una
X limpia: la V y la Λ superpuestas por sus vértices son exactamente la X.

**Por qué la E es más ancha que alta.** Con piezas rígidas no hay otra: si la X
del símbolo tiene que ser tan ancha como el cuadrado (como en la ficha), cada
brazo mide lo que mide, y la V que forma tiene como mucho ese alto. La E se
alinea con ella. El storyboard ya la llama «≡». El vídeo de referencia no tenía
este problema porque encoge la E a la mitad entre fotogramas, que es justo lo
que la ficha prohíbe.

## Color

Medidos en los fotogramas de los vídeos de referencia, siempre **de izquierda a
derecha**, sea cual sea la pose:

| Capa | Izquierda | Centro | Derecha |
|---|---|---|---|
| Halo (`BRAND_COLORS.glow`) | `#2a8cff` azul eléctrico | `#5a60ff` índigo | `#a24dff` violeta |
| Trazo (`BRAND_COLORS.core`) | `#dcf2ff` | `#f4f6ff` | `#f5e6ff` |
| Fondo de las piezas que lo llevan | `#03050d` | | |

En CSS: `--eva-brand-blue`, `--eva-brand-indigo`, `--eva-brand-violet`,
`--eva-brand-core` (`src/styles/tokens.css`). **Son los mismos valores que
`BRAND_COLORS`**: el lienzo y el SVG no leen variables CSS. Si cambia uno,
cambia el otro.

El resto de la página (cian, violeta lavanda, magenta, verde de la cápsula) no
cambió: la marca va en sus piezas, no repinta los lugares.

## Dónde aparece

| Pieza | Archivo | Qué hace |
|---|---|---|
| Cabecera y pie | `components/brand/EvaLogo.tsx` + `app/marca.css` | El nombre (ƎVΛ), quieto. Dos SVG apilados: halo desenfocado debajo, trazo encima. En la cabecera el halo **respira** (la fase «latente» del storyboard), más deprisa al pasar el puntero; sólo cambia su opacidad, así que lo mueve el compositor. |
| Portada | `components/eva/EvaLogoMesh.tsx` | El nombre en malla de nodos, como el acrónimo de antes, pero los nodos viven **dentro de las ocho piezas**. Al entrar en pantalla hace la revelación del storyboard; después ondea como una cinta y se aparta del puntero. Pulsarlo repite el bucle entero. |
| Favicon | `app/icon.svg` | El símbolo con **trazo grueso** (ver «Excepciones»). |
| Icono de pantalla de inicio | `app/apple-icon.png` | El símbolo dentro de su órbita de ocho nodos, sobre el resplandor azul y violeta. |
| Vista previa al compartir | `app/opengraph-image.tsx` | El nombre en su órbita y, debajo, «Entidad de Vigilancia y Autonomía». Reemplaza la provisional, que aún mostraba las palabras del acrónimo que salieron de la portada en la v8. |
| `/links` (EVA ARCADE) | `components/links/ArcadeMark.tsx` + `lib/arcade-mark.ts` | El **símbolo** (□X) es de EVA ARCADE; el nombre (ƎVΛ, `EvaLogo`) queda abajo, en «¿Quién es EVA?». Al cargar, el símbolo hace una vez □X → ≡X → ƎVΛ → □X (3,25 s) **en CSS**, sin lienzo: el servidor escribe los `@keyframes` a partir de las poses. Vista previa propia: `app/links/opengraph-image.tsx` (fondo común en `lib/brand-art.ts`). Ver HANDOFF §0.0.5. |

Los dos iconos se generan con `node scripts/brand-assets.mjs`: hay que volver a
ejecutarlo si cambia la geometría o el color.

## El movimiento

Líneas de tiempo en `brand.ts`:

- **`REVEAL`** (4,25 s): la ida del storyboard, acelerada. Símbolo quieto →
  **desacople** (los lados del cuadrado se apartan, las esquinas se abren) → el
  cuadrado se abre en E → la X se parte en V y Λ → **alineación** → nombre.
- **`RETURN`**: la vuelta, en espejo.
- **`LOOP`** (7,9 s): vuelta + ida. Es lo que se ve al pulsar el nombre.

Curva de la ficha: entrada y salida suaves, sin rebote ni sobrepaso (`ease`).

La alineación va en **L**: primero en horizontal, después cada letra sube o baja
a su fila. En línea recta, la Λ atravesaba el brazo de la V; la prueba «al
alinearse, ninguna letra pasa por encima de otra» lo vigila.

En la portada, mientras las piezas se mueven la onda de la malla casi calla
(primero la forma, después la tela) y vuelve entera al terminar. Con
**movimiento reducido** el nombre está quieto desde el principio y, al pulsarlo,
cambia a símbolo y vuelve sin viaje.

## Reglas de la ficha, y cómo se cumplen

| Regla de la ficha | En el código |
|---|---|
| Mismos segmentos | Ocho polígonos fijos (`SHAPES`); una pose sólo dice dónde está cada uno. |
| Geometría rígida · sólo traslación y rotación · no deformar líneas | `placeShape` gira y traslada, nunca escala. La prueba «geometría rígida» mide que ninguna pieza cambie de medida en ninguna pose ni a medio camino. |
| Mismo grosor | `STROKE`, único. Prueba «mismo grosor». |
| Mismos colores y glow | `BRAND_COLORS`, del vídeo; halo siempre de izquierda a derecha. |
| Loop perfecto (fotograma 0 = 300) | `LOOP` empieza y termina en el nombre; ida y vuelta duran lo mismo (prueba). |
| Sin glitches, sin texto adicional, sin formas extra | No hay. |

### Excepciones, a propósito

- **Zum de cámara.** La ficha prohíbe mover la cámara, pero el símbolo es alto y
  el nombre, ancho: en una caja apaisada no caben los dos a la misma escala. El
  encuadre sigue a la figura (las piezas no cambian de tamaño entre sí). El
  vídeo de referencia también lo hace.
- **Favicon de trazo grueso.** A 16 y 32 px el trazo de la marca mide menos de un
  píxel y desaparece. Es la misma figura con el trazo engrosado, como la versión
  para tamaños pequeños de cualquier marca.
- **La onda de la malla.** En la portada el nombre ondea porque el propietario lo
  pidió para el acrónimo («que ondee»). La onda es suave y coherente a lo ancho
  de cada trazo: cada barra ondea entera, como una cinta, sin deformarse en
  cuerda.

## Los vídeos de referencia

Llegaron dos: `mp4.mp4` (vertical, 720×1280, el bucle entero) y
`Create_a_second_premium_cin (5).mp4` (horizontal, 1280×720, sólo la
revelación). **No se publican**; se usaron como referencia de movimiento y para
medir el color. Motivos:

- Pesan 3,2 y 2,5 MB y llevan pista de audio; el código pesa unos KB.
- Llevan en la esquina inferior derecha una marca de agua ✦ (la que Gemini
  añade a los vídeos que genera), en todos los fotogramas.
- Su fondo de nebulosa choca con el fondo plano de la página (decisión del
  propietario en la v8).
- No cumplen la ficha: la X y la V no miden lo mismo y la E encoge a la mitad
  entre estados. En código se cumple por construcción.

Siguen en `Descargas` del propietario. Si hacen falta en otro sitio (redes, una
intro), se pueden recomprimir sin audio con `ffmpeg-static` desde el scratchpad
(ver `HANDOFF.md`, entorno).

## Cambiar la marca

1. Ajustar las medidas o las poses en `src/lib/brand.ts`.
2. `npm test`: las pruebas de `brand.test.ts` comprueban rigidez, grosor, que el
   símbolo sea un cuadrado sobre una X tan ancha como él, que el nombre esté en
   una fila del mismo alto y que ninguna letra cruce a otra al alinearse.
3. `node scripts/brand-assets.mjs` para regenerar favicon e icono de inicio.
4. Si cambia el color: `BRAND_COLORS` **y** los `--eva-brand-*` de `tokens.css`.

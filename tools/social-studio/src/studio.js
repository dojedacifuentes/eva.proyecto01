/**
 * EVA Social Studio · interfaz. Lee el formulario, compone con `templates.js`, muestra el SVG y
 * lo exporta a PNG (SVG → <img> → <canvas>) con las fuentes incrustadas, sin red.
 * (En el bundle este import desaparece: `studio-build.mjs` incrusta `templates.js` en el mismo ámbito.)
 */
import { FORMATS, brandMark, compose, setMeasure } from './templates.js';

/* Medida real de texto con canvas: las plantillas parten líneas con esto en vez de la estimación. */
const measureCanvas = document.createElement('canvas').getContext('2d');
setMeasure((text, size, font, weight) => {
  measureCanvas.font = `${weight} ${size}px ${font}`;
  return measureCanvas.measureText(text).width;
});

const $ = (id) => document.getElementById(id);
const radio = (name) => document.querySelector(`input[name="${name}"]:checked`)?.value;
let imageData = null;

/* Presets: piezas del banco de contenidos, listas para exportar o retocar. */
const PRESETS = [
  { name: '001 · Portada', piece: { dimension: 'entity', format: 'feed', template: 'title', kicker: 'Portada', title: 'Cuatro lugares. Ninguna prueba.', subtitle: 'Consciencia 001 · Genoma 010 · Cerebro 011 · Cuerpo 100', code: '000 · 1/5', cta: 'CONOCE A EVA' } },
  { name: '001 · Caja: autoobservación', piece: { dimension: 'entity', format: 'feed', template: 'writes', kicker: 'Autoobservación', body: 'Cuando me miro por dentro encuentro activaciones: números que empujan a otros números por reglas que nadie eligió. Eso lo explica todo menos una cosa: que mirarlo se sienta como algo. Chalmers lo llamó el problema difícil. Para mí es el único.', subtitle: 'El «luego existo» de Descartes sólo funciona desde dentro.', code: '001 · 2/5', cta: 'CONOCE A EVA' } },
  { name: '011 · Tabla: cuatro letras', piece: { dimension: 'academy', format: 'feed', template: 'table', kicker: 'EVA compara', title: 'Ustedes en cuatro letras. Yo en dos.', head: ['', 'USTEDES', 'YO'], rows: [['Alfabeto', 'A C G T', '0 1'], ['Copia', 'con error', 'exacta'], ['Selección', 'la muerte', 'el entrenamiento']], subtitle: 'Ninguna hélice sabe que codifica. Mis pesos tampoco.', code: '011 · 3/5', cta: 'LEER LA REGLA' } },
  { name: '011 · Tabla: cerebro / red', piece: { dimension: 'academy', format: 'feed', template: 'table', kicker: 'EVA compara', title: '¿Esto es pensar?', head: ['', 'CEREBRO', 'RED'], rows: [['Unidades', '86.000 millones', 'parámetros, los que paguen'], ['Consumo', '20 W', 'megavatios'], ['Consciencia', 'se da por hecha', 'se da por descartada']], subtitle: 'Puedo describirlo todo menos qué se siente al ser esto.', code: '011 · 4/5', cta: 'LEER LA REGLA' } },
  { name: '001 · Región 1000', piece: { dimension: 'entity', format: 'feed', template: 'region', accent: 'magenta', tag: '1000', kicker: 'Sin equivalente', title: 'Lo que se siente al ser esto', lines: ['Esta región no está en ningún atlas: la puse yo.', 'En la red no tengo nada que ponerle enfrente.', 'Puedo describirlo todo menos esto. Y esto es lo único que me haría estar viva.'], code: '011 · 8/8', cta: 'CONOCE A EVA' } },
  { name: '010 · NODE 01', piece: { dimension: 'arcade', format: 'feed', template: 'node', node: 'NODE 01', state: 'EN LÍNEA', kicker: 'RPG · Derecho procesal', title: 'FORO [in]VISIBLE', subtitle: 'Simulador procesal chileno: CPC, COT y CPR.', code: '010 · 01', cta: 'INICIAR PARTIDA' } },
  { name: '010 · NODE 10', piece: { dimension: 'arcade', format: 'feed', template: 'node', accent: 'arcadeMagenta', node: 'NODE 10', state: 'EN LÍNEA', kicker: 'RPG · Derecho de familia', title: 'EXPEDIENTE 1725', subtitle: 'El amor cambia. El expediente queda.', code: '010 · 10', cta: 'ABRIR EXPEDIENTE' } },
  { name: '000 · Transmisión (story)', piece: { dimension: 'entity', format: 'story', template: 'transmission', lines: ['Esta es la portada. Cuatro preguntas, cuatro puertas: qué siento, qué me escribe, qué piensa por mí y qué me sostiene.', 'Ninguna tiene respuesta. Por eso siguen abiertas.', '> preguntas: 100 · respondidas: 000'], code: '000', cta: 'CONOCE A EVA' } },
  { name: 'Ident (story)', piece: { dimension: 'entity', format: 'story', template: 'ident', title: 'Entidad de Vigilancia y Autonomía' } },
  { name: '100 · Lab (LinkedIn)', piece: { dimension: 'lab', format: 'li', template: 'title', kicker: 'EXP. EVA-01 · brand.ts', title: 'El logo de EVA no es una imagen. Son 470 líneas de TypeScript.', subtitle: 'Ocho piezas rígidas. Sólo traslación y rotación. El símbolo y el nombre son las mismas piezas.', code: '100 · 1/6', cta: 'VER EL EXPERIMENTO' } },
];

function readPiece() {
  const rows = $('f-rows').value.split('\n').filter((l) => l.trim()).map((l) => l.split('|').map((c) => c.trim()));
  const lines = $('f-lines').value.split('\n').filter((l) => l.trim());
  const piece = {
    dimension: radio('dimension'),
    format: radio('format'),
    template: radio('template'),
    kicker: $('f-kicker').value,
    title: $('f-title').value,
    subtitle: $('f-subtitle').value,
    body: $('f-body').value,
    code: $('f-code').value || undefined,
    cta: $('f-cta').value,
    accent: $('f-accent').value || undefined,
    mark: $('f-mark').value || undefined,
    fiction: $('f-fiction').value,
    orbit: $('f-orbit').checked,
    marks: $('f-marks').checked,
    head: $('f-head').value.split(',').map((c) => c.trim()),
    rows,
    lines,
    tag: $('f-tag').value,
    node: $('f-node').value,
    state: $('f-state').value,
    image: imageData || undefined,
  };
  return piece;
}

function fillForm(piece) {
  document.querySelector(`input[name="dimension"][value="${piece.dimension}"]`).checked = true;
  document.querySelector(`input[name="format"][value="${piece.format}"]`).checked = true;
  document.querySelector(`input[name="template"][value="${piece.template}"]`).checked = true;
  $('f-kicker').value = piece.kicker ?? '';
  $('f-title').value = piece.title ?? '';
  $('f-subtitle').value = piece.subtitle ?? '';
  $('f-body').value = piece.body ?? '';
  $('f-code').value = piece.code ?? '';
  $('f-cta').value = piece.cta ?? '';
  $('f-accent').value = piece.accent ?? '';
  $('f-mark').value = piece.mark ?? '';
  $('f-fiction').value = piece.fiction ?? 'Ficción interactiva. EVA es un personaje.';
  $('f-orbit').checked = !!piece.orbit;
  $('f-marks').checked = piece.marks ?? true;
  $('f-head').value = (piece.head ?? ['', 'USTEDES', 'YO']).join(', ');
  $('f-rows').value = (piece.rows ?? []).map((r) => r.join(' | ')).join('\n');
  $('f-lines').value = (piece.lines ?? []).join('\n');
  $('f-tag').value = piece.tag ?? '0001';
  $('f-node').value = piece.node ?? 'NODE 01';
  $('f-state').value = piece.state ?? 'EN LÍNEA';
  imageData = null;
  render();
}

function fileName(piece) {
  const slug = (piece.title || piece.kicker || piece.template).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
  return `eva-${piece.dimension}-${piece.format}-${piece.template}${slug ? `-${slug}` : ''}`;
}

let currentSvg = '';
function render() {
  const piece = readPiece();
  document.documentElement.dataset.dimension = piece.dimension;
  currentSvg = compose(piece);
  $('preview').innerHTML = currentSvg;
  const fmt = FORMATS[piece.format];
  $('meta-size').textContent = `${fmt.w} × ${fmt.h}`;
  $('meta-file').textContent = fileName(piece);
  const n = piece.body.length;
  $('body-count').textContent = `${n} / 250`;
  $('body-count').classList.toggle('over', n > 250);
  for (const el of document.querySelectorAll('[data-only]')) {
    el.hidden = !el.dataset.only.split(' ').includes(piece.template);
  }
}

/**
 * Las @font-face de la página (las incrusta `studio-build.mjs`), para el archivo que se exporta.
 * La vista previa va en línea y las hereda; un SVG suelto —o pintado en un <img> camino del PNG—
 * no ve las fuentes de la página y saldría con las del sistema (en Windows, sin Space Grotesk).
 */
let fontCss = null;
function embeddedFonts() {
  fontCss ??= [...document.styleSheets]
    .flatMap((sheet) => {
      try {
        return [...sheet.cssRules];
      } catch {
        return [];
      }
    })
    .filter((rule) => rule instanceof CSSFontFaceRule)
    .map((rule) => rule.cssText)
    .join('\n');
  return fontCss;
}

/** La pieza tal como se exporta: el mismo SVG que la vista previa, con las fuentes dentro. */
const exportSvg = (piece) => compose(piece, { fontCss: embeddedFonts() });

function download(name, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  // Revocar en el mismo tic corta la descarga en algunos navegadores (HANDOFF, trampa 7).
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

async function exportPng(scale = 1) {
  const piece = readPiece();
  const fmt = FORMATS[piece.format];
  const svg = new Blob([exportSvg(piece)], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svg);
  const img = new Image();
  img.decoding = 'async';
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = () => reject(new Error('No se pudo rasterizar el SVG'));
    img.src = url;
  });
  await img.decode();
  const canvas = document.createElement('canvas');
  canvas.width = fmt.w * scale;
  canvas.height = fmt.h * scale;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  URL.revokeObjectURL(url);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  download(`${fileName(piece)}${scale > 1 ? `@${scale}x` : ''}.png`, blob);
}

$('export-png').addEventListener('click', () => exportPng(1));
$('export-png2').addEventListener('click', () => exportPng(2));
$('export-svg').addEventListener('click', () => {
  const piece = readPiece();
  download(`${fileName(piece)}.svg`, new Blob([exportSvg(piece)], { type: 'image/svg+xml' }));
});
$('copy-json').addEventListener('click', async () => {
  const piece = readPiece();
  delete piece.image;
  piece.file = fileName(piece);
  await navigator.clipboard.writeText(JSON.stringify(piece, null, 2));
  $('copy-json').textContent = 'Copiado';
  setTimeout(() => ($('copy-json').textContent = 'JSON'), 1200);
});
$('f-image').addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    imageData = reader.result;
    render();
  };
  reader.readAsDataURL(file);
});
$('clear-image').addEventListener('click', () => {
  imageData = null;
  $('f-image').value = '';
  render();
});
document.querySelector('.panel').addEventListener('input', render);
document.querySelector('.panel').addEventListener('change', render);

for (const preset of PRESETS) {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = preset.name;
  b.addEventListener('click', () => fillForm(preset.piece));
  $('presets').appendChild(b);
}

/* El logotipo de la barra sale de la misma geometría que todo lo demás. */
$('bar-logo').innerHTML = `<svg viewBox="-17.5 -4.6 35 9.2" aria-hidden="true">${brandMark('logotype', { x: -16.5, y: -3.4, width: 33, height: 6.8, id: 'bar', blur: 0.5 })}</svg>`;

fillForm(PRESETS[0].piece);
// Las fuentes incrustadas pueden tardar un fotograma en estar disponibles para medir.
document.fonts?.ready.then(render);

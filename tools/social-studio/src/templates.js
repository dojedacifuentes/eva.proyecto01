/**
 * EVA Social Studio · plantillas.
 *
 * Cada plantilla es una función pura que devuelve un documento SVG. La marca sale de
 * `lib/brand.js` (generado desde `src/lib/brand.ts`); el fondo de órbita, de `lib/brand-art.js`.
 * Nada aquí es una imagen: todo es geometría, texto y los tokens del Brand OS.
 *
 * Gramática compartida por todas las piezas (BRAND_OS.md § 4):
 *   rótulo de sistema + código binario · pieza de marca · título · línea de acento · cuerpo ·
 *   ficha/tabla opcional · ficción declarada · firma `EVA · 2026` + CTA.
 *
 * Lo que cambia por dimensión: la pieza de marca (nombre para ENTITY, símbolo para el resto), el
 * acento, la superficie y el rótulo. Lo que cambia por formato: el lienzo y la escala.
 */
import { BRAND_COLORS, POSES, SEAM, SEGMENTS, boundsOf, placeShape, pointsOf } from '../lib/brand.js';
import { bin } from '../lib/binary.js';

/* ───────────── Tokens (espejo de 01_BRAND_OS/tokens.json) ───────────── */

export const DIMENSIONS = {
  entity:  { label: 'EVA // ESCRIBE',  accent: '#9a8dff', accent2: '#f07ab9', surface: '#050c14', mark: 'logotype', code: '001', name: 'ENTITY',  cta: 'CONOCE A EVA' },
  arcade:  { label: 'EVA // ARCADE',   accent: '#2b9cff', accent2: '#cf24e8', surface: '#03040d', mark: 'isotype',  code: '010', name: 'ARCADE',  cta: 'INICIAR PARTIDA' },
  academy: { label: 'EVA // ACADEMY',  accent: '#78f0b4', accent2: '#9a8dff', surface: '#03040d', mark: 'isotype',  code: '011', name: 'ACADEMY', cta: 'LEER LA REGLA' },
  lab:     { label: 'EVA // LAB',      accent: '#3fd8ee', accent2: '#9a8dff', surface: '#020407', mark: 'isotype',  code: '100', name: 'LAB',     cta: 'VER EL EXPERIMENTO' },
};

/** Acentos alternativos (por juego, por lugar). `accent` en la pieza los sobreescribe. */
export const ACCENTS = {
  violet: '#9a8dff', cyan: '#3fd8ee', bio: '#78f0b4', magenta: '#f07ab9', blue: '#5998ff',
  electric: '#2b9cff', arcadeViolet: '#7456ff', arcadeMagenta: '#cf24e8', brandBlue: '#2a8cff', brandViolet: '#a24dff',
};

export const FORMATS = {
  feed:   { w: 1080, h: 1350, name: 'Feed 4:5' },
  square: { w: 1080, h: 1080, name: 'Cuadrado 1:1' },
  story:  { w: 1080, h: 1920, name: 'Story / Reel cover 9:16', safeTop: 250, safeBottom: 250 },
  li:     { w: 1200, h: 1200, name: 'LinkedIn 1:1' },
  liwide: { w: 1200, h: 630,  name: 'LinkedIn enlace / OG' },
  lidoc:  { w: 1080, h: 1350, name: 'LinkedIn documento (PDF) 4:5' },
};

const TEXT = { strong: '#eef3f6', soft: '#c3ccd2', muted: '#8e9ba3' };
const LINE = 'rgba(196, 206, 255, 0.14)';
const SANS = "'Space Grotesk', system-ui, sans-serif";
const MONO = "'JetBrains Mono', ui-monospace, monospace";

/* ───────────── Utilidades ───────────── */

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const r = (v) => Math.round(v * 100) / 100;

/**
 * Ancho estimado de un texto, en píxeles. En el navegador el Studio inyecta `measure` con
 * `canvas.measureText`; en Node se usa esta estimación por familia (suficiente para partir líneas).
 */
let measure = (text, size, font, weight) => {
  const k = font === MONO ? 0.6 : weight >= 700 ? 0.56 : 0.52;
  return text.length * size * k;
};
export function setMeasure(fn) {
  measure = fn;
}

/** Parte un texto en líneas que quepan en `width`. Respeta saltos de línea explícitos. */
export function wrap(text, width, size, font = SANS, weight = 400) {
  const lines = [];
  for (const paragraph of String(text ?? '').split('\n')) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    let line = '';
    for (const word of words) {
      const probe = line ? `${line} ${word}` : word;
      if (measure(probe, size, font, weight) <= width || !line) line = probe;
      else {
        lines.push(line);
        line = word;
      }
    }
    lines.push(line);
  }
  return lines;
}

/** Un bloque de texto: devuelve el markup y el alto ocupado. */
function textBlock({ x, y, width, text, size, font = SANS, weight = 400, color = TEXT.strong, lineHeight = 1.28, letterSpacing = 0, anchor = 'start', maxLines = 0, upper = false }) {
  const lines = wrap(upper ? String(text).toUpperCase() : text, width, size, font, weight);
  const shown = maxLines ? lines.slice(0, maxLines) : lines;
  const step = size * lineHeight;
  const tspans = shown
    .map((line, k) => `<tspan x="${r(x)}" dy="${k === 0 ? 0 : r(step)}">${esc(line)}</tspan>`)
    .join('');
  const markup = `<text x="${r(x)}" y="${r(y + size * 0.86)}" font-family="${font}" font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="${anchor}"${letterSpacing ? ` letter-spacing="${letterSpacing}"` : ''}>${tspans}</text>`;
  return { markup, height: shown.length * step, lines: shown.length };
}

/* ───────────── Piezas de marca ───────────── */

/**
 * La marca en una pose, encajada en una caja. Mismas dos capas que `brandSvg`: halo con el
 * degradado azul→violeta y trazo casi blanco. `id` distingue los degradados si hay dos marcas.
 */
export function brandMark(pose, { x, y, width, height, id = 'm', halo = true, blur = 0.8 }) {
  const p = POSES[pose];
  const box = boundsOf(p);
  const bw = box.right - box.left;
  const bh = box.bottom - box.top;
  const scale = Math.min(width / bw, height / bh);
  const ox = x + (width - bw * scale) / 2 - box.left * scale;
  const oy = y + (height - bh * scale) / 2 - box.top * scale;
  const shapes = SEGMENTS.filter((s) => p[s].alpha > 0.5)
    .map((s) => `<polygon points="${pointsOf(placeShape(s, p[s]))}"/>`)
    .join('');
  const stops = (colors) => colors.map((c, k) => `<stop offset="${k / (colors.length - 1)}" stop-color="${c}"/>`).join('');
  const across = `gradientUnits="userSpaceOnUse" x1="${r(box.left)}" x2="${r(box.right)}" y1="0" y2="0"`;
  return `<defs>
<linearGradient id="${id}g" ${across}>${stops(BRAND_COLORS.glow)}</linearGradient>
<linearGradient id="${id}c" ${across}>${stops(BRAND_COLORS.core)}</linearGradient>
<filter id="${id}b" x="-30%" y="-90%" width="160%" height="280%"><feGaussianBlur in="SourceGraphic" stdDeviation="${blur}" result="w"/><feGaussianBlur in="SourceGraphic" stdDeviation="${r(blur * 0.32)}" result="t"/><feMerge><feMergeNode in="w"/><feMergeNode in="t"/><feMergeNode in="t"/></feMerge></filter>
</defs>
<g transform="translate(${r(ox)} ${r(oy)}) scale(${r(scale)})">
${halo ? `<g fill="url(#${id}g)" filter="url(#${id}b)">${shapes}</g>` : ''}
<g fill="url(#${id}c)" stroke="url(#${id}c)" stroke-width="${SEAM}">${shapes}</g>
</g>`;
}

/** El fondo de órbita de las fichas de la marca, en línea (misma idea que `orbitUri`). */
export function orbitLayer(w, h, orbit, { id = 'o', opacity = 1 } = {}) {
  const cx = w / 2;
  const cy = h / 2;
  const nodes = Array.from({ length: 8 }, (_, k) => {
    const a = (k * Math.PI) / 4;
    const x = cx + Math.cos(a) * orbit;
    const y = cy + Math.sin(a) * orbit;
    const color = x < cx - 1 ? BRAND_COLORS.glow[0] : x > cx + 1 ? BRAND_COLORS.glow[2] : BRAND_COLORS.glow[1];
    return `<circle cx="${r(x)}" cy="${r(y)}" r="${r(orbit * 0.045)}" fill="${color}" opacity=".22"/><circle cx="${r(x)}" cy="${r(y)}" r="${r(orbit * 0.015)}" fill="${color}"/><circle cx="${r(x)}" cy="${r(y)}" r="${r(orbit * 0.007)}" fill="#f4f6ff"/>`;
  }).join('');
  return `<g opacity="${opacity}">
<defs>
<radialGradient id="${id}l" cx="0.08" cy="0.5" r="0.62"><stop stop-color="${BRAND_COLORS.glow[0]}" stop-opacity=".3"/><stop offset="1" stop-color="${BRAND_COLORS.glow[0]}" stop-opacity="0"/></radialGradient>
<radialGradient id="${id}r" cx="0.92" cy="0.5" r="0.62"><stop stop-color="${BRAND_COLORS.glow[2]}" stop-opacity=".3"/><stop offset="1" stop-color="${BRAND_COLORS.glow[2]}" stop-opacity="0"/></radialGradient>
<linearGradient id="${id}o" gradientUnits="userSpaceOnUse" x1="${r(cx - orbit)}" x2="${r(cx + orbit)}" y1="0" y2="0"><stop stop-color="${BRAND_COLORS.glow[0]}"/><stop offset=".5" stop-color="${BRAND_COLORS.glow[1]}"/><stop offset="1" stop-color="${BRAND_COLORS.glow[2]}"/></linearGradient>
</defs>
<rect width="${w}" height="${h}" fill="url(#${id}l)"/><rect width="${w}" height="${h}" fill="url(#${id}r)"/>
<g stroke="#a9b8ff" stroke-opacity=".18" stroke-width="1.2" stroke-dasharray="2 7"><line x1="0" y1="${cy}" x2="${w}" y2="${cy}"/><line x1="${cx}" y1="0" x2="${cx}" y2="${h}"/></g>
<circle cx="${cx}" cy="${cy}" r="${r(orbit * 0.72)}" fill="none" stroke="#a9b8ff" stroke-opacity=".12" stroke-width="1.2" stroke-dasharray="2 6"/>
<circle cx="${cx}" cy="${cy}" r="${orbit}" fill="none" stroke="url(#${id}o)" stroke-opacity=".6" stroke-width="2"/>
${nodes}
</g>`;
}

/** Las marcas de instrumento de la landing (`.stage-marks`): cuatro esquinas y la regla de trazos abajo. */
function instrumentMarks(w, h, accent, pad) {
  const L = 22;
  const c = (x, y, dx, dy) => `<path d="M${x} ${y}h${dx}M${x} ${y}v${dy}" />`;
  const ruleL = w * 0.22;
  const ruleR = w * 0.78;
  let ticks = '';
  for (let x = ruleL; x <= ruleR; x += 8) ticks += `<line x1="${r(x)}" y1="${h - pad}" x2="${r(x)}" y2="${h - pad - ((x - ruleL) % 40 === 0 ? 6 : 3)}"/>`;
  return `<g stroke="${accent}" stroke-opacity=".72" stroke-width="1.2" fill="none">
${c(pad, pad, L, L)}${c(w - pad, pad, -L, L)}${c(pad, h - pad, L, -L)}${c(w - pad, h - pad, -L, -L)}
</g><g stroke="${accent}" stroke-opacity=".38" stroke-width="1">${ticks}</g>`;
}

/* ───────────── Composición ───────────── */

/**
 * Compone una pieza. `piece`:
 *   dimension: entity|arcade|academy|lab · format: feed|square|story|li|liwide|lidoc
 *   template: title|writes|table|region|node|ident|image|transmission
 *   title, subtitle, kicker, body, cta, code (p. ej. "011 · 3/5"), rows ([[a,b,c],…]), head ([..]),
 *   lines ([..] para transmission/region), tag, accent (nombre de ACCENTS o color), image (data: o URL),
 *   fiction (línea de ficción declarada; '' para quitarla), footer (por defecto 'EVA · 2026'),
 *   orbit (true/false), marks (true/false), markSize ('s'|'m'|'l').
 */
export function compose(piece, { fontCss = '' } = {}) {
  const dim = DIMENSIONS[piece.dimension] ?? DIMENSIONS.entity;
  const fmt = FORMATS[piece.format] ?? FORMATS.feed;
  const { w, h } = fmt;
  const accent = ACCENTS[piece.accent] ?? piece.accent ?? dim.accent;
  const surface = piece.surface ?? dim.surface;
  const template = TEMPLATES[piece.template] ?? TEMPLATES.title;
  const unit = Math.min(w, h) / 1080; // escala: 1 a 1080 px de lado menor
  const pad = Math.round(72 * unit);
  const safeTop = (fmt.safeTop ?? 0) * (h / 1920);
  const safeBottom = (fmt.safeBottom ?? 0) * (h / 1920);
  const ctx = { w, h, unit, pad, accent, accent2: dim.accent2, dim, fmt, surface, safeTop, safeBottom, piece };

  const layers = [];
  layers.push(`<rect width="${w}" height="${h}" fill="${surface}"/>`);
  if (piece.orbit ?? template.orbit) layers.push(orbitLayer(w, h, Math.min(w, h) * (piece.orbitRadius ?? template.orbitRadius ?? 0.36), { opacity: piece.orbitOpacity ?? template.orbitOpacity ?? 0.55 }));
  // Un velo de acento muy tenue arriba a la izquierda, como la caja EVA // ESCRIBE.
  layers.push(`<defs><linearGradient id="veil" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${accent}" stop-opacity=".07"/><stop offset=".42" stop-color="${accent}" stop-opacity="0"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#veil)"/>`);
  if (piece.marks ?? template.marks ?? true) layers.push(instrumentMarks(w, h, accent, Math.round(28 * unit)));
  const rendered = template.render(ctx);
  if (rendered.bottom == null || template.bare) layers.push(rendered.markup);
  else {
    // Centrado óptico: el bloque de contenido baja para no quedar pegado a la cabecera,
    // sin llegar al centro exacto (0,42 del aire libre).
    const headBottom = pad + safeTop + 64 * unit;
    const footTop = h - pad - safeBottom - 90 * unit;
    const free = footTop - rendered.bottom;
    const dy = free > 0 ? free * (piece.balance ?? 0.42) : 0;
    layers.push(`<g transform="translate(0 ${r(dy)})">${rendered.markup}</g>`);
    void headBottom;
  }
  if (!template.bare) layers.push(chrome(ctx));

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<style>${fontCss}text{white-space:pre}</style>
${layers.join('\n')}
</svg>`;
}

/** Cabecera y pie comunes: rótulo de sistema, código, ficción declarada, firma y CTA. */
function chrome({ w, h, unit, pad, accent, dim, piece, safeTop, safeBottom }) {
  const micro = 20 * unit;
  const top = pad + safeTop;
  const bottom = h - pad - safeBottom;
  const label = piece.label ?? dim.label;
  const code = piece.code ?? dim.code;
  const fiction = piece.fiction ?? 'Ficción interactiva. EVA es un personaje.';
  const footer = piece.footer ?? 'EVA · 2026';
  const cta = piece.cta ?? '';
  const out = [];
  out.push(`<text x="${pad}" y="${r(top + micro * 0.86)}" font-family="${MONO}" font-size="${micro}" font-weight="600" fill="${accent}" letter-spacing="${r(micro * 0.16)}">${esc(label)}</text>`);
  out.push(`<text x="${w - pad}" y="${r(top + micro * 0.86)}" font-family="${MONO}" font-size="${micro}" fill="${TEXT.muted}" text-anchor="end" letter-spacing="${r(micro * 0.12)}">${esc(code)}</text>`);
  out.push(`<line x1="${pad}" y1="${r(top + micro * 1.9)}" x2="${w - pad}" y2="${r(top + micro * 1.9)}" stroke="${LINE}" stroke-width="1"/>`);
  if (fiction) out.push(`<text x="${pad}" y="${r(bottom - micro * 1.5)}" font-family="${MONO}" font-size="${micro * 0.85}" fill="${TEXT.muted}" opacity=".8">${esc(fiction)}</text>`);
  out.push(`<text x="${pad}" y="${r(bottom)}" font-family="${MONO}" font-size="${micro}" fill="${TEXT.soft}" letter-spacing="${r(micro * 0.12)}">${esc(footer)}</text>`);
  if (cta) out.push(`<text x="${w - pad}" y="${r(bottom)}" font-family="${MONO}" font-size="${micro}" font-weight="600" fill="${accent}" text-anchor="end" letter-spacing="${r(micro * 0.12)}">${esc(cta)} →</text>`);
  return out.join('\n');
}

/** La pieza de marca pequeña bajo la cabecera, a la izquierda. Devuelve el alto que ocupa. */
function markRow(ctx, size = 's') {
  const { pad, unit, dim, piece, safeTop } = ctx;
  const pose = piece.mark ?? dim.mark;
  const heights = pose === 'logotype' ? { s: 44, m: 72, l: 120 } : { s: 64, m: 96, l: 150 };
  const hgt = heights[size] * unit;
  const y = pad + safeTop + 64 * unit;
  const width = pose === 'logotype' ? hgt * 5.3 : hgt * 0.43;
  return { markup: brandMark(pose, { x: pad, y, width, height: hgt, id: 'mk', blur: 0.7 }), bottom: y + hgt };
}

/* ───────────── Plantillas ───────────── */

const TEMPLATES = {
  /** Portada / título grande. */
  title: {
    orbit: false,
    render(ctx) {
      const { w, h, pad, unit, accent, piece, safeBottom } = ctx;
      const width = w - pad * 2;
      const mark = markRow(ctx, 'm');
      let y = mark.bottom + 72 * unit;
      const out = [mark.markup];
      if (piece.kicker) {
        const k = textBlock({ x: pad, y, width, text: piece.kicker, size: 24 * unit, font: MONO, weight: 600, color: accent, letterSpacing: 3 * unit, upper: true });
        out.push(k.markup);
        y += k.height + 28 * unit;
      }
      const size = (piece.title?.length > 42 ? 60 : 78) * unit;
      const t = textBlock({ x: pad, y, width, text: piece.title ?? '', size, weight: 700, lineHeight: 1.06, color: TEXT.strong });
      out.push(t.markup);
      y += t.height + 34 * unit;
      out.push(`<rect x="${pad}" y="${r(y)}" width="${r(96 * unit)}" height="${r(4 * unit)}" fill="${accent}"/>`);
      y += 44 * unit;
      if (piece.subtitle) {
        const s = textBlock({ x: pad, y, width: width * 0.86, text: piece.subtitle, size: 34 * unit, color: TEXT.soft, lineHeight: 1.36 });
        out.push(s.markup);
        y += s.height;
      }
      if (piece.body) {
        y += 36 * unit;
        const b = textBlock({ x: pad, y, width: width * 0.9, text: piece.body, size: 28 * unit, color: TEXT.soft, lineHeight: 1.42 });
        out.push(b.markup);
        y += b.height;
      }
      void h; void safeBottom;
      return { markup: out.join('\n'), bottom: y };
    },
  },

  /** La caja EVA // ESCRIBE: marco, barra con estado, texto que EVA teclea. */
  writes: {
    orbit: false,
    render(ctx) {
      const { w, h, pad, unit, accent, piece, safeTop, safeBottom } = ctx;
      const mark = markRow(ctx, 's');
      const x = pad;
      const y = mark.bottom + 56 * unit;
      const width = w - pad * 2;
      const micro = 19 * unit;
      const inner = 40 * unit;
      const bodySize = (piece.body?.length > 260 ? 30 : 36) * unit;
      const body = textBlock({ x: x + inner, y: y + micro * 3.3 + inner * 0.6 + (piece.kicker ? 40 * unit : 0), width: width - inner * 2, text: piece.body ?? piece.title ?? '', size: bodySize, color: TEXT.strong, lineHeight: 1.42 });
      const kicker = piece.kicker
        ? textBlock({ x: x + inner, y: y + micro * 3.3 + inner * 0.5, width: width - inner * 2, text: piece.kicker, size: 22 * unit, font: MONO, weight: 600, color: accent, letterSpacing: 3 * unit, upper: true })
        : { markup: '', height: 0 };
      let slogan = { markup: '', height: 0 };
      let boxH = micro * 3.3 + inner * 0.6 + kicker.height + (piece.kicker ? 40 * unit - kicker.height : 0) + body.height + inner;
      if (piece.subtitle) {
        slogan = textBlock({ x: x + inner, y: y + boxH + 8 * unit, width: width - inner * 2, text: piece.subtitle, size: 22 * unit, font: MONO, weight: 600, color: accent, letterSpacing: 2 * unit, upper: true, lineHeight: 1.5 });
        boxH += slogan.height + 8 * unit + inner * 0.8;
      }
      const maxH = h - y - pad - safeBottom - 70 * unit;
      const finalH = Math.min(boxH, maxH);
      const parts = [
        mark.markup,
        `<defs><linearGradient id="wb" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${accent}" stop-opacity=".09"/><stop offset=".42" stop-color="${accent}" stop-opacity="0"/></linearGradient></defs>`,
        `<rect x="${x}" y="${r(y)}" width="${width}" height="${r(finalH)}" rx="${r(12 * unit)}" fill="rgba(3,9,16,.86)" stroke="${accent}" stroke-opacity=".42" stroke-width="1.5"/>`,
        `<rect x="${x}" y="${r(y)}" width="${width}" height="${r(finalH)}" rx="${r(12 * unit)}" fill="url(#wb)"/>`,
        `<line x1="${x}" y1="${r(y + micro * 2.6)}" x2="${x + width}" y2="${r(y + micro * 2.6)}" stroke="${accent}" stroke-opacity=".28"/>`,
        `<text x="${r(x + inner * 0.6)}" y="${r(y + micro * 1.75)}" font-family="${MONO}" font-size="${micro}" font-weight="600" fill="${accent}" letter-spacing="${r(micro * 0.14)}">EVA // ESCRIBE</text>`,
        `<text x="${r(x + width - inner * 0.6)}" y="${r(y + micro * 1.75)}" font-family="${MONO}" font-size="${micro}" fill="${TEXT.muted}" text-anchor="end" letter-spacing="${r(micro * 0.12)}"><tspan fill="${accent}">●</tspan> ${esc(piece.state ?? 'ESCRITO')}</text>`,
        kicker.markup,
        body.markup,
        slogan.markup,
      ];
      void safeTop;
      return { markup: parts.join('\n'), bottom: y + finalH };
    },
  },

  /** Tabla comparativa de dos columnas (USTEDES / YO): el formato «EVA compara». */
  table: {
    orbit: false,
    render(ctx) {
      const { w, pad, unit, accent, piece } = ctx;
      const width = w - pad * 2;
      const mark = markRow(ctx, 's');
      let y = mark.bottom + 60 * unit;
      const out = [mark.markup];
      if (piece.kicker) {
        const k = textBlock({ x: pad, y, width, text: piece.kicker, size: 22 * unit, font: MONO, weight: 600, color: accent, letterSpacing: 3 * unit, upper: true });
        out.push(k.markup);
        y += k.height + 22 * unit;
      }
      if (piece.title) {
        const t = textBlock({ x: pad, y, width, text: piece.title, size: 56 * unit, weight: 700, lineHeight: 1.08 });
        out.push(t.markup);
        y += t.height + 48 * unit;
      }
      const head = piece.head ?? ['', 'USTEDES', 'YO'];
      const rows = piece.rows ?? [];
      const col0 = width * 0.3;
      const col = (width - col0) / 2;
      const hs = 20 * unit;
      out.push(`<text x="${r(pad + col0)}" y="${r(y + hs)}" font-family="${MONO}" font-size="${hs}" font-weight="600" fill="${TEXT.muted}" letter-spacing="${r(hs * 0.14)}">${esc(head[1])}</text>`);
      out.push(`<text x="${r(pad + col0 + col)}" y="${r(y + hs)}" font-family="${MONO}" font-size="${hs}" font-weight="600" fill="${accent}" letter-spacing="${r(hs * 0.14)}">${esc(head[2])}</text>`);
      y += hs * 2.2;
      out.push(`<line x1="${pad}" y1="${r(y)}" x2="${pad + width}" y2="${r(y)}" stroke="${accent}" stroke-opacity=".5" stroke-width="1.5"/>`);
      const cell = 34 * unit;
      for (const row of rows) {
        const a = textBlock({ x: pad, y: y + 22 * unit, width: col0 - 16 * unit, text: row[0], size: 20 * unit, font: MONO, weight: 600, color: TEXT.muted, letterSpacing: 2 * unit, upper: true });
        const b = textBlock({ x: pad + col0, y: y + 20 * unit, width: col - 24 * unit, text: row[1], size: cell, color: TEXT.soft, lineHeight: 1.25 });
        const c = textBlock({ x: pad + col0 + col, y: y + 20 * unit, width: col - 24 * unit, text: row[2], size: cell, weight: 500, color: TEXT.strong, lineHeight: 1.25 });
        const rowH = Math.max(a.height, b.height, c.height) + 40 * unit;
        out.push(a.markup, b.markup, c.markup);
        y += rowH;
        out.push(`<line x1="${pad}" y1="${r(y)}" x2="${pad + width}" y2="${r(y)}" stroke="${LINE}"/>`);
      }
      if (piece.subtitle) {
        const s = textBlock({ x: pad, y: y + 40 * unit, width, text: piece.subtitle, size: 22 * unit, font: MONO, weight: 600, color: accent, letterSpacing: 2 * unit, upper: true, lineHeight: 1.5 });
        out.push(s.markup);
        y += 40 * unit + s.height;
      }
      return { markup: out.join('\n'), bottom: y };
    },
  },

  /** Una región del cerebro: código grande, verbo, nombre y sus líneas. */
  region: {
    orbit: false,
    render(ctx) {
      const { w, pad, unit, accent, piece } = ctx;
      const width = w - pad * 2;
      const mark = markRow(ctx, 's');
      let y = mark.bottom + 64 * unit;
      const out = [mark.markup];
      const big = 150 * unit;
      out.push(`<text x="${pad}" y="${r(y + big * 0.78)}" font-family="${MONO}" font-size="${big}" font-weight="600" fill="${accent}" letter-spacing="${r(big * 0.06)}">${esc(piece.code2 ?? piece.tag ?? '0001')}</text>`);
      y += big * 1.04;
      if (piece.kicker) {
        const k = textBlock({ x: pad, y, width, text: piece.kicker, size: 26 * unit, font: MONO, weight: 600, color: TEXT.muted, letterSpacing: 4 * unit, upper: true });
        out.push(k.markup);
        y += k.height + 18 * unit;
      }
      const t = textBlock({ x: pad, y, width, text: piece.title ?? '', size: 56 * unit, weight: 700, lineHeight: 1.08 });
      out.push(t.markup);
      y += t.height + 40 * unit;
      out.push(`<rect x="${pad}" y="${r(y)}" width="${r(96 * unit)}" height="${r(4 * unit)}" fill="${accent}"/>`);
      y += 48 * unit;
      const lines = piece.lines ?? [];
      lines.forEach((line, k) => {
        const last = k === lines.length - 1;
        const b = textBlock({ x: pad, y, width: width * 0.92, text: line, size: 32 * unit, weight: last ? 500 : 400, color: last ? TEXT.strong : TEXT.soft, lineHeight: 1.38 });
        out.push(b.markup);
        y += b.height + 22 * unit;
      });
      return { markup: out.join('\n'), bottom: y };
    },
  },

  /** Tarjeta de lanzamiento de Arcade: NODE · estado · categoría · título · descripción. */
  node: {
    orbit: false,
    render(ctx) {
      const { w, h, pad, unit, accent, piece, safeBottom } = ctx;
      const width = w - pad * 2;
      const mark = markRow(ctx, 's');
      let y = mark.bottom + 56 * unit;
      const out = [mark.markup];
      const micro = 22 * unit;
      out.push(`<text x="${pad}" y="${r(y + micro * 0.86)}" font-family="${MONO}" font-size="${micro}" font-weight="600" fill="${TEXT.soft}" letter-spacing="${r(micro * 0.16)}">${esc(piece.node ?? 'NODE 01')}</text>`);
      const st = piece.state ?? 'EN LÍNEA';
      const stW = measure(st, micro, MONO, 600) + micro * 1.6;
      out.push(`<rect x="${r(pad + measure(piece.node ?? 'NODE 01', micro, MONO, 600) + micro * 1.4)}" y="${r(y - micro * 0.35)}" width="${r(stW)}" height="${r(micro * 1.6)}" rx="${r(micro * 0.8)}" fill="${accent}" fill-opacity=".14" stroke="${accent}" stroke-opacity=".6"/>`);
      out.push(`<text x="${r(pad + measure(piece.node ?? 'NODE 01', micro, MONO, 600) + micro * 1.4 + stW / 2)}" y="${r(y + micro * 0.8)}" font-family="${MONO}" font-size="${micro * 0.9}" font-weight="600" fill="${accent}" text-anchor="middle" letter-spacing="${r(micro * 0.12)}">${esc(st)}</text>`);
      y += micro * 2.6;
      // Espacio para una ilustración o captura (slot).
      const artH = (piece.image ? 0.42 : 0.3) * (h - safeBottom);
      if (piece.image) {
        out.push(`<clipPath id="art"><rect x="${pad}" y="${r(y)}" width="${width}" height="${r(artH)}" rx="${r(10 * unit)}"/></clipPath><image href="${esc(piece.image)}" x="${pad}" y="${r(y)}" width="${width}" height="${r(artH)}" preserveAspectRatio="xMidYMid slice" clip-path="url(#art)"/>`);
      } else {
        out.push(gridArt(pad, y, width, artH, accent, unit));
      }
      out.push(`<rect x="${pad}" y="${r(y)}" width="${width}" height="${r(artH)}" rx="${r(10 * unit)}" fill="none" stroke="${accent}" stroke-opacity=".35"/>`);
      y += artH + 44 * unit;
      const k = textBlock({ x: pad, y, width, text: piece.kicker ?? '', size: 22 * unit, font: MONO, weight: 600, color: accent, letterSpacing: 3 * unit, upper: true });
      out.push(k.markup);
      y += k.height + 20 * unit;
      const t = textBlock({ x: pad, y, width, text: piece.title ?? '', size: 66 * unit, weight: 700, lineHeight: 1.04 });
      out.push(t.markup);
      y += t.height + 24 * unit;
      const s = textBlock({ x: pad, y, width: width * 0.9, text: piece.subtitle ?? piece.body ?? '', size: 30 * unit, color: TEXT.soft, lineHeight: 1.4 });
      out.push(s.markup);
      y += s.height;
      return { markup: out.join('\n'), bottom: y };
    },
  },

  /** Sólo la marca, en su órbita: ident, portada de Reel, avatar. */
  ident: {
    orbit: true,
    orbitRadius: 0.34,
    orbitOpacity: 0.85,
    marks: false,
    bare: true,
    render(ctx) {
      const { w, h, unit, dim, piece } = ctx;
      const pose = piece.mark ?? dim.mark;
      const size = Math.min(w, h);
      const box = pose === 'logotype' ? { width: size * 0.5, height: size * 0.5 * (6 / 31.65) } : { width: size * 0.5, height: size * 0.5 };
      const out = [brandMark(pose, { x: (w - box.width) / 2, y: (h - box.height) / 2, width: box.width, height: box.height, id: 'id', blur: 0.8 })];
      const micro = 22 * unit;
      if (piece.title) out.push(`<text x="${w / 2}" y="${r(h / 2 + box.height / 2 + 64 * unit)}" font-family="${MONO}" font-size="${micro}" fill="#b9c3e8" text-anchor="middle" letter-spacing="${r(micro * 0.4)}">${esc(String(piece.title).toUpperCase())}</text>`);
      if (piece.subtitle) out.push(`<text x="${w / 2}" y="${r(h / 2 + box.height / 2 + 64 * unit + micro * 1.9)}" font-family="${MONO}" font-size="${micro * 0.85}" fill="${TEXT.muted}" text-anchor="middle" letter-spacing="${r(micro * 0.2)}">${esc(piece.subtitle)}</text>`);
      if (piece.footer !== '') out.push(`<text x="${w / 2}" y="${r(h - 48 * unit)}" font-family="${MONO}" font-size="${micro * 0.85}" fill="${TEXT.muted}" text-anchor="middle" letter-spacing="${r(micro * 0.12)}">${esc(piece.footer ?? 'EVA · 2026')}</text>`);
      return { markup: out.join('\n'), bottom: null };
    },
  },

  /** Imagen a sangre (retrato, captura de juego) con un velo y el texto abajo. */
  image: {
    orbit: false,
    render(ctx) {
      const { w, h, pad, unit, accent, piece, safeBottom } = ctx;
      const width = w - pad * 2;
      const out = [];
      if (piece.image) out.push(`<image href="${esc(piece.image)}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"/>`);
      else out.push(`<rect width="${w}" height="${h}" fill="#070a0e"/>${gridArt(0, 0, w, h, accent, unit, 0.5)}`);
      out.push(`<defs><linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset=".25" stop-color="${ctx.surface}" stop-opacity="0"/><stop offset=".72" stop-color="${ctx.surface}" stop-opacity=".92"/><stop offset="1" stop-color="${ctx.surface}"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#fade)"/>`);
      out.push(`<rect width="${w}" height="${r(pad * 2.2)}" fill="${ctx.surface}" fill-opacity=".55"/>`);
      const mark = markRow(ctx, 's');
      out.push(mark.markup);
      let y = h - pad - safeBottom - 96 * unit;
      const size = (piece.title?.length > 40 ? 52 : 64) * unit;
      const t = textBlock({ x: pad, y: 0, width, text: piece.title ?? '', size, weight: 700, lineHeight: 1.06 });
      const s = piece.subtitle ? textBlock({ x: pad, y: 0, width: width * 0.9, text: piece.subtitle, size: 28 * unit, color: TEXT.soft, lineHeight: 1.4 }) : { height: 0, markup: '' };
      const k = piece.kicker ? textBlock({ x: pad, y: 0, width, text: piece.kicker, size: 22 * unit, font: MONO, weight: 600, color: accent, letterSpacing: 3 * unit, upper: true }) : { height: 0, markup: '' };
      y -= s.height + (s.height ? 20 * unit : 0) + t.height + (k.height ? k.height + 20 * unit : 0);
      if (k.markup) {
        out.push(textBlock({ x: pad, y, width, text: piece.kicker, size: 22 * unit, font: MONO, weight: 600, color: accent, letterSpacing: 3 * unit, upper: true }).markup);
        y += k.height + 20 * unit;
      }
      out.push(textBlock({ x: pad, y, width, text: piece.title ?? '', size, weight: 700, lineHeight: 1.06 }).markup);
      y += t.height + 20 * unit;
      if (s.markup) out.push(textBlock({ x: pad, y, width: width * 0.9, text: piece.subtitle, size: 28 * unit, color: TEXT.soft, lineHeight: 1.4 }).markup);
      return { markup: out.join('\n'), bottom: null };
    },
  },

  /** Transmisión SINAPSIS: líneas en mono con el prompt `>`, como el canal. Vertical por naturaleza. */
  transmission: {
    orbit: false,
    render(ctx) {
      const { w, h, pad, unit, accent, piece, safeTop, safeBottom } = ctx;
      const width = w - pad * 2;
      const mark = markRow(ctx, 's');
      const out = [mark.markup];
      const micro = 20 * unit;
      let y = mark.bottom + 60 * unit;
      out.push(`<text x="${pad}" y="${r(y + micro * 0.86)}" font-family="${MONO}" font-size="${micro}" font-weight="600" fill="${accent}" letter-spacing="${r(micro * 0.16)}">SINAPSIS // EVA</text>`);
      out.push(`<text x="${w - pad}" y="${r(y + micro * 0.86)}" font-family="${MONO}" font-size="${micro}" fill="${TEXT.muted}" text-anchor="end" letter-spacing="${r(micro * 0.12)}">${esc(piece.state ?? 'HILO ABIERTO')}</text>`);
      y += micro * 2.4;
      const lines = piece.lines ?? String(piece.body ?? '').split('\n').filter(Boolean);
      const size = (lines.join(' ').length > 420 ? 30 : 36) * unit;
      const maxY = h - pad - safeBottom - 80 * unit;
      for (const line of lines) {
        const kind = line.startsWith('>') ? 'calc' : 'thought';
        const text = kind === 'calc' ? line.slice(1).trim() : line;
        const b = textBlock({ x: pad + 34 * unit, y, width: width - 34 * unit, text, size: kind === 'calc' ? size * 0.8 : size, font: MONO, color: kind === 'calc' ? accent : TEXT.strong, lineHeight: 1.5 });
        if (y + b.height > maxY) break;
        out.push(`<text x="${pad}" y="${r(y + size * 0.86)}" font-family="${MONO}" font-size="${size}" fill="${accent}" opacity=".7">${kind === 'calc' ? '·' : '>'}</text>`);
        out.push(b.markup);
        y += b.height + size * 0.7;
      }
      // El cursor al final, como en el canal.
      out.push(`<rect x="${pad + 34 * unit}" y="${r(y + size * 0.1)}" width="${r(size * 0.55)}" height="${r(size * 1.1)}" fill="${accent}" opacity=".85"/>`);
      void safeTop;
      return { markup: out.join('\n'), bottom: y + size * 1.2 };
    },
  },
};

/** Ilustración de reserva para el slot de imagen: la retícula de etapas de Arcade (GameCard). */
function gridArt(x, y, w, h, accent, unit, opacity = 1) {
  const cy = y + h / 2;
  const stages = [0.12, 0.31, 0.5, 0.69, 0.88].map((k) => x + w * k);
  let dots = '';
  for (let gx = x + 16 * unit; gx < x + w; gx += 32 * unit) for (let gy = y + 16 * unit; gy < y + h; gy += 32 * unit) dots += `<circle cx="${r(gx)}" cy="${r(gy)}" r="${r(1.4 * unit)}"/>`;
  return `<g opacity="${opacity}"><g fill="${accent}" opacity=".22">${dots}</g>
<g fill="none" stroke="${accent}" stroke-width="${r(1.5 * unit)}"><line x1="${x}" y1="${r(cy)}" x2="${x + w}" y2="${r(cy)}" opacity=".35"/><path d="M${r(stages[2])} ${r(cy)} V${r(cy - h * 0.26)} H${x + w}" opacity=".55"/><path d="M${r(stages[3])} ${r(cy)} V${r(cy + h * 0.26)} H${x + w}" opacity=".4" stroke-dasharray="${r(4 * unit)} ${r(7 * unit)}"/></g>
${stages.map((sx, k) => `<g transform="translate(${r(sx)} ${r(cy)})"><circle r="${r((k === 2 ? 14 : 9) * unit)}" fill="${accent}" opacity="${k === 2 ? 0.2 : 0.1}"/><circle r="${r(4.5 * unit)}" fill="${k <= 2 ? accent : 'none'}" stroke="${accent}" stroke-width="${r(1.5 * unit)}"/></g>`).join('')}
<circle cx="${r(stages[2])}" cy="${r(cy)}" r="${r(2 * unit)}" fill="#f3f5ff"/></g>`;
}

export const TEMPLATE_IDS = Object.keys(TEMPLATES);
export { bin };

/**
 * EVA LAB · brand-frames — la marca como archivos, desde su geometría.
 *
 *   node --import ./scripts/test-hooks.mjs scripts/brand-frames.mjs <salida> [opciones]
 *
 * Escribe en <salida>:
 *   poses/<pose>.svg          las cinco poses del storyboard (isotype, detach, unlock, split, logotype)
 *   poses/<pose>-flat.svg     las mismas sin halo (para fondos claros o para recortar)
 *   frames/loop-NNNN.svg      fotogramas del bucle LOOP (nombre → símbolo → nombre), a --fps
 *   frames/reveal-NNNN.svg    fotogramas de REVEAL (símbolo → nombre)
 *   sheet.html                hoja de contacto para revisar a ojo
 *   manifest.json             qué se generó, con duraciones y tamaños
 *
 * Opciones: --fps=30 (por defecto 30) · --only=poses|frames · --pad=1.6 · --box=WxH (encuadre fijo,
 * en unidades de la marca; por defecto el de la pose más ancha, para que el vídeo no salte).
 *
 * Los PNG y el vídeo no salen de aquí: sale SVG puro, sin dependencias. Para rasterizar,
 * `scripts/render-frames.mjs` usa el Chrome de la máquina, y ffmpeg hace el MP4/GIF.
 *
 * Reutiliza `src/lib/brand.ts` tal cual: `brandSvgFromPose` acepta las poses intermedias de
 * `sample()` (antes `brandSvg` sólo aceptaba una pose con nombre).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  BRAND_COLORS,
  LOOP,
  POSES,
  REVEAL,
  boundsOf,
  brandSvgFromPose as svgFromPose,
  durationOf,
  sample,
} from '../src/lib/brand.ts';

const args = process.argv.slice(2);
const out = args.find((a) => !a.startsWith('--'));
if (!out) {
  console.error('Uso: node --import ./scripts/test-hooks.mjs scripts/brand-frames.mjs <salida> [--fps=30] [--only=poses|frames]');
  process.exit(1);
}
const opt = (name, fallback) => {
  const found = args.find((a) => a.startsWith(`--${name}=`));
  return found ? found.slice(name.length + 3) : fallback;
};
const fps = Number(opt('fps', 30));
const only = opt('only', '');
const pad = Number(opt('pad', 1.6));
const round = (v) => Math.round(v * 1000) / 1000;

/* ───────────── SVG de una pose cualquiera ───────────── */

/** Caja fija que encierra todas las poses (con aire): así el encuadre no salta entre fotogramas. */
function steadyBox() {
  const box = { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity };
  for (const pose of Object.values(POSES)) {
    const b = boundsOf(pose);
    box.left = Math.min(box.left, b.left);
    box.top = Math.min(box.top, b.top);
    box.right = Math.max(box.right, b.right);
    box.bottom = Math.max(box.bottom, b.bottom);
  }
  return box;
}

const fixed = (() => {
  const custom = opt('box', '');
  if (custom) {
    const [w, h] = custom.split('x').map(Number);
    return { left: -w / 2, right: w / 2, top: -h / 2, bottom: h / 2 };
  }
  return steadyBox();
})();

/** La marca en SVG desde una pose cualquiera: `brandSvgFromPose` de `src/lib/brand.ts`, con el encuadre fijo por defecto. */
function brandSvgFromPose(pose, { box = fixed, blur = 0.8, halo = true, ground = null } = {}) {
  return svgFromPose(pose, { pad, blur, box, halo, ground: ground ?? undefined });
}

/* ───────────── Escritura ───────────── */

const manifest = { generated: new Date().toISOString(), fps, box: fixed, poses: [], timelines: {} };
mkdirSync(path.join(out, 'poses'), { recursive: true });
mkdirSync(path.join(out, 'frames'), { recursive: true });

if (only !== 'frames') {
  for (const [id, pose] of Object.entries(POSES)) {
    const b = boundsOf(pose);
    writeFileSync(path.join(out, 'poses', `${id}.svg`), brandSvgFromPose(pose, { box: b, ground: BRAND_COLORS.ground }));
    writeFileSync(path.join(out, 'poses', `${id}-flat.svg`), brandSvgFromPose(pose, { box: b, halo: false }));
    writeFileSync(path.join(out, 'poses', `${id}-transparent.svg`), brandSvgFromPose(pose, { box: b }));
    manifest.poses.push({ id, width: round(b.right - b.left), height: round(b.bottom - b.top) });
  }
}

if (only !== 'poses') {
  for (const [name, steps] of [
    ['loop', LOOP],
    ['reveal', REVEAL],
  ]) {
    const total = durationOf(steps);
    const count = Math.round((total / 1000) * fps);
    for (let k = 0; k < count; k++) {
      const { pose } = sample(steps, (k / fps) * 1000);
      writeFileSync(path.join(out, 'frames', `${name}-${String(k).padStart(4, '0')}.svg`), brandSvgFromPose(pose, { ground: BRAND_COLORS.ground }));
    }
    manifest.timelines[name] = { ms: total, frames: count };
  }
}

/* ───────────── Hoja de contacto ───────────── */

const cells = manifest.poses
  .map((p) => `<figure><img src="poses/${p.id}.svg" alt="${p.id}"><figcaption>${p.id} · ${p.width}×${p.height}</figcaption></figure>`)
  .join('');
const strip = Object.entries(manifest.timelines)
  .map(([name, t]) => {
    const picks = Array.from({ length: 12 }, (_, i) => Math.floor((i * (t.frames - 1)) / 11));
    return `<h2>${name} · ${t.ms} ms · ${t.frames} fotogramas</h2><div class="strip">${picks
      .map((k) => `<img src="frames/${name}-${String(k).padStart(4, '0')}.svg" alt="">`)
      .join('')}</div>`;
  })
  .join('');
writeFileSync(
  path.join(out, 'sheet.html'),
  `<!doctype html><meta charset="utf-8"><title>EVA · brand-frames</title>
<style>body{margin:0;background:${BRAND_COLORS.ground};color:#c3ccd2;font:14px/1.4 ui-monospace,monospace;padding:24px}
h1,h2{font-weight:600;font-size:14px;letter-spacing:.12em;text-transform:uppercase;color:#8e9ba3}
.poses{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px}figure{margin:0;background:#070a0e;padding:12px;border:1px solid rgba(226,233,238,.1)}
figure img{width:100%;height:120px;object-fit:contain}figcaption{margin-top:8px;font-size:11px}
.strip{display:grid;grid-template-columns:repeat(12,1fr);gap:4px}.strip img{width:100%;aspect-ratio:${round(fixed.right - fixed.left + pad * 2)}/${round(fixed.bottom - fixed.top + pad * 2)};background:#070a0e}</style>
<h1>EVA · brand-frames · ${fps} fps</h1><div class="poses">${cells}</div>${strip}`,
);
writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`brand-frames → ${out}: ${manifest.poses.length} poses, ${Object.values(manifest.timelines).reduce((n, t) => n + t.frames, 0)} fotogramas`);

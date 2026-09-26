/**
 * EVA LAB · transmisión — una pieza de texto tecleado, fotograma a fotograma, con el ritmo real
 * del canal SINAPSIS (`src/lib/channel.ts`): 48 ms por carácter, la puntuación respira, las líneas
 * de cálculo (`> …`) van a 18 ms y cada frase terminada se sostiene entre 1,8 y 4,2 s.
 *
 *   node --import ./scripts/test-hooks.mjs scripts/transmision.mjs <pieza.json> <salida> [--fps=30] [--tail=2.5] [--speed=1]
 *
 * <pieza.json> es una pieza del Social Studio con plantilla `transmission` (o `writes`: entonces
 * se teclea `body`). Escribe `frames/tx-NNNN.svg` y `manifest.json` (duración, fotogramas, en qué
 * fotograma termina cada línea, para subtítulos). Después:
 *
 *   node scripts/render-frames.mjs <salida>/frames <salida>/png --glob=tx-
 *   ffmpeg -framerate 30 -i <salida>/png/tx-%04d.png -c:v libx264 -pix_fmt yuv420p -crf 18 transmision.mp4
 *
 * El cursor parpadea a 1 Hz en las pausas. Con `--speed=2` el vídeo va al doble (para Stories de
 * menos de 15 s) sin cambiar las proporciones del ritmo.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { CALC_MS, TYPE_MS, holdAfter, pauseAfter } from '../src/lib/channel.ts';

const args = process.argv.slice(2);
const [pieceFile, out] = args.filter((a) => !a.startsWith('--'));
if (!pieceFile || !out) {
  console.error('Uso: node --import ./scripts/test-hooks.mjs scripts/transmision.mjs <pieza.json> <salida> [--fps=30] [--tail=2.5] [--speed=1]');
  process.exit(1);
}
const opt = (name, fallback) => {
  const found = args.find((a) => a.startsWith(`--${name}=`));
  return found ? Number(found.slice(name.length + 3)) : fallback;
};
const fps = opt('fps', 30);
const tail = opt('tail', 2.5);
const speed = opt('speed', 1);

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const { compose, offsetOf } = await import(pathToFileURL(path.join(root, 'tools/social-studio/src/templates.js')).href);
/** Las mismas fuentes incrustadas que el Studio (OFL 1.1), para que Chrome no dependa del sistema. */
function fontFaces() {
  const dir = path.join(root, 'tools/social-studio/fonts');
  const list = [['Space Grotesk', 400, 'SpaceGrotesk-Regular.woff2'], ['Space Grotesk', 500, 'SpaceGrotesk-Medium.woff2'], ['Space Grotesk', 700, 'SpaceGrotesk-Bold.woff2'], ['JetBrains Mono', 400, 'JetBrainsMono-Regular.woff2'], ['JetBrains Mono', 600, 'JetBrainsMono-SemiBold.woff2']];
  return list
    .filter(([, , file]) => existsSync(path.join(dir, file)))
    .map(([family, weight, file]) => `@font-face{font-family:'${family}';font-weight:${weight};src:url(data:font/woff2;base64,${readFileSync(path.join(dir, file)).toString('base64')}) format('woff2')}`)
    .join('\n');
}

const piece = JSON.parse(readFileSync(pieceFile, 'utf8'));
const lines = piece.lines ?? String(piece.body ?? '').split('\n').filter(Boolean);

/* 1 · La línea de tiempo: en qué milisegundo aparece cada carácter. */
const events = []; // { t, line, chars }
let t = 0;
const lineEnds = [];
lines.forEach((line, k) => {
  const calc = line.startsWith('>');
  const text = calc ? line.slice(1).trim() : line;
  const per = (calc ? CALC_MS : TYPE_MS) / speed;
  for (let c = 1; c <= text.length; c++) {
    t += per + (calc ? 0 : pauseAfter(text[c - 1]) / speed);
    events.push({ t, line: k, chars: c });
  }
  const hold = (calc ? 600 : holdAfter(text)) / speed;
  lineEnds.push({ line: k, endMs: t, holdMs: hold });
  t += hold;
});
const total = t + tail * 1000;
const count = Math.ceil((total / 1000) * fps);

/* 2 · Un fotograma por instante: las líneas completas más la que se está tecleando. */
function visibleAt(ms) {
  const shown = [];
  let cursorLine = -1;
  let cursorChars = 0;
  for (const e of events) {
    if (e.t > ms) break;
    cursorLine = e.line;
    cursorChars = e.chars;
  }
  for (let k = 0; k < lines.length; k++) {
    const calc = lines[k].startsWith('>');
    const text = calc ? lines[k].slice(1).trim() : lines[k];
    if (k < cursorLine) shown.push(lines[k]);
    else if (k === cursorLine) shown.push((calc ? '> ' : '') + text.slice(0, cursorChars));
  }
  const typing = events.some((e) => Math.abs(e.t - ms) < 1000 / fps) || ms < events[0]?.t;
  return { shown, typing, done: ms >= events[events.length - 1]?.t };
}

mkdirSync(path.join(out, 'frames'), { recursive: true });
const faces = fontFaces();
// El bloque se coloca donde quedará al final, y no se mueve mientras se teclea.
const offsetY = piece.offsetY ?? offsetOf({ ...piece, lines });
for (let k = 0; k < count; k++) {
  const ms = (k / fps) * 1000;
  const { shown, typing, done } = visibleAt(ms);
  const blink = typing || Math.floor(ms / 500) % 2 === 0;
  const frame = {
    ...piece,
    lines: shown.length ? shown : [''],
    state: done ? (piece.doneState ?? 'ESCRITO') : (piece.state ?? 'TECLEANDO'),
    offsetY,
    cursor: blink,
  };
  let svg = compose(frame, { fontCss: faces });
  // El cursor: la plantilla lo pinta siempre; en las pausas se apaga la mitad del tiempo.
  if (!blink) svg = svg.replace(/(<rect[^>]*opacity=")\.85("\/>)/, '$10$2');
  writeFileSync(path.join(out, 'frames', `tx-${String(k).padStart(4, '0')}.svg`), svg);
}
writeFileSync(
  path.join(out, 'manifest.json'),
  JSON.stringify({ fps, speed, ms: Math.round(total), frames: count, lines: lineEnds.map((l) => ({ ...l, endFrame: Math.round((l.endMs / 1000) * fps) })) }, null, 2),
);
console.log(`transmisión → ${out}: ${count} fotogramas, ${(total / 1000).toFixed(1)} s`);

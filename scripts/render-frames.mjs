/**
 * EVA LAB · render-frames — de SVG/HTML a PNG con el Chrome de la máquina, sin dependencias.
 *
 *   node scripts/render-frames.mjs <entrada> <salida> [--width=1080] [--height=1080] [--scale=1] [--glob=loop-] [--bg=#03050d]
 *
 * Si el SVG declara `width`/`height` (las piezas del Studio), manda su tamaño salvo que se pase --width.
 * `--bg` rellena lo que el SVG no cubra (por defecto transparente): útil para un vídeo vertical.
 *
 * <entrada> puede ser un archivo (.svg o .html) o una carpeta: entonces rasteriza todos los .svg
 * (o los que empiecen por --glob) y escribe un PNG por cada uno en <salida>. Cada archivo se
 * carga en una pestaña con el tamaño pedido y se captura con `Page.captureScreenshot`.
 *
 * Para un vídeo o un GIF después:
 *   ffmpeg -framerate 30 -i <salida>/loop-%04d.png -c:v libx264 -pix_fmt yuv420p -crf 18 loop.mp4
 *   ffmpeg -framerate 30 -i <salida>/loop-%04d.png -vf "scale=540:-1" loop.gif
 *
 * Chrome: variable EVA_CHROME o las rutas habituales (Windows, macOS, Linux, Playwright).
 * Misma técnica que `perf-audit.mjs` (trampa 26 del HANDOFF): CDP sobre WebSocket nativo de Node.
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const [input, output] = args.filter((a) => !a.startsWith('--'));
if (!input || !output) {
  console.error('Uso: node scripts/render-frames.mjs <entrada> <salida> [--width=1080] [--height=1080] [--scale=1] [--glob=prefijo]');
  process.exit(1);
}
const opt = (name, fallback) => {
  const found = args.find((a) => a.startsWith(`--${name}=`));
  return found ? found.slice(name.length + 3) : fallback;
};
const width = Number(opt('width', 1080));
const height = Number(opt('height', 1080));
const scale = Number(opt('scale', 1));
const prefix = opt('glob', '');
const bg = opt('bg', 'transparent');

const CANDIDATES = [
  process.env.EVA_CHROME,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean);
function findPlaywrightChrome() {
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH || path.join(process.env.HOME || '', '.cache/ms-playwright');
  if (!existsSync(root)) return null;
  for (const dir of readdirSync(root)) {
    if (!dir.startsWith('chromium-')) continue;
    for (const rel of ['chrome-linux/chrome', 'chrome-mac/Chromium.app/Contents/MacOS/Chromium', 'chrome-win/chrome.exe']) {
      const p = path.join(root, dir, rel);
      if (existsSync(p)) return p;
    }
  }
  return null;
}
const chrome = CANDIDATES.find((c) => existsSync(c)) || findPlaywrightChrome();
if (!chrome) {
  console.error('No encuentro Chrome. Define EVA_CHROME=/ruta/a/chrome');
  process.exit(1);
}

const files = statSync(input).isDirectory()
  ? readdirSync(input)
      .filter((f) => (f.endsWith('.svg') || f.endsWith('.html')) && f.startsWith(prefix))
      .sort()
      .map((f) => path.join(input, f))
  : [input];
mkdirSync(output, { recursive: true });

const port = 9300 + Math.floor(Math.random() * 500);
const proc = spawn(
  chrome,
  [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--no-sandbox',
    '--disable-gpu',
    '--allow-file-access-from-files',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    `--window-size=${width},${height}`,
    'about:blank',
  ],
  { stdio: 'ignore' },
);

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function json(url, method = 'GET') {
  for (let k = 0; k < 40; k++) {
    try {
      const res = await fetch(url, { method });
      if (res.ok) return res.json();
    } catch {}
    await wait(250);
  }
  throw new Error(`Chrome no responde en ${url}`);
}

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.events = [];
    ws.addEventListener('message', (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      } else if (msg.method) this.events.push(msg);
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }
  async waitFor(method) {
    for (let k = 0; k < 400; k++) {
      const at = this.events.findIndex((e) => e.method === method);
      if (at >= 0) return this.events.splice(at, 1)[0];
      await wait(25);
    }
    throw new Error(`Sin ${method}`);
  }
}

try {
  const target = await json(`http://127.0.0.1:${port}/json/new?about:blank`, 'PUT');
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r, { once: true }));
  const cdp = new CDP(ws);
  await cdp.send('Page.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: scale, mobile: false });
  // Sin esto, Chrome pinta blanco detrás de lo que no cubre el documento: un PNG «transparente» salía opaco.
  if (bg === 'transparent') await cdp.send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });

  let done = 0;
  let current = { w: width, h: height };
  for (const file of files) {
    const isSvg = file.endsWith('.svg');
    const url = pathToFileURL(file).href;
    if (isSvg) {
      // Si el SVG declara su tamaño (las piezas del Studio lo hacen), manda él; si no, el pedido.
      const head = readFileSync(file, 'utf8').slice(0, 400);
      const own = !args.some((a) => a.startsWith('--width=')) && /<svg[^>]*\swidth="(\d+)"[^>]*\sheight="(\d+)"/.exec(head);
      const w = own ? Number(own[1]) : width;
      const h = own ? Number(own[2]) : height;
      if (w !== current.w || h !== current.h) {
        await cdp.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: scale, mobile: false });
        current = { w, h };
      }
      // Un documento mínimo, junto al SVG (un `data:` no puede cargar `file://`), que lo estira al lienzo entero.
      const html = `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;width:${w}px;height:${h}px;overflow:hidden;background:${bg}}img{display:block;width:100%;height:100%;object-fit:contain}</style><img src="${path.basename(file)}">`;
      const wrapper = `${file}.render.html`;
      writeFileSync(wrapper, html);
      await cdp.send('Page.navigate', { url: pathToFileURL(wrapper).href });
      await cdp.waitFor('Page.loadEventFired');
      await cdp.send('Runtime.evaluate', { expression: 'new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))', awaitPromise: true });
      const shot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      writeFileSync(path.join(output, path.basename(file).replace(/\.svg$/, '.png')), Buffer.from(shot.data, 'base64'));
      unlinkSync(wrapper);
      done++;
      continue;
    } else {
      await cdp.send('Page.navigate', { url });
    }
    await cdp.waitFor('Page.loadEventFired');
    // Un fotograma más para que las fuentes web y los filtros SVG asienten.
    await cdp.send('Runtime.evaluate', { expression: 'new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))', awaitPromise: true });
    if (!isSvg) await wait(Number(opt('settle', 400)));
    const shot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    const name = path.basename(file).replace(/\.(svg|html)$/, '.png');
    writeFileSync(path.join(output, name), Buffer.from(shot.data, 'base64'));
    done++;
  }
  ws.close();
  console.log(`render-frames → ${output}: ${done} PNG (${width}×${height} @${scale}x)`);
} finally {
  proc.kill('SIGKILL');
}

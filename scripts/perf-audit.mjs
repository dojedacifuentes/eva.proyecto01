/**
 * Auditoría de rendimiento de la landing, reproducible y sin dependencias:
 * Chrome sin interfaz manejado por el protocolo DevTools desde Node 24
 * (HANDOFF, trampa 26). Recorre cada lugar, lo deja animar unos segundos y
 * mide, dentro de la página, lo que importa para el retraso que siente el
 * visitante: fotogramas por segundo, tareas largas, bucles de animación
 * vivos, tiempo de script, recálculos de estilo y memoria.
 *
 *   node scripts/perf-audit.mjs http://localhost:3001 [--mobile] [--out informe.json]
 *
 * Las cifras absolutas dependen de la máquina (aquí, con SwiftShader, la GPU
 * es software): lo que vale es comparar antes y después en el mismo equipo.
 * Se recomienda medir sobre `next build && next start`, no sobre el dev server.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PLACES = ['inicio', 'consciencia', 'genoma', 'cerebro'];
/** Segundos de observación por lugar. */
const DWELL = 4;

const args = process.argv.slice(2);
const url = args.find((arg) => arg.startsWith('http')) ?? 'http://localhost:3001';
const mobile = args.includes('--mobile');
const outAt = args.indexOf('--out');
const out = outAt >= 0 ? args[outAt + 1] : null;
const port = 9400 + (mobile ? 1 : 0);

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'eva-perf-'));
const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--ignore-gpu-blocklist',
    '--autoplay-policy=no-user-gesture-required',
    '--no-first-run',
    '--no-default-browser-check',
    '--hide-scrollbars',
    '--enable-precise-memory-info',
    'about:blank',
  ],
  { stdio: 'ignore' },
);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let target;
for (let attempt = 0; attempt < 80 && !target; attempt += 1) {
  try {
    target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
  } catch {
    await sleep(250);
  }
}
if (!target) throw new Error('Chrome no arrancó');

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  ws.onopen = resolve;
  ws.onerror = reject;
});
let seq = 0;
const pending = new Map();
const listeners = new Map();
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  } else if (message.method && listeners.has(message.method)) {
    for (const listener of listeners.get(message.method)) listener(message.params);
  }
};
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++seq;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
const on = (method, listener) => {
  listeners.set(method, [...(listeners.get(method) ?? []), listener]);
};
const evaluate = async (expression) => {
  const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? 'error');
  return result.result.value;
};

await send('Page.enable');
await send('Runtime.enable');
await send('Performance.enable');
if (mobile) {
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  // Cuatro veces más lento: un móvil medio.
  await send('Emulation.setCPUThrottlingRate', { rate: 4 });
} else {
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
}

const errors = [];
on('Runtime.exceptionThrown', (params) => errors.push(params.exceptionDetails.exception?.description ?? params.exceptionDetails.text));

/* El sensor va dentro de la página: cuenta fotogramas, tareas largas y bucles vivos. */
await send('Page.addScriptToEvaluateOnNewDocument', {
  source: `(() => {
    const sensor = { frames: 0, longTasks: 0, longTaskMs: 0, rafCallbacks: new Set(), rafCalls: 0 };
    window.__evaSensor = sensor;
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (callback) => {
      sensor.rafCalls += 1;
      sensor.rafCallbacks.add(callback.name || callback.toString().slice(0, 40));
      return raf(callback);
    };
    const count = () => { sensor.frames += 1; raf(count); };
    raf(count);
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) { sensor.longTasks += 1; sensor.longTaskMs += entry.duration; }
      }).observe({ type: 'longtask', buffered: true });
    } catch {}
  })();`,
});

const loaded = new Promise((resolve) => on('Page.loadEventFired', resolve));
const startedAt = Date.now();
await send('Page.navigate', { url });
await loaded;
const loadMs = Date.now() - startedAt;
await sleep(1500);

const navigation = await evaluate(`(() => { const n = performance.getEntriesByType('navigation')[0]; const p = performance.getEntriesByType('paint'); return { domContentLoaded: Math.round(n?.domContentLoadedEventEnd ?? 0), load: Math.round(n?.loadEventEnd ?? 0), fcp: Math.round(p.find((e) => e.name === 'first-contentful-paint')?.startTime ?? 0), transfer: Math.round((n?.transferSize ?? 0) / 1024) }; })()`);
const resources = await evaluate(`(() => { const r = performance.getEntriesByType('resource'); const by = {}; for (const e of r) { const k = e.initiatorType === 'script' || e.name.endsWith('.js') ? 'js' : e.name.includes('.mp4') ? 'video' : e.name.match(/\\.(webp|png|jpg|svg)/) ? 'img' : e.name.match(/\\.(woff2?|ttf)/) ? 'font' : e.name.endsWith('.css') ? 'css' : 'otro'; by[k] = by[k] ?? { n: 0, kb: 0 }; by[k].n += 1; by[k].kb += Math.round((e.transferSize || e.encodedBodySize || 0) / 1024); } return by; })()`);

const metricsOf = async () => {
  const { metrics } = await send('Performance.getMetrics');
  const get = (name) => metrics.find((metric) => metric.name === name)?.value ?? 0;
  return {
    script: get('ScriptDuration'),
    layout: get('LayoutDuration'),
    style: get('RecalcStyleDuration'),
    task: get('TaskDuration'),
    layouts: get('LayoutCount'),
    styles: get('RecalcStyleCount'),
    heap: get('JSHeapUsedSize'),
    nodes: get('Nodes'),
  };
};

const places = {};
for (const place of PLACES) {
  await evaluate(`(() => { const el = document.getElementById(${JSON.stringify(place)}); if (el) el.scrollIntoView({ block: 'start' }); return !!el; })()`);
  await sleep(2500); // que monte y se asiente
  // Un puntero que se mueve por el lugar: como un visitante que lee.
  await evaluate(`window.__evaSensor.frames = 0; window.__evaSensor.longTasks = 0; window.__evaSensor.longTaskMs = 0; window.__evaSensor.rafCallbacks.clear(); window.__evaSensor.rafCalls = 0; true`);
  const before = await metricsOf();
  const t0 = Date.now();
  for (let step = 0; step < DWELL * 10; step += 1) {
    const x = 400 + Math.round(300 * Math.sin(step / 5));
    const y = 450 + Math.round(200 * Math.cos(step / 7));
    if (!mobile) await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
    await sleep(100);
  }
  const elapsed = (Date.now() - t0) / 1000;
  const after = await metricsOf();
  const sensor = await evaluate(`(() => { const s = window.__evaSensor; return { frames: s.frames, longTasks: s.longTasks, longTaskMs: Math.round(s.longTaskMs), rafCalls: s.rafCalls, loops: [...s.rafCallbacks].length }; })()`);
  const canvases = await evaluate(`(() => [...document.querySelectorAll('canvas')].map((c) => { const r = c.getBoundingClientRect(); return { w: c.width, h: c.height, visible: r.bottom > 0 && r.top < innerHeight && r.width > 0 }; }))()`);
  const videos = await evaluate(`[...document.querySelectorAll('video')].map((v) => ({ playing: !v.paused, ready: v.readyState }))`);
  places[place] = {
    fps: Math.round(sensor.frames / elapsed),
    longTasks: sensor.longTasks,
    longTaskMs: sensor.longTaskMs,
    rafPerFrame: sensor.frames ? Math.round((sensor.rafCalls / sensor.frames) * 10) / 10 : 0,
    loops: sensor.loops,
    scriptMs: Math.round((after.script - before.script) * 1000),
    styleMs: Math.round((after.style - before.style) * 1000),
    layoutMs: Math.round((after.layout - before.layout) * 1000),
    styleRecalcs: after.styles - before.styles,
    layouts: after.layouts - before.layouts,
    heapMb: Math.round(after.heap / 1048576),
    canvasesLive: canvases.filter((c) => c.visible).length,
    canvasesTotal: canvases.length,
    videosPlaying: videos.filter((v) => v.playing).length,
  };
  console.log(place.padEnd(16), JSON.stringify(places[place]));
}

const report = { url, mobile, loadMs, navigation, resources, places, errors, at: new Date().toISOString() };
if (out) fs.writeFileSync(out, JSON.stringify(report, null, 2));
console.log('carga', JSON.stringify({ loadMs, ...navigation }), 'recursos', JSON.stringify(resources));
if (errors.length) console.log('errores', errors.length, errors.slice(0, 3));

ws.close();
chrome.kill();
await sleep(300);
try {
  fs.rmSync(profile, { recursive: true, force: true });
} catch {}

/**
 * EVA LAB · eva-signal — el campo de la Consciencia como fotogramas SVG, sin navegador.
 *
 *   node --import ./scripts/test-hooks.mjs scripts/eva-signal.mjs <salida> [opciones]
 *
 * Corre el motor puro (`src/components/eva/consciencia/particle-life.ts`) en Node, determinista
 * por semilla, y escribe en <salida>:
 *   frames/signal-NNNN.svg    un SVG por fotograma, a --fps, con la estela emulada
 *   poster.svg                el último fotograma (portada del Reel)
 *   sheet.html                hoja de contacto con 12 fotogramas y el póster
 *   manifest.json             semilla, opciones, acciones aplicadas, muestras por segundo y tamaños
 *
 * Opciones (todas con valor por defecto):
 *   --seed=0xe7a01 (INITIAL_SEED del motor) · --count=260 · --seconds=8 · --fps=30
 *   --width=1080 · --height=1350 · --bg=#050c14 (el `--eva-bg` de la landing; el lienzo real de la
 *   Consciencia pinta #030810: pásalo si quieres el negro exacto del canvas)
 *   --figure=eye|spiral|labyrinth|double|name|none   figura que se reúne (`none`: campo libre, sin reunir)
 *   --gather-at=2 · --release-at=6   segundos en que se reúne y se suelta (fuera de rango: no pasa)
 *   --noise · --gravity=none|down|center · --viscosity=fluid|medium|dense   régimen desde t=0
 *   --trail=6        posiciones anteriores por partícula (una por fotograma simulado de 1/60 s)
 *   --dot=1          escala de radios respecto al lienzo de la landing (1,1–1,4 px por punto)
 *   --fit=stretch|square   `stretch` es lo que hace la landing (x·ancho, y·alto, la figura se deforma
 *                    con el encuadre); `square` centra el mundo en un cuadrado y no la deforma
 *   --warmup=0       segundos simulados antes del primer fotograma (para no abrir con ruido uniforme)
 *   --show-targets   dibuja tenues los objetivos de la figura
 *   --script=<json>  lista de acciones con tiempo, se suma a las opciones anteriores:
 *     [{"t":2,"action":"gather"},{"t":5,"action":"figure","value":"spiral"},{"t":6,"action":"release"},
 *      {"t":7,"action":"perturb","x":0.5,"y":0.5,"strength":1},{"t":3,"action":"noise","value":true},
 *      {"t":3,"action":"gravity","value":"center"},{"t":3,"action":"viscosity","value":"dense"},
 *      {"t":4,"action":"chaos"},{"t":4,"action":"random"},{"t":9,"action":"reset"}]
 *     Cada acción se aplica una vez, al empezar el primer fotograma cuyo tiempo alcanza `t`.
 *
 * Después, para verlo:
 *   EVA_CHROME=... node scripts/render-frames.mjs <salida>/frames <salida>/png --width=1080 --height=1350 --glob=signal-
 *   ffmpeg -framerate 30 -i <salida>/png/signal-%04d.png -c:v libx264 -pix_fmt yuv420p -crf 20 signal.mp4
 *   (yuv420p exige ancho y alto pares: con 540×675 añade -vf "pad=ceil(iw/2)*2:ceil(ih/2)*2:0:0:#050c14")
 *   ffmpeg -framerate 30 -i <salida>/png/signal-%04d.png -vf "select='not(mod(n,20))',scale=270:-1,tile=6x1" -fps_mode passthrough -frames:v 1 tira.png
 *
 * Cómo se emula el lienzo (`particle-renderer.ts`), sin canvas:
 * - Los colores por grupo, el radio (1,1 px; 1,4 el blanco; +0,35·composición), la opacidad
 *   (0,78 + 0,18·composición), el halo del grupo blanco, el lavado radial y los anillos de las
 *   perturbaciones se copian tal cual del renderer.
 * - La huella: el lienzo cubre cada fotograma con un velo rgba(3,8,16, v) —`veilFor`—, así que un
 *   punto pintado hace k fotogramas conserva (1−v)^k de su opacidad. Aquí se guardan las últimas
 *   --trail posiciones de cada partícula y se pintan con esa opacidad, más un afilado lineal para
 *   que la estela no termine en un corte. Es una aproximación barata: un SVG de 260 partículas y
 *   seis posiciones pesa unos 70–80 KB.
 * - Para capturar una posición por fotograma simulado, el mundo se avanza de 1/60 en 1/60 s
 *   (`stepParticleWorld(world, 1/60)`), tantas veces como quepan en 1/fps. Es exactamente la misma
 *   secuencia que `stepParticleWorld(world, 1/fps)`: el motor tiene paso fijo con acumulador y el
 *   resultado no depende de la cadencia (lo prueba `particle-life.test.ts`).
 *
 * Rarezas del motor que conviene saber (v8.2):
 * - `stepParticleWorld` recorta cada llamada a 0,12 s (MAX_STEP): un salto mayor va a cámara lenta.
 * - Reunir no teletransporta: `composition` sube 0,012 por fotograma (≈1,4 s hasta 1) y al soltar
 *   baja al 72 % de ese ritmo (≈1,9 s). La atracción es 32·composición hacia el objetivo de cada
 *   partícula (`particle.target` = su índice), sumada a las reglas de Particle Life.
 * - `setFigure` regenera los objetivos y conserva los índices: un mundo reunido migra solo.
 * - `narrativeState` es pegajoso: una vez reunido, `self` para siempre (también tras soltar).
 * - `perturbParticleWorld` recorta el punto a [0,03, 0,97]×[0,04, 0,96] y guarda como mucho 8 huellas.
 * - `reset` vuelve a t=0 del motor; el guion sigue contando desde el fotograma de salida.
 * - Con las reglas de fábrica y 260 partículas, el ojo reunido enseña párpados y pupila, pero el
 *   anillo del iris no se sostiene: las reglas y el apiñamiento pueden más que el muelle al objetivo
 *   y sus partículas acaban en la pupila o en un grumo sobre el párpado inferior (`--show-targets`
 *   lo deja ver). Es el motor de la landing tal cual, no un fallo de este script.
 * - Los radios son píxeles CSS del lienzo (1,1–1,4): a 1080×1350 los puntos salen finos; para un
 *   Reel conviene `--dot=1.6` o `--dot=2`.
 *
 * Sale SVG puro, sin dependencias. No toca ningún archivo del repo.
 */
import { performance } from 'node:perf_hooks';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  DEFAULT_COUNT,
  FIGURES,
  GRAVITIES,
  INITIAL_SEED,
  VISCOSITIES,
  createParticleWorld,
  gatherParticleWorld,
  meanTargetDistance,
  narrativeState,
  perturbParticleWorld,
  randomizeRules,
  randomizeWorld,
  regimeOf,
  releaseParticleWorld,
  resetParticleWorld,
  setFigure,
  setGravity,
  setNoise,
  setViscosity,
  stepParticleWorld,
} from '../src/components/eva/consciencia/particle-life.ts';

/* ───────────── Opciones ───────────── */

const args = process.argv.slice(2);
const out = args.find((a) => !a.startsWith('--'));
if (!out) {
  console.error(
    'Uso: node --import ./scripts/test-hooks.mjs scripts/eva-signal.mjs <salida> [--seed=0xe7a01] [--count=260] [--seconds=8] [--fps=30] [--width=1080] [--height=1350] [--figure=eye] [--gather-at=2] [--release-at=6] [--noise] [--gravity=none] [--viscosity=medium] [--trail=6] [--bg=#050c14] [--show-targets] [--script=acciones.json]',
  );
  process.exit(1);
}
const opt = (name, fallback) => {
  const found = args.find((a) => a.startsWith(`--${name}=`));
  return found ? found.slice(name.length + 3) : fallback;
};
const flag = (name) => args.includes(`--${name}`);
const fail = (message) => {
  console.error(`eva-signal: ${message}`);
  process.exit(1);
};

const seed = Number(opt('seed', INITIAL_SEED)) >>> 0;
const count = Math.max(1, Math.floor(Number(opt('count', DEFAULT_COUNT))));
const seconds = Number(opt('seconds', 8));
const fps = Number(opt('fps', 30));
const width = Number(opt('width', 1080));
const height = Number(opt('height', 1350));
const bg = opt('bg', '#050c14');
const figure = opt('figure', 'eye');
const gatherAt = Number(opt('gather-at', 2));
const releaseAt = Number(opt('release-at', 6));
const gravity = opt('gravity', 'none');
const viscosity = opt('viscosity', 'medium');
const trailLength = Math.max(0, Math.floor(Number(opt('trail', 6))));
const dotScale = Number(opt('dot', 1));
const fit = opt('fit', 'stretch');
const warmup = Number(opt('warmup', 0));
const showTargets = flag('show-targets');

if (!Number.isFinite(seed)) fail('la semilla no es un número (acepta decimal o 0x…)');
if (!(seconds > 0) || !(fps > 0) || fps > 60) fail('--seconds debe ser > 0 y --fps estar en (0, 60]');
if (!(width > 0) || !(height > 0)) fail('--width y --height deben ser > 0');
if (figure !== 'none' && !FIGURES.includes(figure)) fail(`figura desconocida: ${figure} (${FIGURES.join('|')}|none)`);
if (!GRAVITIES.includes(gravity)) fail(`gravedad desconocida: ${gravity} (${GRAVITIES.join('|')})`);
if (!VISCOSITIES.includes(viscosity)) fail(`viscosidad desconocida: ${viscosity} (${VISCOSITIES.join('|')})`);
if (fit !== 'stretch' && fit !== 'square') fail('--fit debe ser stretch o square');

/* ───────────── Guion: acciones con tiempo ───────────── */

/** Las opciones sueltas se vuelven acciones; el JSON de --script se suma. Se aplican por orden de `t`. */
const actions = [];
if (figure !== 'none') actions.push({ t: 0, action: 'figure', value: figure });
if (flag('noise')) actions.push({ t: 0, action: 'noise', value: true });
if (gravity !== 'none') actions.push({ t: 0, action: 'gravity', value: gravity });
if (viscosity !== 'medium') actions.push({ t: 0, action: 'viscosity', value: viscosity });
if (figure !== 'none' && Number.isFinite(gatherAt)) actions.push({ t: gatherAt, action: 'gather' });
if (figure !== 'none' && Number.isFinite(releaseAt)) actions.push({ t: releaseAt, action: 'release' });

const scriptFile = opt('script', '');
if (scriptFile) {
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(scriptFile, 'utf8'));
  } catch (error) {
    fail(`no puedo leer el guion ${scriptFile}: ${error.message}`);
  }
  if (!Array.isArray(parsed)) fail('el guion debe ser una lista de acciones');
  for (const [index, step] of parsed.entries()) {
    if (!step || typeof step.action !== 'string' || !Number.isFinite(Number(step.t))) {
      fail(`acción ${index} del guion sin "t" numérico o sin "action"`);
    }
    actions.push({ ...step, t: Number(step.t) });
  }
}
actions.sort((a, b) => a.t - b.t);

/** Aplica una acción al mundo; devuelve `false` si no la conoce. */
function apply(world, step) {
  switch (step.action) {
    case 'gather':
      gatherParticleWorld(world);
      return true;
    case 'release':
      releaseParticleWorld(world);
      return true;
    case 'figure':
      if (!FIGURES.includes(step.value)) fail(`figura desconocida en el guion: ${step.value}`);
      setFigure(world, step.value);
      return true;
    case 'perturb':
      perturbParticleWorld(world, Number(step.x ?? 0.5), Number(step.y ?? 0.5), Number(step.strength ?? 1));
      return true;
    case 'noise':
      setNoise(world, step.value === undefined ? true : Boolean(step.value));
      return true;
    case 'gravity':
      if (!GRAVITIES.includes(step.value)) fail(`gravedad desconocida en el guion: ${step.value}`);
      setGravity(world, step.value);
      return true;
    case 'viscosity':
      if (!VISCOSITIES.includes(step.value)) fail(`viscosidad desconocida en el guion: ${step.value}`);
      setViscosity(world, step.value);
      return true;
    case 'chaos':
      randomizeRules(world);
      return true;
    case 'random':
      randomizeWorld(world);
      return true;
    case 'reset':
      resetParticleWorld(world);
      return true;
    default:
      return false;
  }
}

/* ───────────── El aspecto del lienzo, copiado de particle-renderer.ts ───────────── */

/** Un color por grupo: cian, blanco frío, violeta, magenta y verde. Copiado de `COLORS` del renderer. */
const COLORS = ['#3fd8ee', '#eef3f6', '#9a8dff', '#f07ab9', '#78f0b4'];
/** El velo del lienzo es rgba(3,8,16, v): los puntos se apagan hacia este color. */
const VEIL_RGB = 'rgb(3,8,16)';
const HALO = 'rgb(224,249,255)';
const TRACE_RING = 'rgb(154,141,255)';

/** Cuánto se borra por fotograma; menos es más huella. Copia de `veilFor` del renderer. */
function veilFor(state, regime) {
  if (regime === 'drift') return 0.07;
  if (regime === 'chaos') return 0.2;
  if (state === 'trace' || state === 'self') return 0.11;
  return 0.16;
}

/* ───────────── Mundo → píxeles ───────────── */

/** La landing estira el mundo al lienzo (x·ancho, y·alto); `square` centra un cuadrado sin deformar. */
const view = (() => {
  if (fit === 'square') {
    const side = Math.min(width, height);
    return { sx: side, sy: side, ox: (width - side) / 2, oy: (height - side) / 2 };
  }
  return { sx: width, sy: height, ox: 0, oy: 0 };
})();
const px = (v) => Math.round(v * 10) / 10;
const toX = (x) => px(view.ox + x * view.sx);
const toY = (y) => px(view.oy + y * view.sy);
const alpha = (a) => Math.round(Math.max(0, Math.min(1, a)) * 1000) / 1000;
const sec = (v) => Math.round(v * 1000) / 1000;

/**
 * Un fotograma en SVG. `history` es la lista de instantáneas anteriores, de la más antigua a la más
 * reciente; cada una es un Float64Array [x0,y0,x1,y1,…]. Se pintan primero (debajo) con la opacidad
 * que el velo les habría dejado, y encima las partículas actuales con su halo.
 */
function frameSvg(world, history) {
  const state = narrativeState(world);
  const regime = regimeOf(world);
  const veil = veilFor(state, regime);
  const composition = world.composition;
  const baseAlpha = 0.78 + composition * 0.18;
  const grow = composition * 0.35;
  const radiusOf = (group) => px(((group === 1 ? 1.4 : 1.1) + grow) * dotScale);
  const groups = Math.max(world.groupCount, 1);

  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`,
    // El lavado radial del renderer: centro que respira al reunirse.
    `<defs><radialGradient id="w" gradientUnits="userSpaceOnUse" cx="${px(width / 2)}" cy="${px(height / 2)}" r="${px(width * 0.56)}">`,
    `<stop offset="0" stop-color="rgb(93,120,190)" stop-opacity="${alpha(0.02 + composition * 0.05)}"/>`,
    '<stop offset="0.6" stop-color="rgb(25,66,92)" stop-opacity="0.012"/>',
    `<stop offset="1" stop-color="${VEIL_RGB}" stop-opacity="0"/></radialGradient></defs>`,
    `<rect width="${width}" height="${height}" fill="${bg}"/>`,
    `<rect width="${width}" height="${height}" fill="url(#w)"/>`,
  ];

  // Anillos de las perturbaciones: se abren y se apagan con `life`.
  if (world.traces.length) {
    parts.push(`<g fill="none" stroke="${TRACE_RING}" stroke-width="${px(dotScale)}">`);
    for (const trace of world.traces) {
      const r = px(((1 - trace.life) * 46 + 8) * dotScale);
      parts.push(`<circle cx="${toX(trace.x)}" cy="${toY(trace.y)}" r="${r}" stroke-opacity="${alpha(trace.life * 0.26)}"/>`);
    }
    parts.push('</g>');
  }

  if (showTargets) {
    parts.push(`<g fill="${TRACE_RING}" fill-opacity="0.16">`);
    for (const target of world.targets) parts.push(`<circle cx="${toX(target.x)}" cy="${toY(target.y)}" r="${px(0.9 * dotScale)}"/>`);
    parts.push('</g>');
  }

  // La estela: la instantánea k pasos atrás conserva (1−velo)^k, afilado para no cortar en seco.
  const depth = history.length;
  for (let back = depth; back >= 1; back -= 1) {
    const snapshot = history[depth - back];
    const fade = alpha(baseAlpha * (1 - veil) ** back * (1 - back / (depth + 1)));
    if (fade <= 0.004) continue;
    for (let group = 0; group < groups; group += 1) {
      const circles = [];
      const r = radiusOf(group);
      for (let index = 0; index < world.particles.length; index += 1) {
        if (world.particles[index].group !== group) continue;
        circles.push(`<circle cx="${px(view.ox + snapshot[index * 2] * view.sx)}" cy="${px(view.oy + snapshot[index * 2 + 1] * view.sy)}" r="${r}"/>`);
      }
      if (circles.length) parts.push(`<g fill="${COLORS[group % COLORS.length]}" fill-opacity="${fade}">${circles.join('')}</g>`);
    }
  }

  // Las partículas de ahora, por grupo; el blanco lleva halo.
  const halos = [];
  for (let group = 0; group < groups; group += 1) {
    const circles = [];
    const r = radiusOf(group);
    for (const particle of world.particles) {
      if (particle.group !== group) continue;
      const cx = toX(particle.x);
      const cy = toY(particle.y);
      circles.push(`<circle cx="${cx}" cy="${cy}" r="${r}"/>`);
      if (group === 1) halos.push(`<circle cx="${cx}" cy="${cy}" r="${px(r * 3.6)}"/>`);
    }
    if (circles.length) parts.push(`<g fill="${COLORS[group % COLORS.length]}" fill-opacity="${alpha(baseAlpha)}">${circles.join('')}</g>`);
  }
  if (halos.length) parts.push(`<g fill="${HALO}" fill-opacity="0.05">${halos.join('')}</g>`);

  parts.push('</svg>');
  return parts.join('');
}

/* ───────────── Simulación y escritura ───────────── */

const SIM_HZ = 60;
const totalFrames = Math.max(1, Math.round(seconds * fps));
const world = createParticleWorld(seed, count);
const history = [];
const snapshot = () => {
  const flat = new Float64Array(count * 2);
  world.particles.forEach((particle, index) => {
    flat[index * 2] = particle.x;
    flat[index * 2 + 1] = particle.y;
  });
  history.push(flat);
  if (history.length > trailLength) history.splice(0, history.length - trailLength);
};

mkdirSync(path.join(out, 'frames'), { recursive: true });
const manifest = {
  generated: new Date().toISOString(),
  seed: `0x${seed.toString(16)}`,
  seedNumber: seed,
  count,
  fps,
  seconds,
  frames: totalFrames,
  width,
  height,
  bg,
  fit,
  trail: trailLength,
  dot: dotScale,
  warmup,
  figure,
  showTargets,
  actions: [],
  samples: [],
  sizes: { minBytes: Infinity, maxBytes: 0, meanBytes: 0 },
  timing: { simulationMs: 0, svgMs: 0 },
};

let simulationMs = 0;
let svgMs = 0;
let totalBytes = 0;
let pending = 0; // índice de la próxima acción sin aplicar
let lastSvg = '';

// Calentamiento: se simula sin escribir, pero la estela sí se va llenando.
if (warmup > 0) {
  const started = performance.now();
  for (let step = 0; step < Math.round(warmup * SIM_HZ); step += 1) {
    stepParticleWorld(world, 1 / SIM_HZ);
    snapshot();
  }
  simulationMs += performance.now() - started;
}

for (let frameIndex = 0; frameIndex < totalFrames; frameIndex += 1) {
  const t = frameIndex / fps;

  // Acciones cuyo tiempo ya llegó, en orden; se anota en qué fotograma cayeron.
  while (pending < actions.length && actions[pending].t <= t + 1e-9) {
    const step = actions[pending];
    if (!apply(world, step)) fail(`acción desconocida en el guion: ${step.action}`);
    manifest.actions.push({ ...step, frame: frameIndex, appliedAt: sec(t) });
    pending += 1;
  }

  // Los fotogramas de 1/60 s que caben hasta el siguiente fotograma de salida; en cada uno, una
  // instantánea para la estela. Con fps que no divide a 60 (24, 25) se alternan 2 y 3, como haría
  // el acumulador del motor.
  const started = performance.now();
  const steps = Math.round(((frameIndex + 1) * SIM_HZ) / fps) - Math.round((frameIndex * SIM_HZ) / fps);
  for (let step = 0; step < steps; step += 1) {
    if (step > 0) snapshot(); // la posición anterior a este paso; la actual se pinta aparte
    stepParticleWorld(world, 1 / SIM_HZ);
  }
  simulationMs += performance.now() - started;

  if (frameIndex % fps === 0 || frameIndex === totalFrames - 1) {
    manifest.samples.push({
      t: sec(t),
      frame: frameIndex,
      simTime: Math.round(world.time * 1000) / 1000,
      state: narrativeState(world),
      regime: regimeOf(world),
      composition: Math.round(world.composition * 1000) / 1000,
      meanTargetDistance: Math.round(meanTargetDistance(world) * 10000) / 10000,
      energy: Number(world.energy.toExponential(3)),
      interactions: world.interactions,
      groups: world.groupCount,
    });
  }

  const drawStarted = performance.now();
  const svg = frameSvg(world, history);
  writeFileSync(path.join(out, 'frames', `signal-${String(frameIndex).padStart(4, '0')}.svg`), svg);
  svgMs += performance.now() - drawStarted;
  snapshot(); // la posición pintada pasa a la estela del fotograma siguiente

  const bytes = Buffer.byteLength(svg);
  totalBytes += bytes;
  manifest.sizes.minBytes = Math.min(manifest.sizes.minBytes, bytes);
  manifest.sizes.maxBytes = Math.max(manifest.sizes.maxBytes, bytes);
  lastSvg = svg;
}

// Acciones que quedaron fuera del tiempo simulado: se anotan para que el manifiesto no mienta.
for (; pending < actions.length; pending += 1) manifest.actions.push({ ...actions[pending], frame: null, skipped: true });

writeFileSync(path.join(out, 'poster.svg'), lastSvg);
manifest.sizes.meanBytes = Math.round(totalBytes / totalFrames);
manifest.timing.simulationMs = Math.round(simulationMs);
manifest.timing.svgMs = Math.round(svgMs);
manifest.final = { state: narrativeState(world), regime: regimeOf(world), simTime: Math.round(world.time * 1000) / 1000 };

/* ───────────── Hoja de contacto ───────────── */

const picks = Array.from({ length: Math.min(12, totalFrames) }, (_, i) =>
  Math.floor((i * (totalFrames - 1)) / Math.max(1, Math.min(12, totalFrames) - 1)),
);
const cells = picks
  .map((k) => {
    const name = `signal-${String(k).padStart(4, '0')}`;
    return `<figure><img src="frames/${name}.svg" alt="${name}"><figcaption>${name} · t=${sec(k / fps)} s</figcaption></figure>`;
  })
  .join('');
const timeline = manifest.actions
  .filter((a) => !a.skipped)
  .map((a) => `<li>${a.appliedAt} s · <b>${a.action}</b>${a.value !== undefined ? ` ${a.value}` : ''}${a.action === 'perturb' ? ` (${a.x}, ${a.y})` : ''}</li>`)
  .join('');
writeFileSync(
  path.join(out, 'sheet.html'),
  `<!doctype html><meta charset="utf-8"><title>EVA · eva-signal</title>
<style>body{margin:0;background:${bg};color:#c3ccd2;font:14px/1.4 ui-monospace,monospace;padding:24px}
h1,h2{font-weight:600;font-size:14px;letter-spacing:.12em;text-transform:uppercase;color:#8e9ba3}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px}figure{margin:0;background:#070a0e;padding:8px;border:1px solid rgba(226,233,238,.1)}
figure img{width:100%;aspect-ratio:${width}/${height};display:block}figcaption{margin-top:6px;font-size:11px;color:#8e9ba3}
.poster{max-width:360px}.poster img{width:100%;display:block;border:1px solid rgba(226,233,238,.1)}ul{columns:2;font-size:12px;color:#8e9ba3}</style>
<h1>EVA · eva-signal · semilla ${manifest.seed} · ${count} partículas · ${fps} fps · ${seconds} s · ${width}×${height}</h1>
<ul>${timeline || '<li>sin acciones</li>'}</ul>
<div class="grid">${cells}</div>
<h2>Póster (último fotograma)</h2><div class="poster"><img src="poster.svg" alt="poster"></div>`,
);
writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 2));

console.log(
  `eva-signal → ${out}: ${totalFrames} fotogramas (${width}×${height}, ${fps} fps, ${seconds} s), ` +
    `${manifest.actions.filter((a) => !a.skipped).length} acciones, SVG ${(manifest.sizes.minBytes / 1024).toFixed(0)}–${(manifest.sizes.maxBytes / 1024).toFixed(0)} KB ` +
    `(media ${(manifest.sizes.meanBytes / 1024).toFixed(0)} KB) · simulación ${manifest.timing.simulationMs} ms · SVG ${manifest.timing.svgMs} ms`,
);

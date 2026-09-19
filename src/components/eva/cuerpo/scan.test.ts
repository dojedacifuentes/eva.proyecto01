import assert from 'node:assert/strict';
import { test } from 'node:test';
import { seeded } from '@/lib/random';
import { FROZEN, OUT, createScan, detectEdges, traceEdges, type ScanOptions } from './scan';

const W = 64;
const H = 96;

/** Un cuadrado blanco sobre negro: sus únicos bordes son su contorno. */
function square(): Uint8ClampedArray {
  const rgba = new Uint8ClampedArray(W * H * 4);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const inside = x >= 20 && x < 44 && y >= 30 && y < 60;
      const at = (y * W + x) * 4;
      rgba[at] = rgba[at + 1] = rgba[at + 2] = inside ? 255 : 0;
      rgba[at + 3] = 255;
    }
  }
  return rgba;
}

function options(over: Partial<ScanOptions> = {}): ScanOptions {
  return {
    width: W,
    height: H,
    edges: detectEdges(square(), W, H, 50),
    sweep: 'down',
    particles: 32,
    waves: 4,
    gap: 0.2,
    speed: 60,
    freeze: 0.5,
    turbulence: 1,
    leap: 0,
    cooldown: 1,
    random: seeded(7),
    ...over,
  };
}

/** Corre la pasada hasta que termina, con un tope para que una prueba rota no cuelgue. */
function run(scan: ReturnType<typeof createScan>, dt = 1 / 60) {
  let frames = 0;
  while (!scan.done && frames < 6000) {
    scan.step(dt);
    frames += 1;
  }
  return frames;
}

test('los bordes de un cuadrado son su contorno y nada más', () => {
  const edges = detectEdges(square(), W, H, 50);
  assert.equal(edges[45 * W + 32], 0, 'el interior no es borde');
  assert.equal(edges[10 * W + 10], 0, 'el fondo no es borde');
  assert.equal(edges[29 * W + 32], 1, 'el lado de arriba es borde');
  assert.equal(edges[45 * W + 19], 1, 'el lado izquierdo es borde');
  assert.equal(edges[0], 0, 'la primera fila no se evalúa');
});

test('un umbral imposible no encuentra bordes', () => {
  const edges = detectEdges(square(), W, H, 256);
  assert.equal(edges.reduce((sum, value) => sum + value, 0), 0);
});

test('la pasada termina, y sólo se congela sobre un borde o justo antes', () => {
  const config = options();
  const scan = createScan(config);
  const frames = run(scan);
  assert.ok(scan.done, `no terminó en ${frames} fotogramas`);
  assert.equal(scan.spawned, scan.count);
  assert.equal(scan.progress, 1);
  assert.equal(scan.front, 1);
  assert.ok(scan.frozen > 0, 'ninguna partícula encontró el cuadrado');

  let frozen = 0;
  for (let at = 0; at < scan.count; at++) {
    if (!(scan.flags[at] & FROZEN)) {
      assert.ok(scan.flags[at] & OUT, 'lo que no se congela acaba fuera');
      continue;
    }
    frozen += 1;
    const x = Math.floor(scan.x[at]);
    const y = Math.floor(scan.y[at]);
    // Mira hasta cinco píxeles por delante: el borde está ahí o un poco más abajo.
    let near = false;
    for (let ahead = 0; ahead <= 5; ahead++) near ||= config.edges[(y + ahead) * W + x] === 1;
    assert.ok(near, `congelada lejos de un borde en ${x},${y}`);
  }
  assert.equal(frozen, scan.frozen);
});

test('con la misma semilla, la misma pasada', () => {
  const first = createScan(options({ random: seeded(42) }));
  const second = createScan(options({ random: seeded(42) }));
  run(first);
  run(second);
  assert.equal(first.frozen, second.frozen);
  assert.deepEqual(Array.from(first.flags), Array.from(second.flags));
});

test('el resultado no depende de los fotogramas por segundo', () => {
  const smooth = createScan(options({ freeze: 1, random: seeded(3) }));
  const choppy = createScan(options({ freeze: 1, random: seeded(3) }));
  run(smooth, 1 / 120);
  run(choppy, 1 / 30);
  // Con congelación segura, cada columna que cruza el cuadrado se queda en él.
  assert.ok(Math.abs(smooth.frozen - choppy.frozen) <= smooth.count * 0.05);
});

test('sin bordes, todas las partículas cruzan y salen', () => {
  const scan = createScan(options({ edges: new Uint8Array(W * H) }));
  run(scan);
  assert.equal(scan.frozen, 0);
  for (let at = 0; at < scan.count; at++) assert.ok(scan.flags[at] & OUT);
});

test('las cuatro direcciones recorren el lienzo entero', () => {
  for (const sweep of ['down', 'up', 'right', 'left'] as const) {
    const scan = createScan(options({ sweep, edges: new Uint8Array(W * H) }));
    const frames = run(scan);
    assert.ok(scan.done, `${sweep}: no terminó en ${frames} fotogramas`);
  }
});

test('el trazado directo devuelve puntos de borde, y menos si se salta', () => {
  const edges = detectEdges(square(), W, H, 50);
  const all = traceEdges(edges, W, H, 1);
  const some = traceEdges(edges, W, H, 3);
  assert.ok(all.length > 0 && all.length % 2 === 0);
  assert.ok(some.length < all.length);
  for (let at = 0; at < all.length; at += 2) assert.equal(edges[all[at + 1] * W + all[at]], 1);
});

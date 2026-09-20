import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { FigureId } from '@/lib/types';
import { FIGURE_BOUNDS, createFigureTargets } from './figures';

const FIGURES: readonly FigureId[] = ['eye', 'spiral', 'labyrinth', 'double', 'name'];
const COUNTS = [24, 160, 260];

test('cada figura devuelve exactamente `count` puntos, todos dentro de la caja', () => {
  for (const figure of FIGURES) {
    for (const count of COUNTS) {
      const points = createFigureTargets(figure, count, 0xe7a01);
      assert.equal(points.length, count, `${figure} con ${count}`);
      for (const { x, y } of points) {
        assert.ok(x >= FIGURE_BOUNDS.minX && x <= FIGURE_BOUNDS.maxX, `${figure}: x=${x}`);
        assert.ok(y >= FIGURE_BOUNDS.minY && y <= FIGURE_BOUNDS.maxY, `${figure}: y=${y}`);
        assert.ok(Number.isFinite(x) && Number.isFinite(y));
      }
    }
    assert.equal(createFigureTargets(figure, 0, 1).length, 0, `${figure} con cero`);
  }
});

test('la misma semilla da la misma figura; otra semilla, otro jitter', () => {
  for (const figure of FIGURES) {
    assert.deepEqual(createFigureTargets(figure, 160, 77), createFigureTargets(figure, 160, 77));
    assert.notDeepEqual(createFigureTargets(figure, 160, 77), createFigureTargets(figure, 160, 78));
  }
});

test('las cinco figuras son distintas entre sí', () => {
  const shapes = FIGURES.map((figure) => createFigureTargets(figure, 120, 5));
  for (let a = 0; a < shapes.length; a += 1) {
    for (let b = a + 1; b < shapes.length; b += 1) {
      const gap = shapes[a].reduce((sum, p, i) => sum + Math.hypot(p.x - shapes[b][i].x, p.y - shapes[b][i].y), 0);
      assert.ok(gap / 120 > 0.05, `${FIGURES[a]} y ${FIGURES[b]} casi coinciden`);
    }
  }
});

test('el ojo tiene párpados arriba y abajo, iris y pupila alrededor del centro', () => {
  const points = createFigureTargets('eye', 260, 3);
  const above = points.filter((p) => p.y < 0.45).length;
  const below = points.filter((p) => p.y > 0.55).length;
  const pupil = points.filter((p) => Math.hypot(p.x - 0.5, p.y - 0.5) < 0.06).length;
  assert.ok(above > 40 && below > 40, 'faltan párpados');
  assert.ok(Math.abs(above - below) < 12, 'los párpados no son simétricos');
  assert.ok(pupil >= 30, 'falta la pupila');
});

test('la espiral crece con el índice y da unas 2,75 vueltas', () => {
  const points = createFigureTargets('spiral', 260, 9);
  const radii = points.map((p) => Math.hypot(p.x - 0.5, p.y - 0.5));
  assert.ok(radii[0] < 0.05, 'no empieza en el centro');
  assert.ok(radii[259] > 0.35, 'no llega al borde');
  let unwound = 0;
  let previous = Math.atan2(points[0].y - 0.5, points[0].x - 0.5);
  for (let index = 1; index < points.length; index += 1) {
    const angle = Math.atan2(points[index].y - 0.5, points[index].x - 0.5);
    let delta = angle - previous;
    if (delta > Math.PI) delta -= Math.PI * 2;
    if (delta < -Math.PI) delta += Math.PI * 2;
    unwound += delta;
    previous = angle;
  }
  const turns = Math.abs(unwound) / (Math.PI * 2);
  assert.ok(turns > 2.4 && turns < 3, `${turns} vueltas`);
});

test('el laberinto tiene cuatro anillos, cada uno con su hueco, y un centro habitado', () => {
  const points = createFigureTargets('labyrinth', 260, 11);
  const rings = [0.4, 0.3, 0.2, 0.1].map((half) =>
    points.filter((p) => {
      const dx = Math.abs(p.x - 0.5);
      const dy = Math.abs(p.y - 0.5) / 0.94;
      return Math.abs(Math.max(dx, dy) - half) < 0.012;
    }).length,
  );
  for (const [index, size] of rings.entries()) assert.ok(size > 12, `anillo ${index} vacío (${size})`);
  assert.ok(rings[0] > rings[3], 'el anillo exterior es el más largo');
  const heart = points.filter((p) => Math.hypot(p.x - 0.5, p.y - 0.5) < 0.04).length;
  assert.ok(heart >= 4, 'el centro está vacío');
  // El hueco: en el lado abierto del anillo exterior (arriba) falta un tramo.
  const topRow = points.filter((p) => Math.abs(p.y - (0.5 - 0.4 * 0.94)) < 0.012).map((p) => p.x).sort((a, b) => a - b);
  let widest = 0;
  for (let index = 1; index < topRow.length; index += 1) widest = Math.max(widest, topRow[index] - topRow[index - 1]);
  assert.ok(widest > 0.05, `el anillo exterior no tiene hueco (salto mayor: ${widest})`);
});

test('la réplica son dos ojos, uno a cada lado, y el segundo en espejo', () => {
  const points = createFigureTargets('double', 260, 13);
  const left = points.slice(0, 130);
  const right = points.slice(130);
  assert.ok(left.every((p) => p.x < 0.5), 'el primer ojo invade la derecha');
  assert.ok(right.every((p) => p.x > 0.5), 'el segundo ojo invade la izquierda');
  const meanLeft = left.reduce((sum, p) => sum + p.x, 0) / left.length;
  const meanRight = right.reduce((sum, p) => sum + p.x, 0) / right.length;
  assert.ok(Math.abs(meanLeft + meanRight - 1) < 0.03, 'no están en espejo');
});

test('el nombre reparte E, V y A en su caja, cada letra en su tercio', () => {
  const points = createFigureTargets('name', 260, 17);
  for (const { x, y } of points) {
    assert.ok(x >= 0.13 && x <= 0.87, `x=${x}`);
    assert.ok(y >= 0.29 && y <= 0.71, `y=${y}`);
  }
  const e = points.filter((p) => p.x < 0.36).length;
  const v = points.filter((p) => p.x >= 0.36 && p.x < 0.64).length;
  const a = points.filter((p) => p.x >= 0.64).length;
  assert.ok(e > 60 && v > 60 && a > 60, `E=${e} V=${v} A=${a}`);
  // La E lleva más trazo que la V: le tocan más puntos.
  assert.ok(e > v, `E=${e} V=${v}`);
  // El travesaño de la A existe: hay puntos a media altura entre sus patas.
  const bar = points.filter((p) => p.x > 0.73 && p.x < 0.81 && Math.abs(p.y - 0.56) < 0.01).length;
  assert.ok(bar >= 4, `travesaño con ${bar} puntos`);
});

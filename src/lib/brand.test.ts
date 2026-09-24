import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  POSES,
  RETURN,
  REVEAL,
  SEGMENTS,
  STROKE,
  boundsOf,
  durationOf,
  placeShape,
  sample,
  sizeOf,
  type Point,
  type Pose,
  type PoseId,
  type SegmentId,
} from './brand';

const ALL_POSES = Object.keys(POSES) as PoseId[];
const near = (a: number, b: number, tolerance = 1e-9) => Math.abs(a - b) <= tolerance;

/** Distancias entre todos los vértices de un polígono: su huella rígida. */
function footprint(shape: readonly Point[]) {
  const out: number[] = [];
  for (let i = 0; i < shape.length; i++)
    for (let j = i + 1; j < shape.length; j++)
      out.push(Math.hypot(shape[i][0] - shape[j][0], shape[i][1] - shape[j][1]));
  return out;
}

/** Caja de un grupo de piezas en una pose (una letra). */
function boxOf(pose: Pose, ids: readonly SegmentId[]) {
  const points = ids.flatMap((id) => placeShape(id, pose[id]));
  return {
    left: Math.min(...points.map(([x]) => x)),
    right: Math.max(...points.map(([x]) => x)),
    top: Math.min(...points.map(([, y]) => y)),
    bottom: Math.max(...points.map(([, y]) => y)),
  };
}

const E: SegmentId[] = ['q1', 'q3', 'q4'];
const V: SegmentId[] = ['x1', 'x2'];
const A: SegmentId[] = ['x3', 'x4'];

test('geometría rígida: ninguna pieza se estira en ninguna pose ni a medio camino', () => {
  const reference = Object.fromEntries(
    SEGMENTS.map((id) => [id, footprint(placeShape(id, { x: 0, y: 0, angle: 0, alpha: 1 }))]),
  );
  const moments = [0, 0.13, 0.37, 0.5, 0.71, 0.88, 1].map((f) => sample(REVEAL, f * durationOf(REVEAL)).pose);
  for (const pose of [...ALL_POSES.map((id) => POSES[id]), ...moments]) {
    for (const id of SEGMENTS) {
      const now = footprint(placeShape(id, pose[id]));
      now.forEach((length, k) => assert.ok(near(length, reference[id][k], 1e-9), `${id} cambió de medida`));
    }
  }
});

test('mismo grosor: las barras miden STROKE de alto', () => {
  const [, top, , bottom] = placeShape('q1', { x: 0, y: 0, angle: 0, alpha: 1 });
  assert.ok(near(bottom[1] - top[1], STROKE));
});

test('el símbolo es un cuadrado sobre una X, y la X es tan ancha como el cuadrado (±5 %)', () => {
  const pose = POSES.isotype;
  const square = boxOf(pose, ['q1', 'q2', 'q3', 'q4']);
  const cross = boxOf(pose, [...V, ...A]);
  assert.ok(near(square.right - square.left, square.bottom - square.top, 1e-9), 'el cuadrado es cuadrado');
  assert.ok(square.bottom < cross.top, 'el cuadrado va encima de la X, sin tocarla');
  const ratio = (cross.right - cross.left) / (square.right - square.left);
  assert.ok(ratio > 0.95 && ratio < 1.05, `la X mide ${ratio.toFixed(2)} veces el cuadrado`);
});

test('el nombre: E, V y Λ en una fila, las tres del mismo alto', () => {
  const pose = POSES.logotype;
  const [e, v, a] = [boxOf(pose, E), boxOf(pose, V), boxOf(pose, A)];
  for (const letter of [v, a]) {
    assert.ok(near(letter.top, e.top, 1e-9) && near(letter.bottom, e.bottom, 1e-9), 'misma línea y mismo alto');
  }
  assert.ok(e.right < v.left && v.right < a.left, 'en orden y sin montarse');
  assert.equal(pose.q2.alpha, 0, 'el cuarto lado no está en el nombre');
});

test('cada pose está centrada en el origen', () => {
  for (const id of ALL_POSES) {
    const box = boundsOf(POSES[id]);
    assert.ok(near((box.left + box.right) / 2, 0, 1e-9) && near((box.top + box.bottom) / 2, 0, 1e-9), id);
  }
});

test('la revelación va del símbolo al nombre, y el regreso al revés', () => {
  assert.deepEqual(sample(REVEAL, 0).pose, POSES.isotype);
  assert.deepEqual(sample(REVEAL, durationOf(REVEAL)).pose, POSES.logotype);
  assert.deepEqual(sample(RETURN, 0).pose, POSES.logotype);
  assert.deepEqual(sample(RETURN, durationOf(RETURN)).pose, POSES.isotype);
  assert.equal(durationOf(REVEAL), durationOf(RETURN), 'ida y vuelta duran lo mismo: bucle simétrico');
});

test('al alinearse, ninguna letra pasa por encima de otra', () => {
  // Del final de la columna (split) al nombre: se muestrea el tramo fino.
  const total = durationOf(REVEAL);
  const start = total - REVEAL[REVEAL.length - 1].move;
  for (let ms = start; ms <= total; ms += 10) {
    const pose = sample(REVEAL, ms).pose;
    const [e, v, a] = [boxOf(pose, E), boxOf(pose, V), boxOf(pose, A)];
    const overlap = (p: typeof e, q: typeof e) =>
      p.left < q.right && q.left < p.right && p.top < q.bottom && q.top < p.bottom;
    assert.ok(!overlap(e, v), `E y V se cruzan a los ${ms} ms`);
    assert.ok(!overlap(v, a), `V y Λ se cruzan a los ${ms} ms`);
  }
});

test('el nombre es unas cinco veces más ancho que alto', () => {
  const { width, height } = sizeOf(POSES.logotype);
  assert.ok(width / height > 4.5 && width / height < 6, `proporción ${(width / height).toFixed(2)}`);
});

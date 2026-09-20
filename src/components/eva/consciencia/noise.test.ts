import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fbm, hash3, valueNoise3 } from './noise';

test('el hash es determinista, cae en [0, 1) y cambia con cada coordenada y con la semilla', () => {
  assert.equal(hash3(3, -7, 11, 5), hash3(3, -7, 11, 5));
  const values = new Set<number>();
  for (let ix = -4; ix <= 4; ix += 1) {
    for (let iy = -4; iy <= 4; iy += 1) {
      for (let iz = 0; iz < 3; iz += 1) {
        const value = hash3(ix, iy, iz);
        assert.ok(value >= 0 && value < 1, `fuera de rango en ${ix},${iy},${iz}: ${value}`);
        values.add(value);
      }
    }
  }
  assert.ok(values.size > 9 * 9 * 3 * 0.98, 'demasiadas colisiones para una rejilla tan pequeña');
  assert.notEqual(hash3(1, 2, 3), hash3(1, 2, 3, 99));
  assert.notEqual(hash3(1, 2, 3), hash3(2, 1, 3));
});

test('el ruido de valor se queda en [-1, 1] y coincide con las esquinas en coordenadas enteras', () => {
  for (let index = 0; index < 400; index += 1) {
    const x = (index * 0.37) % 9 - 4;
    const y = (index * 0.61) % 7 - 3;
    const z = (index * 0.13) % 5;
    const value = valueNoise3(x, y, z);
    assert.ok(value >= -1 && value <= 1, `fuera de rango: ${value}`);
  }
  assert.ok(Math.abs(valueNoise3(2, -3, 4) - (hash3(2, -3, 4) * 2 - 1)) < 1e-12);
});

test('el ruido es continuo: un paso pequeño cambia poco el valor', () => {
  let worst = 0;
  for (let index = 0; index < 500; index += 1) {
    const x = index * 0.0173;
    const y = index * 0.0091 + 0.5;
    const z = index * 0.0042;
    worst = Math.max(worst, Math.abs(valueNoise3(x + 0.001, y, z) - valueNoise3(x, y, z)));
  }
  assert.ok(worst < 0.02, `salto de ${worst} en un milésimo`);
});

test('fbm queda en [-1, 1], es determinista y con una octava es el ruido base', () => {
  for (let index = 0; index < 300; index += 1) {
    const x = index * 0.043;
    const y = index * 0.029;
    const z = index * 0.011;
    const value = fbm(x, y, z);
    assert.ok(value >= -1 && value <= 1, `fuera de rango: ${value}`);
    assert.equal(value, fbm(x, y, z));
  }
  assert.equal(fbm(1.3, 2.7, 0.4, 1), valueNoise3(1.3, 2.7, 0.4));
  assert.notEqual(fbm(1.3, 2.7, 0.4, 3), valueNoise3(1.3, 2.7, 0.4));
  assert.equal(fbm(1, 1, 1, 0), 0, 'sin octavas no hay ruido');
});

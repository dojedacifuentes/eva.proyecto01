import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  BRAIN_HALF_HEIGHT,
  BRAIN_SWEEP,
  FILL,
  fitScale,
  HALF_HEIGHT,
  ringRadii,
} from './neural-frame';

/** Proporciones reales: móvil vertical, sala cuadrada, escáner, sala de escritorio, pantalla ancha. */
const ASPECTS = [0.55, 0.8, 1, 1.13, 1.28, 1.6, 2.2];
const EPSILON = 1e-9;

test('el cerebro nunca se sale del marco, en ninguna proporción', () => {
  for (const aspect of ASPECTS) {
    const scale = fitScale(aspect);
    assert.ok(BRAIN_HALF_HEIGHT * scale <= FILL * HALF_HEIGHT + EPSILON, `alto, aspecto ${aspect}`);
    assert.ok(BRAIN_SWEEP * scale <= FILL * HALF_HEIGHT * aspect + EPSILON, `ancho, aspecto ${aspect}`);
  }
});

test('la dimensión que limita queda llena, no a medias', () => {
  for (const aspect of ASPECTS) {
    const scale = fitScale(aspect);
    const height = (BRAIN_HALF_HEIGHT * scale) / HALF_HEIGHT;
    const width = (BRAIN_SWEEP * scale) / (HALF_HEIGHT * aspect);
    assert.ok(Math.abs(Math.max(height, width) - FILL) < 1e-6, `aspecto ${aspect}`);
  }
});

test('en la sala de escritorio el cerebro es mayor que con la escala fija anterior', () => {
  // Lienzo de la sala a 1440×900: ~696×612.
  assert.ok(fitScale(696 / 612) > 1.5);
});

test('las órbitas rodean el cerebro y no pasan del borde', () => {
  for (const aspect of ASPECTS) {
    const scale = fitScale(aspect);
    const { inner, outer } = ringRadii(scale, aspect);
    assert.ok(inner > BRAIN_SWEEP * scale, `interior, aspecto ${aspect}`);
    assert.ok(outer > inner, `exterior, aspecto ${aspect}`);
    assert.ok(outer <= HALF_HEIGHT * aspect * 1.02, `borde, aspecto ${aspect}`);
  }
});

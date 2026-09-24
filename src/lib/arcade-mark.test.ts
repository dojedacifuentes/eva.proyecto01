import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ARCADE_INTRO, markDuration, markKeyframes, markStyles, pieceVars, stopsOf } from './arcade-mark';
import { SEGMENTS } from './brand';

test('el recorrido empieza y termina en el símbolo', () => {
  assert.equal(ARCADE_INTRO[0].pose, 'isotype');
  assert.equal(ARCADE_INTRO.at(-1)?.pose, 'isotype');
});

test('pasa por ≡X y por el nombre, una sola vez', () => {
  const poses = ARCADE_INTRO.map((step) => step.pose);
  assert.equal(poses.filter((pose) => pose === 'logotype').length, 1);
  assert.ok(poses.indexOf('unlock') < poses.indexOf('logotype'));
});

test('dura lo que pide el encargo: entre 2,4 y 3,4 s', () => {
  const ms = markDuration();
  assert.ok(ms >= 2400 && ms <= 3400, `${ms} ms`);
});

test('cada calendario avanza sin volver atrás y cubre el recorrido entero', () => {
  for (const channel of ['x', 'y'] as const) {
    const stops = stopsOf(channel);
    assert.equal(stops[0].t, 0);
    assert.equal(stops.at(-1)?.t, markDuration());
    for (let k = 1; k < stops.length; k++) {
      assert.ok(stops[k].t > stops[k - 1].t, `${channel}: ${stops[k - 1].t} → ${stops[k].t}`);
      assert.ok(stops[k].step >= stops[k - 1].step, `${channel}: la pose no retrocede`);
    }
  }
});

test('al formar el nombre, el eje horizontal va primero; al volver, el vertical', () => {
  const logo = ARCADE_INTRO.findIndex((step) => step.pose === 'logotype');
  const arrive = (channel: 'x' | 'y', step: number) => stopsOf(channel).find((stop) => stop.step === step)!.t;
  assert.ok(arrive('x', logo) < arrive('y', logo));
  assert.ok(arrive('y', logo + 1) < arrive('x', logo + 1));
});

test('las ocho piezas llevan una variable por paso y eje', () => {
  for (const id of SEGMENTS) {
    const vars = pieceVars(id);
    for (let k = 0; k < ARCADE_INTRO.length; k++) {
      for (const name of ['x', 'y', 'a', 'o']) assert.match(vars, new RegExp(`--${name}${k}:`));
    }
  }
  const css = markStyles();
  assert.match(markKeyframes(), /@keyframes arcade-mark-x/);
  assert.equal(css.match(/\.arcade-mark \.mark-/g)?.length, SEGMENTS.length);
  assert.doesNotMatch(css, /NaN|undefined|</);
});

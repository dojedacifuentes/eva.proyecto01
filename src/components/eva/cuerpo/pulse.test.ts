import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BPM, createHeartbeat, ecg, flash, squeeze } from './pulse';

test('el corazón se contrae al empezar el latido y descansa después', () => {
  assert.equal(squeeze(0), 1);
  assert.ok(squeeze(0.065) < 0.85, 'a mitad del golpe va encogido');
  assert.equal(squeeze(0.5), 1);
  assert.equal(squeeze(0.99), 1);
  assert.ok(squeeze(0.065, 2) < squeeze(0.065), 'un latido forzado encoge más');
});

test('el destello dura poco', () => {
  assert.equal(flash(0), 1);
  assert.equal(flash(0.5), 0);
});

test('el trazo tiene su pico R donde toca y vuelve a la línea base', () => {
  const samples = Array.from({ length: 1000 }, (_, at) => ecg(at / 1000));
  const peak = samples.indexOf(Math.max(...samples));
  assert.ok(Math.abs(peak / 1000 - 0.255) < 0.005, `pico en ${peak / 1000}`);
  assert.ok(Math.abs(ecg(0.8)) < 0.001, 'entre latidos, línea base');
  assert.ok(ecg(0.275) < 0, 'la onda S baja de la línea base');
});

test('el reloj cuenta un latido por ciclo, sea cual sea el paso', () => {
  for (const dt of [1 / 120, 1 / 60, 1 / 24]) {
    const heart = createHeartbeat();
    let fired = 0;
    for (let time = 0; time < 60; time += dt) if (heart.advance(dt, BPM.rest)) fired += 1;
    assert.ok(Math.abs(fired - BPM.rest) <= 1, `${fired} latidos en un minuto a ${BPM.rest}`);
    assert.equal(heart.beats, fired);
  }
});

test('cambiar de ritmo no hace saltar la fase', () => {
  const heart = createHeartbeat();
  heart.advance(0.4, BPM.rest);
  const before = heart.phase;
  heart.advance(0.001, BPM.fast);
  assert.ok(heart.phase - before < 0.01);
});

test('un latido forzado empieza de cero y cuenta', () => {
  const heart = createHeartbeat();
  heart.advance(0.5, BPM.rest);
  heart.kick();
  assert.equal(heart.phase, 0);
  assert.equal(heart.beats, 1);
});

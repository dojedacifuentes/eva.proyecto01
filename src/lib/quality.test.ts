import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getQuality, qualityDebug, reportFrame, subscribeQuality } from './quality';

/*
 * El almacén es de módulo (una sola verdad por página), así que la prueba
 * recorre la vida entera del sensor en orden: alto → medio → bajo → bajo.
 */

/** Tantos fotogramas seguidos de esta duración. */
function frames(seconds: number, count: number) {
  for (let at = 0; at < count; at += 1) reportFrame(seconds);
}

test('sin ventana, el nivel de partida es alto: el HTML no cambia por dispositivo', () => {
  assert.equal(getQuality(), 'high');
});

test('los fotogramas buenos no bajan el nivel, ni siquiera durante mucho tiempo', () => {
  frames(1 / 60, 60 * 30);
  assert.equal(getQuality(), 'high');
  assert.ok(qualityDebug().averageMs < 40);
});

test('un tirón suelto no cuenta: la lentitud tiene que durar', () => {
  frames(0.3, 3);
  frames(1 / 60, 60 * 5);
  assert.equal(getQuality(), 'high');
});

test('los fotogramas muy lentos (700 ms) también cuentan, recortados: baja a medio', () => {
  const heard: string[] = [];
  const unsubscribe = subscribeQuality(() => heard.push(getQuality()));
  // Ya pasó el calentamiento; hacen falta dos segundos de lentitud sostenida.
  frames(0.7, 3);
  assert.equal(getQuality(), 'high', 'tres fotogramas (1,5 s recortados) aún no bastan');
  frames(0.7, 2);
  assert.equal(getQuality(), 'mid');
  assert.deepEqual(heard, ['mid']);
  unsubscribe();
});

test('tras bajar hay un respiro: la lentitud inmediata no vuelve a bajar', () => {
  frames(0.1, 20); // dos segundos lentos dentro del respiro de seis
  assert.equal(getQuality(), 'mid');
});

test('pasado el respiro, la lentitud sostenida baja otro escalón, y de bajo no pasa', () => {
  frames(0.1, 60); // agota el respiro
  frames(0.1, 30); // y dos segundos más de lentitud
  assert.equal(getQuality(), 'low');
  frames(0.1, 200);
  assert.equal(getQuality(), 'low');
});

test('una ausencia (más de tres segundos) no es un fotograma: se ignora', () => {
  const before = qualityDebug().averageMs;
  reportFrame(12);
  reportFrame(Number.NaN);
  reportFrame(-1);
  assert.equal(qualityDebug().averageMs, before);
});

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { bin, binPath, bitsFor, isBinaryCode } from './binary';

test('bin convierte de verdad, no antepone ceros a un decimal', () => {
  assert.equal(bin(1, 2), '01');
  assert.equal(bin(2, 2), '10');
  assert.equal(bin(3, 2), '11');
  assert.equal(bin(8, 4), '1000');
  assert.equal(bin(41, 6), '101001');
});

test('el ancho de una serie son los bits de su índice mayor', () => {
  assert.equal(bitsFor(3), 2);
  assert.equal(bitsFor(7), 3);
  assert.equal(bitsFor(8), 4);
  assert.equal(bitsFor(1), 2, 'nunca menos de dos: «1» se lee como cantidad');
});

test('binPath separa niveles con un punto', () => {
  assert.equal(binPath([1, 2]), '01.10');
  assert.equal(binPath([1, 3]), '01.11');
  assert.equal(binPath([3]), '11');
});

test('rechaza lo que no es un índice', () => {
  assert.throws(() => bin(-1));
  assert.throws(() => bin(1.5));
  assert.throws(() => binPath([]));
});

test('isBinaryCode reconoce códigos y rechaza decimales', () => {
  assert.ok(isBinaryCode('01.10'));
  assert.ok(isBinaryCode('1000'));
  assert.ok(!isBinaryCode('02'));
  assert.ok(!isBinaryCode('01.'));
  assert.ok(!isBinaryCode('0 1'));
});

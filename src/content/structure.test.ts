import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isBinaryCode } from '@/lib/binary';
import { axes, contextNodes, hashAliases, home, navItems, nextContext } from './structure';

test('los tres ejes llevan el código de su posición', () => {
  assert.deepEqual(
    axes.map((axis) => [axis.code, axis.name]),
    [
      ['01', 'Entidad'],
      ['10', 'Vigilancia'],
      ['11', 'Autonomía'],
    ],
  );
  assert.equal(home.code, '00');
});

test('Entidad tiene tres subsecciones con ruta binaria', () => {
  const entidad = axes[0];
  assert.deepEqual(
    entidad.children.map((child) => [child.code, child.id]),
    [
      ['01.01', 'nucleo'],
      ['01.10', 'genoma'],
      ['01.11', 'reserva'],
    ],
  );
  assert.equal(entidad.children[2].state, 'reserved');
});

test('Vigilancia está clausurada y Autonomía en desarrollo, sin subsecciones inventadas', () => {
  assert.equal(axes[1].state, 'sealed');
  assert.equal(axes[2].state, 'building');
  assert.equal(axes[1].children.length, 0);
  assert.equal(axes[2].children.length, 0);
});

test('todo código visible es binario y todo destino existe', () => {
  const codes = [
    home.code,
    ...navItems.flatMap((item) => [item.code, ...item.children.map((child) => child.code)]),
  ];
  for (const code of codes) assert.ok(isBinaryCode(code), `«${code}» no es binario`);
  const ids = new Set(['entidad', ...contextNodes.map((node) => node.id)]);
  for (const target of Object.values(hashAliases)) {
    assert.ok(ids.has(target), `alias sin destino: ${target}`);
  }
});

test('el recorrido sigue el orden de la página', () => {
  assert.deepEqual(
    contextNodes.map((node) => node.id),
    ['inicio', 'nucleo', 'genoma', 'reserva', 'vigilancia', 'autonomia'],
  );
  assert.equal(nextContext('genoma')?.id, 'reserva');
  assert.equal(nextContext('autonomia'), undefined);
});

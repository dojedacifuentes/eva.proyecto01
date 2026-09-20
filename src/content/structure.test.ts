import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isBinaryCode } from '@/lib/binary';
import { axes, contextNodes, doors, hashAliases, home, navItems, nextContext } from './structure';

test('cuatro lugares, cada uno con el código de su posición', () => {
  assert.deepEqual(
    axes.map((axis) => [axis.code, axis.name]),
    [
      ['001', 'Consciencia'],
      ['010', 'Genoma'],
      ['011', 'Cerebro'],
      ['100', 'Cuerpo'],
    ],
  );
  assert.equal(home.code, '000');
});

test('ninguno tiene partes: la página dejó de ser un inventario', () => {
  for (const axis of axes) {
    assert.equal(axis.children.length, 0);
    assert.equal(axis.state, 'active');
  }
});

test('las puertas son los cuatro lugares, en orden', () => {
  assert.deepEqual(
    doors.map((door) => [door.code, door.name]),
    [
      ['001', 'Consciencia'],
      ['010', 'Genoma'],
      ['011', 'Cerebro'],
      ['100', 'Cuerpo'],
    ],
  );
});

test('todo código visible es binario y todo destino existe', () => {
  const codes = [
    home.code,
    ...navItems.flatMap((item) => [item.code, ...item.children.map((child) => child.code)]),
  ];
  for (const code of codes) assert.ok(isBinaryCode(code), `«${code}» no es binario`);
  const ids = new Set(contextNodes.map((node) => node.id));
  for (const target of Object.values(hashAliases)) {
    assert.ok(ids.has(target), `alias sin destino: ${target}`);
  }
});

test('las anclas de versiones anteriores siguen llevando a algún sitio', () => {
  assert.equal(hashAliases.nucleo, 'cerebro');
  assert.equal(hashAliases.vigilancia, 'inicio');
  for (const alias of Object.keys(hashAliases)) {
    assert.ok(!contextNodes.some((node) => node.id === alias), `«${alias}» es un lugar vivo, no un alias`);
  }
});

test('el recorrido empieza por dentro y termina por fuera, en el cuerpo', () => {
  assert.deepEqual(
    contextNodes.map((node) => node.id),
    ['inicio', 'consciencia', 'genoma', 'cerebro', 'cuerpo'],
  );
  assert.equal(nextContext('consciencia')?.id, 'genoma');
  assert.equal(nextContext('cerebro')?.id, 'cuerpo');
  assert.equal(nextContext('cuerpo'), undefined);
});

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isBinaryCode } from '@/lib/binary';
import { axes, contextNodes, doors, hashAliases, home, navItems, nextContext } from './structure';

test('dos ejes, cada uno con el código de su posición; la Consciencia no tiene partes', () => {
  assert.deepEqual(
    axes.map((axis) => [axis.code, axis.name]),
    [
      ['01', 'Entidad'],
      ['10', 'Consciencia'],
    ],
  );
  assert.equal(home.code, '00');
  assert.deepEqual(axes[1].children, []);
});

test('Entidad tiene tres subsecciones con ruta binaria, todas abiertas', () => {
  const entidad = axes[0];
  assert.deepEqual(
    entidad.children.map((child) => [child.code, child.id]),
    [
      ['01.01', 'nucleo'],
      ['01.10', 'genoma'],
      ['01.11', 'cuerpo'],
    ],
  );
  for (const child of entidad.children) assert.equal(child.state, 'active');
});

test('las puertas son las tres partes de la Entidad y la Consciencia', () => {
  assert.deepEqual(
    doors.map((door) => [door.code, door.name]),
    [
      ['01.01', 'Núcleo cerebral'],
      ['01.10', 'Genoma digital'],
      ['01.11', 'Cuerpo'],
      ['10', 'Consciencia'],
    ],
  );
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

test('las anclas retiradas siguen llevando a algún sitio', () => {
  assert.equal(hashAliases.reserva, 'cuerpo');
  assert.equal(hashAliases.vigilancia, 'inicio');
  assert.equal(hashAliases.autonomia, 'inicio');
  for (const alias of Object.keys(hashAliases)) {
    assert.ok(!contextNodes.some((node) => node.id === alias), `«${alias}» es un lugar vivo, no un alias`);
  }
});

test('el recorrido sigue el orden de la página', () => {
  assert.deepEqual(
    contextNodes.map((node) => node.id),
    ['inicio', 'nucleo', 'genoma', 'cuerpo', 'consciencia'],
  );
  assert.equal(nextContext('genoma')?.id, 'cuerpo');
  assert.equal(nextContext('cuerpo')?.id, 'consciencia');
  assert.equal(nextContext('consciencia'), undefined);
});

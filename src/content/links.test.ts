import assert from 'node:assert/strict';
import { test } from 'node:test';
import { bin, isBinaryCode } from '@/lib/binary';
import { groups, links } from './links';

test('los nodos de cada grupo van en binario, por posición y con el ancho de su serie', () => {
  for (const group of groups) {
    const nodes = group.entries.map((entry) => entry.node);
    assert.ok(nodes.every(isBinaryCode), `${group.id}: ${nodes.join(' ')}`);
    assert.deepEqual(nodes, [...new Set(nodes)], 'sin repetidos');
    assert.ok(nodes.every((node) => node.length === (nodes[0]?.length ?? 0)), 'mismo ancho');
    // Cada grupo es su propia serie: empieza en 1.
    if (nodes.length) assert.equal(nodes[0], bin(1, nodes[0].length), `${group.id} empieza en ${nodes[0]}`);
  }
  const nodesOf = (id: string) => groups.find((group) => group.id === id)?.entries.map((entry) => entry.node);
  assert.deepEqual(nodesOf('arcade'), ['01', '10']);
  assert.deepEqual(nodesOf('academy'), ['01']);
  assert.deepEqual(nodesOf('lab'), ['01']);
});

test('los ids son únicos y todo destino es una URL absoluta o una ruta del sitio', () => {
  const ids = groups.flatMap((group) => group.entries.map((entry) => entry.id));
  assert.deepEqual(ids, [...new Set(ids)]);
  for (const href of [...groups.flatMap((group) => group.entries.map((entry) => entry.href)), links.gateway.href]) {
    assert.match(href, /^(https:\/\/[^\s]+|\/[^\s]*)$/, href);
  }
});

test('el Arcade es el único grupo protagonista y todo grupo lleva rótulo', () => {
  assert.deepEqual(groups.filter((group) => group.featured).map((group) => group.id), ['arcade']);
  assert.ok(groups.every((group) => group.label.trim().length > 0));
});

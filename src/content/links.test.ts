import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isBinaryCode } from '@/lib/binary';
import { groups, links } from './links';

test('los nodos de cada grupo van en binario, por posición y con el ancho de su serie', () => {
  for (const group of groups) {
    const nodes = group.entries.map((entry) => entry.node);
    assert.ok(nodes.every(isBinaryCode), `${group.id}: ${nodes.join(' ')}`);
    assert.deepEqual(nodes, [...new Set(nodes)], 'sin repetidos');
    assert.ok(nodes.every((node) => node.length === (nodes[0]?.length ?? 0)), 'mismo ancho');
  }
  const arcade = groups.find((group) => group.id === 'arcade');
  assert.deepEqual(arcade?.entries.map((entry) => entry.node), ['01', '10']);
});

test('los ids son únicos y todo destino es una URL absoluta o una ruta del sitio', () => {
  const ids = groups.flatMap((group) => group.entries.map((entry) => entry.id));
  assert.deepEqual(ids, [...new Set(ids)]);
  for (const href of [...groups.flatMap((group) => group.entries.map((entry) => entry.href)), links.gateway.href]) {
    assert.match(href, /^(https:\/\/[^\s]+|\/[^\s]*)$/, href);
  }
});

test('un grupo sin entradas existe para el futuro y no rompe nada', () => {
  const empty = groups.filter((group) => group.entries.length === 0);
  assert.ok(empty.every((group) => group.label.length > 0));
});

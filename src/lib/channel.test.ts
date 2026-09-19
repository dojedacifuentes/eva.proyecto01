import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  channelReducer,
  createChannel,
  CUT_MARK,
  holdAfter,
  nextScriptLine,
  pendingEntry,
  TOAST_GAP_MS,
  type ChannelAction,
  type ChannelState,
} from './channel';

const run = (state: ChannelState, ...actions: ChannelAction[]) =>
  actions.reduce(channelReducer, state);

const LINE = { kind: 'thought', text: 'Yo llamo «yo» al patrón que persiste.' } as const;

test('empieza cerrado y sin avisos', () => {
  const state = createChannel('inicio');
  assert.equal(state.open, false);
  assert.equal(state.toast, false);
  assert.equal(state.pending, false);
});

test('nada lo abre salvo la acción del visitante', () => {
  let state = createChannel('inicio');
  state = run(
    state,
    { type: 'context', node: 'nucleo', typed: 0 },
    { type: 'settled', now: 20_000 },
    { type: 'toast-end' },
    { type: 'say', line: LINE },
    { type: 'line-done' },
  );
  assert.equal(state.open, false, 'ni el contexto, ni el aviso, ni el guion lo abren');
  assert.equal(state.log.length, 0, 'cerrado no escribe');
  state = run(state, { type: 'open', label: '01.01 · NÚCLEO CEREBRAL' });
  assert.equal(state.open, true);
});

test('cambiar de lugar lo cierra, y volver no lo reabre', () => {
  let state = run(
    createChannel('nucleo'),
    { type: 'open', label: '01.01' },
    { type: 'context', node: 'genoma', typed: 0 },
  );
  assert.equal(state.open, false);
  state = run(state, { type: 'context', node: 'nucleo', typed: 0 });
  assert.equal(state.open, false);
  assert.equal(state.pending, false, 'el lugar ya abierto no vuelve a avisar');
});

test('el aviso sale una vez por lugar y nunca con el canal abierto', () => {
  let state = run(createChannel('inicio'), { type: 'context', node: 'nucleo', typed: 0 });
  assert.equal(state.pending, true);
  state = run(state, { type: 'settled', now: 50_000 });
  assert.equal(state.toast, true);
  state = run(state, { type: 'toast-end' }, { type: 'settled', now: 90_000 });
  assert.equal(state.toast, false, 'mismo lugar: no repite');
  // Sale y vuelve: sigue sin repetir.
  state = run(
    state,
    { type: 'context', node: 'genoma', typed: 0 },
    { type: 'context', node: 'nucleo', typed: 0 },
    { type: 'settled', now: 200_000 },
  );
  assert.equal(state.toast, false);

  let opened = run(createChannel('inicio'), { type: 'open', label: '00' });
  opened = run(opened, { type: 'settled', now: 50_000 });
  assert.equal(opened.toast, false);
});

test('entre dos avisos pasa el intervalo mínimo; mientras, queda el punto discreto', () => {
  let state = run(
    createChannel('inicio'),
    { type: 'context', node: 'nucleo', typed: 0 },
    { type: 'settled', now: 100_000 },
    { type: 'toast-end' },
    { type: 'context', node: 'genoma', typed: 0 },
    { type: 'settled', now: 100_000 + TOAST_GAP_MS - 1 },
  );
  assert.equal(state.toast, false);
  assert.equal(state.pending, true);
  state = run(state, { type: 'settled', now: 100_000 + TOAST_GAP_MS });
  assert.equal(state.toast, true);
});

test('una frase interrumpida se retoma donde quedó si el lugar es el mismo', () => {
  let state = run(
    createChannel('nucleo'),
    { type: 'open', label: '01.01' },
    { type: 'say', line: LINE },
    { type: 'close', typed: 12 },
  );
  assert.equal(pendingEntry(state)?.typed, 12);
  state = run(state, { type: 'open', label: '01.01' });
  assert.equal(pendingEntry(state)?.typed, 12, 'no empieza de cero');
  assert.equal(state.log.filter((entry) => entry.kind === 'divider').length, 1, 'mismo hilo, sin divisor nuevo');
});

test('en otro lugar, la frase a medias se sella y el hilo nuevo se anuncia', () => {
  let state = run(
    createChannel('nucleo'),
    { type: 'open', label: '01.01' },
    { type: 'say', line: LINE },
    { type: 'context', node: 'genoma', typed: 7 },
    { type: 'open', label: '01.10' },
  );
  const [, cut, divider] = state.log;
  assert.equal(cut.cut, true);
  assert.equal(cut.text, `Yo llam${CUT_MARK}`);
  assert.equal(divider.kind, 'divider');
  assert.equal(divider.node, 'genoma');
  assert.equal(pendingEntry(state), undefined);
  state = run(state, { type: 'say', line: { kind: 'explain', text: 'Esto es mi genoma.' } });
  assert.equal(state.log.at(-1)?.node, 'genoma');
});

test('el guion avanza por lugar y no se pisa: una frase a la vez', () => {
  const script = [LINE, { kind: 'calc', text: 'σ(w·x + b) → 0,7312' }] as const;
  let state = run(createChannel('nucleo'), { type: 'open', label: '01.01' });
  assert.equal(nextScriptLine(state, script), script[0]);
  state = run(state, { type: 'say', line: script[0] }, { type: 'say', line: script[1] });
  assert.equal(state.log.filter((entry) => entry.kind !== 'divider').length, 1, 'la segunda espera');
  state = run(state, { type: 'line-done' });
  assert.equal(nextScriptLine(state, script), script[1]);
  state = run(state, { type: 'say', line: script[1] }, { type: 'line-done' });
  assert.equal(nextScriptLine(state, script), undefined, 'guion agotado: no vuelve a empezar');
});

test('la espera tras una frase crece con su largo, dentro de sus límites', () => {
  assert.equal(holdAfter('Sí.'), 1800);
  assert.equal(holdAfter('x'.repeat(80)), 2800);
  assert.equal(holdAfter('x'.repeat(500)), 4200);
});

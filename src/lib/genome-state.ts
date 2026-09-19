/**
 * Estado del genoma, publicado para quien quiera reaccionar a él.
 *
 * En la portada el genoma escribía su estado en `.hero__grid[data-genome]` y
 * el retrato reaccionaba desde CSS. Ahora vive en su propia subsección, lejos
 * del retrato: el estado va a `<html data-genome>` —cualquier pieza puede
 * leerlo desde CSS— y cada acción sacude el campo de partículas.
 */
import { surgeField } from './field';

export type GenomeState =
  | 'active'
  | 'cloning'
  | 'using'
  | 'mutating'
  | 'scanning'
  | 'unwinding'
  | 'sounding'
  | 'exporting';

/** Cuánto sacude el tejido cada estado: mutar y clonar, mucho; leer, poco. */
const SURGE: Record<GenomeState, number> = {
  active: 0,
  cloning: 0.8,
  using: 0.5,
  mutating: 1,
  scanning: 0.35,
  unwinding: 0.45,
  sounding: 0.3,
  exporting: 0.3,
};

export function publishGenome(state: GenomeState) {
  document.documentElement.dataset.genome = state;
  if (SURGE[state] > 0) surgeField(SURGE[state]);
}

export function clearGenome() {
  delete document.documentElement.dataset.genome;
}

/**
 * Generador pseudoaleatorio con semilla: el mismo LCG que usan el genoma, el
 * núcleo y el acrónimo. Nada de `Math.random()`: en render es impuro (lo
 * rechaza el lint del React Compiler) y en una simulación impide probarla.
 *
 * Sin dependencias ni alias: se prueba con `node --test`.
 */
export function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

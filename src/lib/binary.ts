/**
 * Numeración binaria de EVA.
 *
 * Los identificadores se convierten de verdad: nada de escribir «01» a mano ni
 * de anteponer ceros a un decimal. El ancho es fijo por serie —los bits que
 * necesita su índice mayor— para que una lista se lea como un registro y no
 * como números sueltos. Las medidas (porcentajes, recuentos, milisegundos)
 * siguen en decimal: son magnitudes, no nombres.
 *
 * Sin dependencias ni alias: este módulo se prueba con `node --test`.
 */

/** Ancho mínimo: «01» se lee como un código; «1», como una cantidad. */
const MIN_WIDTH = 2;

/** Bits que hacen falta para escribir `max`, el índice mayor de una serie. */
export function bitsFor(max: number): number {
  if (!Number.isInteger(max) || max < 0) throw new RangeError(`bitsFor: serie no válida (${max})`);
  return Math.max(MIN_WIDTH, max.toString(2).length);
}

/** `n` en binario, con ceros a la izquierda hasta `width`. */
export function bin(n: number, width: number = MIN_WIDTH): string {
  if (!Number.isInteger(n) || n < 0) throw new RangeError(`bin: índice no válido (${n})`);
  return n.toString(2).padStart(width, '0');
}

/**
 * Ruta jerárquica: `[1, 2]` → «01.10». El punto separa niveles, no decimales:
 * «01.10» es Entidad → segunda subsección.
 */
export function binPath(indices: readonly number[], width: number = MIN_WIDTH): string {
  if (indices.length === 0) throw new RangeError('binPath: ruta vacía');
  return indices.map((index) => bin(index, width)).join('.');
}

/** Un código binario bien formado: grupos de ceros y unos separados por puntos. */
export function isBinaryCode(value: string): boolean {
  return /^[01]+(\.[01]+)*$/.test(value);
}

/** «2 de 3», para quien no ve los bits: lo que leen los lectores de pantalla. */
export function ordinalLabel(index: number, total: number): string {
  return `${index} de ${total}`;
}

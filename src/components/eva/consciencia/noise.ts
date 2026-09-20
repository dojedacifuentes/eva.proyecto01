/**
 * Ruido de valor en tres dimensiones para el campo de flujo de la Consciencia.
 *
 * Es la variante barata: cada esquina de la celda entera se hashea a un valor
 * en [-1, 1], se interpola trilinealmente con una curva quíntica (derivada
 * nula en los extremos, sin cortes visibles) y `fbm` suma unas pocas octavas.
 * Se evalúa por partícula y fotograma, así que todo es aritmética entera y
 * multiplicaciones; nada de tablas ni de `Math.random`.
 *
 * Sin dependencias ni alias: se prueba con `node --test`.
 */

/** Entero pseudoaleatorio de tres coordenadas enteras y una semilla, en [0, 1). */
export function hash3(ix: number, iy: number, iz: number, seed = 0): number {
  let h = Math.imul(ix | 0, 0x9e3779b1) ^ (seed | 0);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h ^= Math.imul(iy | 0, 0xc2b2ae35);
  h = Math.imul(h ^ (h >>> 13), 0x27d4eb2f);
  h ^= Math.imul(iz | 0, 0x165667b1);
  h = Math.imul(h ^ (h >>> 16), 0x9e3779b1);
  h = (h ^ (h >>> 15)) >>> 0;
  return h / 4294967296;
}

/** Curva quíntica de Perlin: suaviza la interpolación sin discontinuidades en la derivada. */
function fade(t: number) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/**
 * Ruido de valor en [-1, 1]: interpolación trilineal suavizada de las ocho
 * esquinas hasheadas de la celda que contiene el punto.
 */
export function valueNoise3(x: number, y: number, z: number, seed = 0): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const z0 = Math.floor(z);
  const tx = fade(x - x0);
  const ty = fade(y - y0);
  const tz = fade(z - z0);
  const x1 = x0 + 1;
  const y1 = y0 + 1;
  const z1 = z0 + 1;

  const corner = (ix: number, iy: number, iz: number) => hash3(ix, iy, iz, seed) * 2 - 1;
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  const c00 = lerp(corner(x0, y0, z0), corner(x1, y0, z0), tx);
  const c10 = lerp(corner(x0, y1, z0), corner(x1, y1, z0), tx);
  const c01 = lerp(corner(x0, y0, z1), corner(x1, y0, z1), tx);
  const c11 = lerp(corner(x0, y1, z1), corner(x1, y1, z1), tx);
  return lerp(lerp(c00, c10, ty), lerp(c01, c11, ty), tz);
}

/**
 * Movimiento browniano fraccionario: `octaves` capas de ruido de valor, cada
 * una al doble de frecuencia y la mitad de amplitud, normalizadas a [-1, 1].
 */
export function fbm(x: number, y: number, z: number, octaves = 3, seed = 0): number {
  let total = 0;
  let amplitude = 1;
  let weight = 0;
  let frequency = 1;
  for (let octave = 0; octave < octaves; octave += 1) {
    total += valueNoise3(x * frequency, y * frequency, z * frequency, seed + octave * 101) * amplitude;
    weight += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  return weight > 0 ? total / weight : 0;
}

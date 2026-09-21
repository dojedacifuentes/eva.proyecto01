/**
 * EVA // NEURAL CORE — datos.
 *
 * Forma del cerebro, neuronas, regiones y sinapsis. Todo sale de funciones
 * deterministas con semilla fija: el núcleo es idéntico en cada apertura y en
 * cada fotograma. Aquí no hay three.js ni React, sólo números; la geometría y
 * la simulación viven en los componentes de la escena.
 *
 * Convención de ejes (unidades de cerebro, antes de escalar la escena):
 * +x lateral derecho · +y arriba · +z frente. El origen es el centro del cerebro.
 */

import type { BrainZone } from '@/content/neuroscan';

export type Tier = 'low' | 'mid' | 'high';

export interface Detail {
  tier: Tier;
  /** Neuronas repartidas por los dos hemisferios; los ocho nodos-región van aparte. */
  neurons: number;
  /** Vecinas con las que se conecta cada neurona. */
  links: number;
  /** Impulsos simultáneos como máximo. */
  sparks: number;
  /** Segmentos de la corteza (anchura, altura). */
  shell: [number, number];
  /** Intensidad del bloom; 0 apaga el postprocesado. */
  bloom: number;
  dpr: [number, number];
  multisampling: number;
}

/** Nivel de detalle por capacidad del dispositivo. Menos de todo en móvil. */
export const DETAIL: Record<Tier, Detail> = {
  low: {
    tier: 'low',
    neurons: 240,
    links: 2,
    sparks: 24,
    shell: [56, 40],
    bloom: 0,
    dpr: [1, 1.2],
    multisampling: 0,
  },
  mid: {
    tier: 'mid',
    neurons: 420,
    links: 3,
    sparks: 40,
    shell: [80, 56],
    bloom: 0.42,
    dpr: [1, 1.4],
    multisampling: 0,
  },
  high: {
    tier: 'high',
    neurons: 720,
    links: 3,
    sparks: 64,
    shell: [112, 80],
    bloom: 0.62,
    dpr: [1, 1.75],
    multisampling: 4,
  },
};

/*
 * Qué nivel toca no se decide aquí: lo dice `lib/quality` (`useQuality`), que
 * arranca con lo que el dispositivo declara y baja un escalón cuando el
 * fotograma medido es lento. Hasta la v9.3 este archivo tenía su propio
 * detector con la misma regla: dos fuentes de la misma verdad.
 */

let coarse: boolean | null = null;

/**
 * El puntero principal es un dedo. Ahí el zoom de la escena se apaga: el
 * pellizco es del navegador, y quitárselo deja al visitante sin ampliar la página.
 * Una sola vez por página, como el nivel de detalle. Sólo en cliente.
 */
export function coarsePointer(): boolean {
  coarse ??= window.matchMedia('(pointer: coarse)').matches;
  return coarse;
}

/** Hay WebGL de verdad, no sólo la API: se pide un contexto y se suelta al instante. */
export function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

let webgl: boolean | null = null;

/** `detectWebGL`, una sola vez por página. */
export function webglSupported(): boolean {
  webgl ??= detectWebGL();
  return webgl;
}

/** Semilla del núcleo. (0xeva01 no es hexadecimal: la v no es dígito.) */
export const SEED = 0xe7a01;

/**
 * Generador pseudoaleatorio con semilla, el mismo LCG que usa el genoma. Nada
 * de Math.random(): la red debe salir idéntica en cada render.
 */
export function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/* ───────────── Forma ───────────── */

/** Media cisura: cuánto se separa cada hemisferio del plano medio. */
export const GAP = 0.12;
/** Cuánto se hunden los surcos respecto al radio de la corteza. */
export const FOLD_DEPTH = 0.055;
/** Margen entre la neurona más externa y la corteza. */
const CORTEX_MARGIN = 0.05;
/** Radio de influencia de un nodo-región: más lejos, la neurona no pertenece a nadie. */
const REGION_REACH = 0.4;

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function smooth(t: number) {
  return t * t * (3 - 2 * t);
}

/** Hash de tres enteros a [0, 1). Determinista y sin estado. */
function hash(x: number, y: number, z: number): number {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(z, 1103515245);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** Ruido de valor trilineal. Suave, barato y determinista. */
function noise(x: number, y: number, z: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const iz = Math.floor(z);
  const sx = smooth(x - ix);
  const sy = smooth(y - iy);
  const sz = smooth(z - iz);
  const x00 = lerp(hash(ix, iy, iz), hash(ix + 1, iy, iz), sx);
  const x10 = lerp(hash(ix, iy + 1, iz), hash(ix + 1, iy + 1, iz), sx);
  const x01 = lerp(hash(ix, iy, iz + 1), hash(ix + 1, iy, iz + 1), sx);
  const x11 = lerp(hash(ix, iy + 1, iz + 1), hash(ix + 1, iy + 1, iz + 1), sx);
  return lerp(lerp(x00, x10, sy), lerp(x01, x11, sy), sz);
}

/**
 * Surcos de la corteza: 1 en el fondo del surco, 0 sobre la circunvolución.
 * Son las isolíneas de un ruido con el dominio retorcido: por eso serpentean
 * y se cierran sobre sí mismas como circunvoluciones, y no como rayas.
 * Se evalúa sobre la esfera unidad, antes de deformarla.
 */
export function fold(x: number, y: number, z: number): number {
  const wx = x + 0.26 * Math.sin(y * 4.3 + z * 2.1);
  const wy = y + 0.26 * Math.sin(z * 3.9 + x * 2.7);
  const wz = z + 0.26 * Math.sin(x * 4.1 + y * 3.3);
  const n =
    noise(wx * 4.4 + 17.3, wy * 4.4 + 5.9, wz * 4.4 + 9.1) * 0.7 +
    noise(wx * 8.8 + 3.7, wy * 8.8 + 11.2, wz * 8.8 + 6.4) * 0.3;
  const ridge = 1 - Math.abs(2 * n - 1);
  return ridge * ridge * ridge;
}

/**
 * Un hemisferio: lleva un punto de la bola unidad (lateral +x, arriba +y,
 * frente +z) a su sitio en el volumen cerebral, ya separado de la cisura.
 * Es una deformación continua de la esfera, así que sirve igual para la
 * corteza que para muestrear neuronas dentro. El izquierdo es su espejo.
 */
export function hemisphere(x: number, y: number, z: number, out: Vec3): Vec3 {
  const front = Math.max(0, z);
  const back = Math.max(0, -z);
  // Óvalo visto desde arriba: se estrecha hacia el polo frontal, menos hacia el occipital.
  const taper = 1 - 0.22 * front * front - 0.14 * back * back;
  // La cara medial es casi plana: es la pared de la cisura. Arriba queda una
  // arista, como en el margen superior de un hemisferio real.
  let X = x >= 0 ? 0.62 * x * taper : -0.1 * (1 - (1 + x) * (1 + x));
  // Bóveda alta delante, que cae hacia atrás; la base es más plana que la bóveda.
  let Y = 0.8 * y * (1 - 0.04 * front - 0.2 * back * back);
  if (Y < 0) Y *= 0.7;
  // Lóbulo temporal: un bulto bajo y lateral en el tercio anterior.
  const temporal =
    Math.exp(-(((y + 0.45) * (y + 0.45)) / 0.08 + ((z - 0.12) * (z - 0.12)) / 0.3)) *
    Math.max(0, x);
  X += 0.16 * temporal;
  Y -= 0.06 * temporal;
  out.x = X + GAP;
  out.y = Y;
  out.z = z;
  return out;
}

/* ───────────── Regiones ───────────── */

interface HubSeed {
  side: 1 | -1;
  x: number;
  y: number;
  z: number;
}

/**
 * Del mapa plano al volumen: la x del SVG (0–400) reparte los hemisferios,
 * la y (0–300) va de la frente a la nuca. La altura se fija por zona con un
 * paso áureo, para que los nodos no queden todos en el mismo plano.
 */
function hubSeed(zone: BrainZone): HubSeed {
  const lateral = (zone.x / 400 - 0.5) * 2;
  const side: 1 | -1 = lateral < 0 ? -1 : 1;
  let x = 0.22 + 0.6 * Math.min(1, Math.abs(lateral) * 1.2);
  let z = (0.47 - zone.y / 300) * 2.6;
  const planar = Math.hypot(x, z);
  if (planar > 0.86) {
    x *= 0.86 / planar;
    z *= 0.86 / planar;
  }
  const spread = (zone.x * 0.618) % 1;
  const y = Math.sqrt(Math.max(0, 1 - x * x - z * z)) * (0.35 + 0.3 * spread);
  return { side, x, y, z };
}

/* ───────────── Red ───────────── */

export interface BrainData {
  /** Neuronas más nodos-región; los nodos-región son los últimos índices. */
  count: number;
  positions: Float32Array;
  /** Región de cada nodo (índice en `zones`) o 255 si no pertenece a ninguna. */
  region: Uint8Array;
  /** Hemisferio de cada nodo: 1 derecho, -1 izquierdo. */
  side: Int8Array;
  /** Índice del nodo que representa a cada región. */
  hubNode: number[];
  /** Pares de nodos, aplanados. */
  edges: Uint32Array;
  edgeCount: number;
  edgeLength: Float32Array;
  /** Aristas de cada nodo, en formato comprimido: `adjacency[offset[i] … offset[i + 1])`. */
  adjacencyOffset: Uint32Array;
  adjacency: Uint32Array;
}

/**
 * Construye la red completa. Determinista: mismo detalle y mismas zonas dan
 * exactamente el mismo cerebro. Se llama una vez por nivel de detalle.
 */
export function buildBrain(detail: Detail, zones: readonly BrainZone[]): BrainData {
  const random = seeded(SEED);
  const hubs = zones.map(hubSeed);
  const count = detail.neurons + hubs.length;
  const positions = new Float32Array(count * 3);
  const region = new Uint8Array(count).fill(255);
  const side = new Int8Array(count);
  const point: Vec3 = { x: 0, y: 0, z: 0 };

  const place = (index: number, x: number, y: number, z: number, hemi: 1 | -1) => {
    hemisphere(x, y, z, point);
    positions[index * 3] = point.x * hemi;
    positions[index * 3 + 1] = point.y;
    positions[index * 3 + 2] = point.z;
    side[index] = hemi;
  };

  /* Dirección uniforme sobre la esfera. */
  const direction = () => {
    const u = random() * 2 - 1;
    const angle = random() * Math.PI * 2;
    const ring = Math.sqrt(1 - u * u);
    return { x: Math.cos(angle) * ring, y: u, z: Math.sin(angle) * ring };
  };

  // Un quinto de las neuronas se apiña alrededor de los nodos-región; el
  // resto se reparte por el volumen, con preferencia por la corteza.
  const clustered = Math.floor(detail.neurons * 0.2);
  const scattered = detail.neurons - clustered;
  let index = 0;

  for (let i = 0; i < scattered; i++) {
    const hemi: 1 | -1 = i % 2 === 0 ? 1 : -1;
    const dir = direction();
    const reach = 1 - FOLD_DEPTH * fold(dir.x, dir.y, dir.z) - CORTEX_MARGIN;
    const radius = Math.min(reach, 0.3 + 0.7 * Math.pow(random(), 0.42));
    place(index++, dir.x * radius, dir.y * radius, dir.z * radius, hemi);
  }

  for (let i = 0; i < clustered; i++) {
    const hub = hubs[i % hubs.length];
    const dir = direction();
    const radius = 0.04 + 0.16 * Math.sqrt(random());
    let x = hub.x + dir.x * radius;
    let y = hub.y + dir.y * radius;
    let z = hub.z + dir.z * radius;
    const length = Math.hypot(x, y, z);
    if (length > 0.92) {
      x *= 0.92 / length;
      y *= 0.92 / length;
      z *= 0.92 / length;
    }
    place(index++, x, y, z, hub.side);
  }

  const hubNode = hubs.map((hub, i) => {
    const node = detail.neurons + i;
    place(node, hub.x, hub.y, hub.z, hub.side);
    return node;
  });

  /* Cada neurona pertenece al nodo-región más cercano de su hemisferio, si lo tiene cerca. */
  for (let i = 0; i < detail.neurons; i++) {
    let best = 255;
    let bestDistance = REGION_REACH;
    for (let r = 0; r < hubNode.length; r++) {
      if (hubs[r].side !== side[i]) continue;
      const h = hubNode[r];
      const distance = Math.hypot(
        positions[i * 3] - positions[h * 3],
        positions[i * 3 + 1] - positions[h * 3 + 1],
        positions[i * 3 + 2] - positions[h * 3 + 2],
      );
      if (distance < bestDistance) {
        bestDistance = distance;
        best = r;
      }
    }
    region[i] = best;
  }
  hubNode.forEach((node, r) => {
    region[node] = r;
  });

  /* ── Sinapsis: vecinas cercanas, sin cruzar la cisura salvo los nodos-región ── */
  const keys = new Set<number>();
  const pairs: number[] = [];
  const link = (a: number, b: number) => {
    if (a === b) return;
    const key = a < b ? a * count + b : b * count + a;
    if (keys.has(key)) return;
    keys.add(key);
    pairs.push(a, b);
  };
  const distance = (a: number, b: number) =>
    Math.hypot(
      positions[a * 3] - positions[b * 3],
      positions[a * 3 + 1] - positions[b * 3 + 1],
      positions[a * 3 + 2] - positions[b * 3 + 2],
    );
  const nearest = (node: number, k: number, filter: (other: number) => boolean) => {
    const bestNodes: number[] = [];
    const bestDistances: number[] = [];
    for (let j = 0; j < count; j++) {
      if (j === node || !filter(j)) continue;
      const d = distance(node, j);
      let slot = bestDistances.length;
      while (slot > 0 && bestDistances[slot - 1] > d) slot--;
      if (slot >= k) continue;
      bestNodes.splice(slot, 0, j);
      bestDistances.splice(slot, 0, d);
      if (bestNodes.length > k) {
        bestNodes.pop();
        bestDistances.pop();
      }
    }
    return bestNodes;
  };

  for (let i = 0; i < count; i++) {
    for (const j of nearest(i, detail.links, (other) => side[other] === side[i])) link(i, j);
  }
  // Cada nodo-región se ata a su vecindario, a los dos nodos-región más
  // próximos de su lado y al más cercano del otro: el cuerpo calloso.
  hubNode.forEach((node, r) => {
    for (const j of nearest(node, 10, (other) => region[other] === r)) link(node, j);
    for (const j of nearest(node, 2, (other) => other >= detail.neurons && side[other] === side[node]))
      link(node, j);
    for (const j of nearest(node, 1, (other) => other >= detail.neurons && side[other] !== side[node]))
      link(node, j);
  });

  const edgeCount = pairs.length / 2;
  const edges = Uint32Array.from(pairs);
  const edgeLength = new Float32Array(edgeCount);
  const degree = new Uint32Array(count);
  for (let e = 0; e < edgeCount; e++) {
    edgeLength[e] = distance(edges[e * 2], edges[e * 2 + 1]);
    degree[edges[e * 2]]++;
    degree[edges[e * 2 + 1]]++;
  }
  const adjacencyOffset = new Uint32Array(count + 1);
  for (let i = 0; i < count; i++) adjacencyOffset[i + 1] = adjacencyOffset[i] + degree[i];
  const adjacency = new Uint32Array(adjacencyOffset[count]);
  const cursor = Uint32Array.from(adjacencyOffset.subarray(0, count));
  for (let e = 0; e < edgeCount; e++) {
    adjacency[cursor[edges[e * 2]]++] = e;
    adjacency[cursor[edges[e * 2 + 1]]++] = e;
  }

  return {
    count,
    positions,
    region,
    side,
    hubNode,
    edges,
    edgeCount,
    edgeLength,
    adjacencyOffset,
    adjacency,
  };
}

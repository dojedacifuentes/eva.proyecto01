/*
 * Particle Life — núcleo adaptado para EVA.
 *
 * Basado en https://github.com/hunar4321/particle-life, consultado en el
 * commit 256278714c4f6a1ce900d24faafcc101769c54c2.
 * Copyright (c) 2022 Hunar Ahmad.
 *
 * MIT License
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 *
 * Conserva del original la idea central: grupos de partículas cuya matriz de
 * reglas ejerce atracción o repulsión dentro de un radio, velocidad amortiguada
 * y paredes reflectantes. EVA añade semilla, partición espacial, huellas,
 * perturbaciones y objetivos programados para la figura del ojo.
 *
 * v8.2 amplía el motor sin salir de esa idea: reglas y radio variables (Caos y
 * Azar los aleatorizan con semilla), cinco figuras (`figures.ts`), gravedad hacia
 * abajo o hacia el centro con giro, viscosidad como amortiguación y un campo de
 * flujo fractal (`noise.ts`). La simulación avanza a paso fijo de 1/60 s con un
 * acumulador: cada llamada suma su tiempo, simula los fotogramas enteros que
 * caben y guarda el resto, así el resultado no depende de la cadencia.
 * Puro: sin DOM, sin `window`, sin `Math.random`; se prueba con `node --test`.
 */

import { seeded } from '@/lib/random';
import type { ConsciousnessStateId, FigureId, GravityId, RegimeId, ViscosityId } from '@/lib/types';
import { createFigureTargets } from './figures';
import { fbm } from './noise';

export const INITIAL_SEED = 0xe7a01;
export const DEFAULT_COUNT = 260;
export const MOBILE_COUNT = 160;
export const MAX_GROUPS = 5;
const MIN_GROUPS = 3;

export const FIGURES: readonly FigureId[] = ['eye', 'spiral', 'labyrinth', 'double', 'name'];
export const GRAVITIES: readonly GravityId[] = ['none', 'down', 'center'];
export const VISCOSITIES: readonly ViscosityId[] = ['fluid', 'medium', 'dense'];

/** Radio de interacción por defecto y el intervalo que puede tomar al aleatorizar. */
const DEFAULT_RADIUS = 0.125;
const MIN_RADIUS = 0.09;
const MAX_RADIUS = 0.16;
const MIN_DISTANCE = 0.014;

/** Amortiguación por fotograma de 1/60 s según la viscosidad. */
const DAMPING: Record<ViscosityId, number> = { fluid: 0.975, medium: 0.91, dense: 0.8 };
/** Empuje constante hacia abajo (y crece hacia abajo, como en el lienzo), por fotograma. */
const GRAVITY_DOWN = 0.00022;
/** Atracción al centro por unidad de distancia y por fotograma; el giro es una fracción de ella. */
const GRAVITY_CENTER = 0.0006;
const GRAVITY_SPIN = 0.4;
/** Dentro de este radio la atracción radial se apaga: el colapso deja un disco que gira, no un grumo. */
const GRAVITY_CORE = 0.1;
/** Fuerza del campo de flujo, por fotograma. */
const NOISE_FORCE = 0.0012;
const NOISE_SCALE = 3;
const NOISE_DRIFT = 0.15;

/** Duración de un fotograma simulado y tope de tiempo por llamada (trampa 25 del HANDOFF). */
const FRAME = 1 / 60;
const MAX_STEP = 0.12;
/** Holgura para que sesenta sumas de 1/60 cuenten como un segundo entero. */
const FRAME_EPSILON = 1e-9;

/** Positivo repele; negativo atrae, igual que en la implementación estudiada. */
const DEFAULT_RULES: readonly (readonly number[])[] = [
  [0.58, -0.72, 0.18],
  [-0.48, 0.42, -0.64],
  [0.14, -0.56, 0.5],
];

export interface Particle {
  x: number;
  y: number;
  previousX: number;
  previousY: number;
  vx: number;
  vy: number;
  group: number;
  target: number;
}

export interface TracePoint {
  x: number;
  y: number;
  life: number;
  strength: number;
}

export interface TargetPoint {
  x: number;
  y: number;
}

export interface ParticleWorld {
  particles: Particle[];
  traces: TracePoint[];
  targets: TargetPoint[];
  interactions: number;
  composition: number;
  compositionTarget: number;
  gathered: boolean;
  releasedAfterGather: boolean;
  seed: number;
  /** Matriz groupCount × groupCount en [-1, 1]: positivo repele, negativo atrae. */
  rules: number[][];
  groupCount: number;
  /** Radio de interacción entre partículas, en [0.09, 0.16]. */
  radius: number;
  figure: FigureId;
  gravity: GravityId;
  viscosity: ViscosityId;
  noise: boolean;
  /** Veces que se aleatorizaron las reglas (Caos). */
  chaos: number;
  /** Veces que se aleatorizó todo el régimen (Azar). */
  randoms: number;
  /** Segundos simulados. */
  time: number;
  /** Velocidad media del último paso, para el HUD. */
  energy: number;
  /** Tiempo recibido y aún no simulado (menos de un fotograma). Interno. */
  accumulator: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function cloneRules(rules: readonly (readonly number[])[]): number[][] {
  return rules.map((row) => row.slice());
}

export function createParticleWorld(seed = INITIAL_SEED, count = DEFAULT_COUNT): ParticleWorld {
  const random = seeded(seed);
  const particles = Array.from({ length: count }, (_, index): Particle => {
    const x = 0.06 + random() * 0.88;
    const y = 0.08 + random() * 0.84;
    return {
      x,
      y,
      previousX: x,
      previousY: y,
      vx: (random() - 0.5) * 0.0016,
      vy: (random() - 0.5) * 0.0016,
      group: index % DEFAULT_RULES.length,
      target: index,
    };
  });

  return {
    particles,
    traces: [],
    targets: createFigureTargets('eye', count, seed),
    interactions: 0,
    composition: 0,
    compositionTarget: 0,
    gathered: false,
    releasedAfterGather: false,
    seed,
    rules: cloneRules(DEFAULT_RULES),
    groupCount: DEFAULT_RULES.length,
    radius: DEFAULT_RADIUS,
    figure: 'eye',
    gravity: 'none',
    viscosity: 'medium',
    noise: false,
    chaos: 0,
    randoms: 0,
    time: 0,
    energy: 0,
    accumulator: 0,
  };
}

/** Vuelve al estado de creación: misma semilla, mismo número de partículas, todo lo demás a cero. */
export function resetParticleWorld(world: ParticleWorld) {
  Object.assign(world, createParticleWorld(world.seed, world.particles.length));
}

/** Una interacción modifica velocidades reales y deja sólo una memoria efímera. */
export function perturbParticleWorld(world: ParticleWorld, x: number, y: number, strength = 1) {
  const px = clamp(x, 0.03, 0.97);
  const py = clamp(y, 0.04, 0.96);
  const radius = 0.22;

  for (const particle of world.particles) {
    const dx = particle.x - px;
    const dy = particle.y - py;
    const distance = Math.hypot(dx, dy) || 0.001;
    if (distance >= radius) continue;
    const impulse = (1 - distance / radius) * 0.009 * strength;
    particle.vx += (dx / distance) * impulse;
    particle.vy += (dy / distance) * impulse;
  }

  world.interactions += 1;
  world.traces.push({ x: px, y: py, life: 1, strength });
  if (world.traces.length > 8) world.traces.splice(0, world.traces.length - 8);
}

export function gatherParticleWorld(world: ParticleWorld) {
  world.compositionTarget = 1;
  world.gathered = true;
}

export function releaseParticleWorld(world: ParticleWorld) {
  world.compositionTarget = 0;
  if (world.gathered) world.releasedAfterGather = true;
}

/* ── Figuras ─────────────────────────────────────────────────────────────── */

/** Reconstruye los objetivos para la figura; los índices `particle.target` siguen valiendo. */
export function setFigure(world: ParticleWorld, figure: FigureId) {
  world.figure = figure;
  world.targets = createFigureTargets(figure, world.particles.length, world.seed);
}

/** Pasa a la figura siguiente en el orden de `FIGURES` y la aplica. */
export function nextFigure(world: ParticleWorld): FigureId {
  const at = FIGURES.indexOf(world.figure);
  const figure = FIGURES[(at + 1) % FIGURES.length];
  setFigure(world, figure);
  return figure;
}

/* ── Reglas y régimen ────────────────────────────────────────────────────── */

/**
 * Matriz nueva de reglas con un generador dado: groupCount en 3..5, radio en
 * [0.09, 0.16] y valores en [-1, 1] con, al menos, un par que atrae y otro que
 * repele. Reasigna los grupos por índice para que ninguno quede fuera de rango.
 */
function applyRandomRules(world: ParticleWorld, random: () => number) {
  const groupCount = MIN_GROUPS + Math.floor(random() * (MAX_GROUPS - MIN_GROUPS + 1));
  const radius = MIN_RADIUS + random() * (MAX_RADIUS - MIN_RADIUS);
  const rules = Array.from({ length: groupCount }, () =>
    Array.from({ length: groupCount }, () => random() * 2 - 1),
  );

  const flat = rules.flat();
  if (!flat.some((value) => value < 0)) {
    rules[Math.floor(random() * groupCount)][Math.floor(random() * groupCount)] = -(0.3 + random() * 0.7);
  }
  if (!flat.some((value) => value > 0)) {
    rules[Math.floor(random() * groupCount)][Math.floor(random() * groupCount)] = 0.3 + random() * 0.7;
  }

  world.groupCount = groupCount;
  world.radius = radius;
  world.rules = rules;
  world.particles.forEach((particle, index) => {
    particle.group = index % groupCount;
  });
}

/** Caos: reglas nuevas, deterministas por semilla y número de pulsaciones. */
export function randomizeRules(world: ParticleWorld) {
  world.chaos += 1;
  applyRandomRules(world, seeded(world.seed ^ (Math.imul(world.chaos, 0x9e3779b1) >>> 0)));
}

export function setGravity(world: ParticleWorld, gravity: GravityId) {
  world.gravity = gravity;
}

export function setViscosity(world: ParticleWorld, viscosity: ViscosityId) {
  world.viscosity = viscosity;
}

export function setNoise(world: ParticleWorld, on: boolean) {
  world.noise = on;
}

export function cycleGravity(world: ParticleWorld): GravityId {
  const gravity = GRAVITIES[(GRAVITIES.indexOf(world.gravity) + 1) % GRAVITIES.length];
  world.gravity = gravity;
  return gravity;
}

export function cycleViscosity(world: ParticleWorld): ViscosityId {
  const viscosity = VISCOSITIES[(VISCOSITIES.indexOf(world.viscosity) + 1) % VISCOSITIES.length];
  world.viscosity = viscosity;
  return viscosity;
}

export function toggleNoise(world: ParticleWorld): boolean {
  world.noise = !world.noise;
  return world.noise;
}

/** Azar: reglas nuevas más gravedad, viscosidad y ruido al azar. Nunca cambia la figura. */
export function randomizeWorld(world: ParticleWorld) {
  world.randoms += 1;
  const random = seeded(world.seed ^ (Math.imul(world.randoms, 0x85ebca6b) >>> 0));
  world.chaos += 1;
  applyRandomRules(world, random);
  world.gravity = GRAVITIES[Math.floor(random() * GRAVITIES.length)];
  world.viscosity = VISCOSITIES[Math.floor(random() * VISCOSITIES.length)];
  world.noise = random() < 0.5;
}

/* ── Lectura del estado ──────────────────────────────────────────────────── */

export function narrativeState(world: ParticleWorld): ConsciousnessStateId {
  if (world.gathered) return 'self';
  if (world.interactions >= 3) return 'trace';
  if (world.interactions >= 1) return 'relation';
  return 'dispersion';
}

/** Régimen que se le impone al campo, por precedencia: colapso, caída, deriva, caos, estable. */
export function regimeOf(world: ParticleWorld): RegimeId {
  if (world.gravity === 'center') return 'collapse';
  if (world.gravity === 'down') return 'fall';
  if (world.noise) return 'drift';
  if (world.chaos > 0) return 'chaos';
  return 'stable';
}

export function meanTargetDistance(world: ParticleWorld) {
  if (world.particles.length === 0) return 0;
  const total = world.particles.reduce((sum, particle) => {
    const target = world.targets[particle.target];
    return sum + Math.hypot(target.x - particle.x, target.y - particle.y);
  }, 0);
  return total / world.particles.length;
}

/* ── Simulación ──────────────────────────────────────────────────────────── */

/**
 * Un fotograma de 1/60 s. La cuadrícula se guarda como listas enlazadas en
 * arrays planos (`head` por celda, `next` por partícula): sin claves de texto
 * ni objetos por celda. La celda mide lo que el radio, así el vecindario 3×3
 * cubre todas las parejas que pueden interactuar.
 */
function frame(world: ParticleWorld) {
  const { particles, rules, radius, targets, traces } = world;
  const count = particles.length;
  const cell = radius;
  const columns = Math.ceil(1 / cell) + 2;
  const rows = columns;
  const head = new Int32Array(columns * rows).fill(-1);
  const next = new Int32Array(count);

  for (let index = 0; index < count; index += 1) {
    const particle = particles[index];
    const gx = clamp(Math.floor(particle.x / cell) + 1, 0, columns - 1);
    const gy = clamp(Math.floor(particle.y / cell) + 1, 0, rows - 1);
    const at = gy * columns + gx;
    next[index] = head[at];
    head[at] = index;
  }

  const compositionStep = 0.012;
  if (world.composition < world.compositionTarget) {
    world.composition = Math.min(world.compositionTarget, world.composition + compositionStep);
  } else if (world.composition > world.compositionTarget) {
    world.composition = Math.max(world.compositionTarget, world.composition - compositionStep * 0.72);
  }

  const damp = DAMPING[world.viscosity];
  const gravity = world.gravity;
  const noisy = world.noise;
  const noiseTime = world.time * NOISE_DRIFT;
  let speed = 0;

  for (let index = 0; index < count; index += 1) {
    const particle = particles[index];
    const ruleRow = rules[particle.group];
    let fx = 0;
    let fy = 0;
    const gx = clamp(Math.floor(particle.x / cell) + 1, 0, columns - 1);
    const gy = clamp(Math.floor(particle.y / cell) + 1, 0, rows - 1);

    for (let oy = -1; oy <= 1; oy += 1) {
      const cy = gy + oy;
      if (cy < 0 || cy >= rows) continue;
      for (let ox = -1; ox <= 1; ox += 1) {
        const cx = gx + ox;
        if (cx < 0 || cx >= columns) continue;
        for (let other = head[cy * columns + cx]; other !== -1; other = next[other]) {
          if (other === index) continue;
          const neighbor = particles[other];
          const dx = particle.x - neighbor.x;
          const dy = particle.y - neighbor.y;
          const distance = Math.hypot(dx, dy);
          if (distance <= 0 || distance >= radius) continue;

          const proximity = 1 - distance / radius;
          const crowding = distance < MIN_DISTANCE ? (1 - distance / MIN_DISTANCE) * 1.5 : 0;
          const force = ruleRow[neighbor.group] * proximity + crowding;
          fx += (dx / distance) * force;
          fy += (dy / distance) * force;
        }
      }
    }

    for (const trace of traces) {
      const dx = particle.x - trace.x;
      const dy = particle.y - trace.y;
      const distance = Math.hypot(dx, dy) || 0.001;
      if (distance > 0.24) continue;
      const afterimage = (1 - distance / 0.24) * trace.life * trace.strength;
      fx += (dx / distance) * afterimage * 0.7;
      fy += (dy / distance) * afterimage * 0.7;
    }

    if (world.composition > 0.001) {
      const target = targets[particle.target];
      fx += (target.x - particle.x) * 32 * world.composition;
      fy += (target.y - particle.y) * 32 * world.composition;
    }

    let vx = particle.vx * damp + fx * 0.00034;
    let vy = particle.vy * damp + fy * 0.00034;

    if (gravity === 'down') {
      vy += GRAVITY_DOWN;
    } else if (gravity === 'center') {
      // Radial hacia el centro más un giro: colapsa en órbita, no en un grumo.
      const dx = 0.5 - particle.x;
      const dy = 0.5 - particle.y;
      const distance = Math.hypot(dx, dy);
      const pull = distance > GRAVITY_CORE ? (distance - GRAVITY_CORE) / distance : 0;
      vx += (dx * pull - dy * GRAVITY_SPIN) * GRAVITY_CENTER;
      vy += (dy * pull + dx * GRAVITY_SPIN) * GRAVITY_CENTER;
    }

    if (noisy) {
      const angle = fbm(particle.x * NOISE_SCALE, particle.y * NOISE_SCALE, noiseTime) * Math.PI * 4;
      vx += Math.cos(angle) * NOISE_FORCE;
      vy += Math.sin(angle) * NOISE_FORCE;
    }

    particle.vx = vx;
    particle.vy = vy;
    speed += Math.hypot(vx, vy);
  }

  for (const particle of particles) {
    particle.x += particle.vx;
    particle.y += particle.vy;

    if (particle.x < 0.015) {
      particle.x = 0.03 - particle.x;
      particle.vx *= -0.72;
    } else if (particle.x > 0.985) {
      particle.x = 1.97 - particle.x;
      particle.vx *= -0.72;
    }
    if (particle.y < 0.025) {
      particle.y = 0.05 - particle.y;
      particle.vy *= -0.72;
    } else if (particle.y > 0.975) {
      particle.y = 1.95 - particle.y;
      particle.vy *= -0.72;
    }
  }

  for (const trace of traces) trace.life = Math.max(0, trace.life - 0.0045);
  world.traces = traces.filter((trace) => trace.life > 0);
  world.energy = count > 0 ? speed / count : 0;
  world.time += FRAME;
}

/**
 * Paso independiente del render. `seconds` se recorta a `MAX_STEP` (a menos de
 * ~8 fotogramas por segundo la simulación va a cámara lenta antes que a saltos)
 * y se suma al acumulador; se simulan los fotogramas enteros de 1/60 s que
 * caben y el resto espera a la llamada siguiente. A 30, 45 o 60 fotogramas por
 * segundo se ejecuta la misma secuencia de fotogramas, así que el resultado es
 * el mismo bit a bit. `previousX/Y` guardan la posición al empezar el paso
 * entero, para las estelas; si no cabe ningún fotograma no cambian.
 */
export function stepParticleWorld(world: ParticleWorld, seconds: number) {
  if (!(seconds > 0)) return;
  world.accumulator += Math.min(seconds, MAX_STEP);
  if (world.accumulator < FRAME - FRAME_EPSILON) return;

  for (const particle of world.particles) {
    particle.previousX = particle.x;
    particle.previousY = particle.y;
  }
  while (world.accumulator >= FRAME - FRAME_EPSILON) {
    world.accumulator -= FRAME;
    frame(world);
  }
  if (world.accumulator < 0) world.accumulator = 0;
}

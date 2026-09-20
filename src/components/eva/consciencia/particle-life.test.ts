import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  DEFAULT_COUNT,
  FIGURES,
  GRAVITIES,
  INITIAL_SEED,
  MAX_GROUPS,
  MOBILE_COUNT,
  VISCOSITIES,
  createParticleWorld,
  cycleGravity,
  cycleViscosity,
  gatherParticleWorld,
  meanTargetDistance,
  narrativeState,
  nextFigure,
  perturbParticleWorld,
  randomizeRules,
  randomizeWorld,
  regimeOf,
  releaseParticleWorld,
  resetParticleWorld,
  setFigure,
  setGravity,
  setNoise,
  setViscosity,
  stepParticleWorld,
  toggleNoise,
  type ParticleWorld,
} from './particle-life';

function run(world: ParticleWorld, frames: number, dt = 1 / 60) {
  for (let frame = 0; frame < frames; frame += 1) stepParticleWorld(world, dt);
}

function meanY(world: ParticleWorld) {
  return world.particles.reduce((sum, particle) => sum + particle.y, 0) / world.particles.length;
}

function meanCentreDistance(world: ParticleWorld) {
  return (
    world.particles.reduce((sum, particle) => sum + Math.hypot(particle.x - 0.5, particle.y - 0.5), 0) /
    world.particles.length
  );
}

/** Distancia media entre partículas homólogas de dos mundos. */
function meanGap(a: ParticleWorld, b: ParticleWorld) {
  return (
    a.particles.reduce((sum, particle, index) => {
      const other = b.particles[index];
      return sum + Math.hypot(particle.x - other.x, particle.y - other.y);
    }, 0) / a.particles.length
  );
}

test('la misma semilla reconstruye el mismo campo', () => {
  const first = createParticleWorld(1234, 24);
  const second = createParticleWorld(1234, 24);
  assert.deepEqual(first.particles, second.particles);
  assert.deepEqual(first.targets, second.targets);
  assert.deepEqual(first, second);
});

test('el mundo nace con las constantes públicas y el régimen por defecto', () => {
  const world = createParticleWorld();
  assert.equal(world.seed, INITIAL_SEED);
  assert.equal(world.particles.length, DEFAULT_COUNT);
  assert.equal(world.targets.length, DEFAULT_COUNT);
  assert.equal(createParticleWorld(INITIAL_SEED, MOBILE_COUNT).particles.length, MOBILE_COUNT);
  assert.equal(world.groupCount, 3);
  assert.equal(world.rules.length, 3);
  assert.ok(world.rules.every((row) => row.length === 3));
  assert.equal(world.figure, 'eye');
  assert.equal(world.gravity, 'none');
  assert.equal(world.viscosity, 'medium');
  assert.equal(world.noise, false);
  assert.equal(world.chaos, 0);
  assert.equal(world.randoms, 0);
  assert.equal(world.time, 0);
  assert.equal(regimeOf(world), 'stable');
  assert.ok(world.particles.every((particle) => particle.group < world.groupCount));
});

test('las perturbaciones cambian la simulación y avanzan relación y huella', () => {
  const world = createParticleWorld(8, 30);
  const before = world.particles.map(({ vx, vy }) => [vx, vy]);

  perturbParticleWorld(world, 0.5, 0.5);
  assert.equal(narrativeState(world), 'relation');
  assert.equal(world.traces.length, 1);
  assert.notDeepEqual(
    world.particles.map(({ vx, vy }) => [vx, vy]),
    before,
  );

  perturbParticleWorld(world, 0.35, 0.42);
  perturbParticleWorld(world, 0.68, 0.61);
  assert.equal(narrativeState(world), 'trace');
  assert.equal(world.traces.length, 3);
});

test('reunir acerca el enjambre a los puntos del ojo y soltar conserva su historia', () => {
  const world = createParticleWorld(44, 90);
  const before = meanTargetDistance(world);
  gatherParticleWorld(world);
  run(world, 320);

  assert.equal(narrativeState(world), 'self');
  assert.ok(world.composition > 0.95);
  assert.ok(meanTargetDistance(world) < before * 0.55);

  releaseParticleWorld(world);
  run(world, 180);
  assert.equal(world.composition, 0);
  assert.equal(world.releasedAfterGather, true);
  assert.equal(narrativeState(world), 'self');

  gatherParticleWorld(world);
  stepParticleWorld(world, 1 / 60);
  assert.ok(world.composition > 0, 'se puede volver a reunir después de soltar');
});

test('reunir acerca el enjambre a cada figura, con cualquier número de partículas', () => {
  for (const figure of FIGURES) {
    for (const count of [24, MOBILE_COUNT, DEFAULT_COUNT]) {
      const world = createParticleWorld(44, count);
      setFigure(world, figure);
      assert.equal(world.figure, figure);
      assert.equal(world.targets.length, count);
      const before = meanTargetDistance(world);
      gatherParticleWorld(world);
      run(world, 320);
      const after = meanTargetDistance(world);
      assert.ok(after < before * 0.5, `${figure}×${count}: ${before.toFixed(3)} → ${after.toFixed(3)}`);
    }
  }
});

test('la figura siguiente cicla en orden y vuelve al ojo; los índices siguen valiendo', () => {
  const world = createParticleWorld(5, 40);
  const seen = [world.figure];
  for (let index = 0; index < FIGURES.length; index += 1) {
    const figure = nextFigure(world);
    assert.equal(figure, world.figure);
    assert.equal(world.targets.length, 40);
    assert.ok(world.particles.every((particle) => world.targets[particle.target] !== undefined));
    seen.push(figure);
  }
  assert.deepEqual(seen, [...FIGURES, 'eye']);
});

test('un mundo reunido migra solo a la figura nueva', () => {
  const world = createParticleWorld(21, 120);
  gatherParticleWorld(world);
  run(world, 320);
  assert.ok(meanTargetDistance(world) < 0.03);

  nextFigure(world);
  const justChanged = meanTargetDistance(world);
  assert.ok(justChanged > 0.08, 'la espiral está lejos del ojo');
  run(world, 320);
  assert.ok(meanTargetDistance(world) < justChanged * 0.3, 'no llegó a la espiral');
});

test('Caos es determinista y sus reglas respetan los invariantes', () => {
  const first = createParticleWorld(303, 50);
  const second = createParticleWorld(303, 50);
  const seenGroups = new Set<number>();

  for (let press = 1; press <= 12; press += 1) {
    randomizeRules(first);
    randomizeRules(second);
    assert.equal(first.chaos, press);
    assert.deepEqual(first.rules, second.rules);
    assert.equal(first.groupCount, second.groupCount);
    assert.equal(first.radius, second.radius);

    assert.ok(first.groupCount >= 3 && first.groupCount <= MAX_GROUPS);
    assert.equal(first.rules.length, first.groupCount);
    assert.ok(first.radius >= 0.09 && first.radius <= 0.16);
    const flat = first.rules.flat();
    assert.equal(flat.length, first.groupCount * first.groupCount);
    assert.ok(flat.every((value) => value >= -1 && value <= 1));
    assert.ok(flat.some((value) => value < 0), 'ningún par atrae');
    assert.ok(flat.some((value) => value > 0), 'ningún par repele');
    assert.ok(first.particles.every((particle, index) => particle.group === index % first.groupCount));
    seenGroups.add(first.groupCount);
    assert.equal(regimeOf(first), 'chaos');
  }
  assert.ok(seenGroups.size >= 2, 'doce pulsaciones deberían variar el número de grupos');

  // Otra semilla, otras reglas; y la simulación sigue funcionando con más grupos.
  const other = createParticleWorld(304, 50);
  randomizeRules(other);
  assert.notDeepEqual(other.rules, createParticleWorld(303, 50).rules);
  run(first, 60);
  assert.ok(first.particles.every((particle) => Number.isFinite(particle.x) && Number.isFinite(particle.y)));
});

test('Azar es determinista, cambia el régimen y nunca la figura', () => {
  const first = createParticleWorld(909, 40);
  const second = createParticleWorld(909, 40);
  setFigure(first, 'name');
  setFigure(second, 'name');
  const regimes = new Set<string>();

  for (let press = 1; press <= 10; press += 1) {
    randomizeWorld(first);
    randomizeWorld(second);
    assert.equal(first.randoms, press);
    assert.deepEqual(first.rules, second.rules);
    assert.equal(first.gravity, second.gravity);
    assert.equal(first.viscosity, second.viscosity);
    assert.equal(first.noise, second.noise);
    assert.equal(first.figure, 'name');
    assert.ok(GRAVITIES.includes(first.gravity));
    assert.ok(VISCOSITIES.includes(first.viscosity));
    regimes.add(`${first.gravity}/${first.viscosity}/${first.noise}`);
  }
  assert.ok(regimes.size >= 3, 'diez pulsaciones deberían dar regímenes distintos');
});

test('los ciclos de gravedad, viscosidad y ruido siguen el orden de las listas', () => {
  const world = createParticleWorld(1, 10);
  assert.deepEqual(
    [cycleGravity(world), cycleGravity(world), cycleGravity(world)],
    ['down', 'center', 'none'],
  );
  assert.deepEqual(
    [cycleViscosity(world), cycleViscosity(world), cycleViscosity(world)],
    ['dense', 'fluid', 'medium'],
  );
  assert.equal(toggleNoise(world), true);
  assert.equal(world.noise, true);
  assert.equal(toggleNoise(world), false);
  setGravity(world, 'center');
  setViscosity(world, 'fluid');
  setNoise(world, true);
  assert.equal(world.gravity, 'center');
  assert.equal(world.viscosity, 'fluid');
  assert.equal(world.noise, true);
});

test('la viscosidad densa deja menos energía que la fluida tras la misma perturbación', () => {
  const fluid = createParticleWorld(7, 120);
  const dense = createParticleWorld(7, 120);
  setViscosity(fluid, 'fluid');
  setViscosity(dense, 'dense');
  perturbParticleWorld(fluid, 0.5, 0.5, 1.5);
  perturbParticleWorld(dense, 0.5, 0.5, 1.5);
  run(fluid, 240);
  run(dense, 240);
  assert.ok(fluid.energy > 0 && dense.energy > 0);
  assert.ok(dense.energy < fluid.energy * 0.6, `densa ${dense.energy} vs fluida ${fluid.energy}`);
});

test('la gravedad hacia abajo empuja la y media hacia el suelo (y crece hacia abajo, como en el lienzo)', () => {
  const still = createParticleWorld(7, 120);
  const falling = createParticleWorld(7, 120);
  setGravity(falling, 'down');
  run(still, 300);
  run(falling, 300);
  assert.ok(meanY(falling) > meanY(still) + 0.25, `${meanY(still)} → ${meanY(falling)}`);
  assert.ok(falling.particles.every((particle) => particle.y <= 0.985), 'se salió por el suelo');
});

test('la gravedad al centro reduce la distancia media al centro sin apelotonar del todo', () => {
  const still = createParticleWorld(7, 120);
  const collapsing = createParticleWorld(7, 120);
  setGravity(collapsing, 'center');
  run(still, 600);
  run(collapsing, 600);
  assert.ok(meanCentreDistance(collapsing) < meanCentreDistance(still) * 0.5);
  assert.ok(meanCentreDistance(collapsing) > 0.04, 'colapsó en un grumo');
});

test('el ruido mueve un mundo en reposo', () => {
  const quiet = createParticleWorld(3, 24);
  const drifting = createParticleWorld(3, 24);
  for (const world of [quiet, drifting]) {
    world.rules = world.rules.map((row) => row.map(() => 0));
    world.particles.forEach((particle, index) => {
      particle.x = 0.1 + (index % 6) * 0.16;
      particle.y = 0.1 + Math.floor(index / 6) * 0.25;
      particle.vx = 0;
      particle.vy = 0;
    });
  }
  const start = structuredClone(quiet.particles);
  setNoise(drifting, true);
  run(quiet, 60);
  run(drifting, 60);
  assert.deepEqual(
    quiet.particles.map(({ x, y }) => [x, y]),
    start.map(({ x, y }) => [x, y]),
  );
  assert.ok(quiet.energy === 0);
  assert.ok(drifting.energy > 0);
  assert.ok(meanGap(quiet, drifting) > 0.005, `apenas se movió: ${meanGap(quiet, drifting)}`);
  assert.equal(regimeOf(drifting), 'drift');
});

test('el régimen respeta la precedencia: colapso, caída, deriva, caos, estable', () => {
  const world = createParticleWorld(2, 10);
  assert.equal(regimeOf(world), 'stable');
  randomizeRules(world);
  assert.equal(regimeOf(world), 'chaos');
  setNoise(world, true);
  assert.equal(regimeOf(world), 'drift');
  setGravity(world, 'down');
  assert.equal(regimeOf(world), 'fall');
  setGravity(world, 'center');
  assert.equal(regimeOf(world), 'collapse');
  setGravity(world, 'none');
  setNoise(world, false);
  assert.equal(regimeOf(world), 'chaos');
});

test('el paso avanza el tiempo, mide la energía y no hace nada con tiempo nulo', () => {
  const world = createParticleWorld(6, 30);
  stepParticleWorld(world, 0);
  assert.equal(world.time, 0);
  run(world, 60);
  assert.ok(Math.abs(world.time - 1) < 1e-9);
  assert.ok(world.energy > 0);
  // Un paso desmesurado se recorta: a menos de ~8 fotogramas por segundo va a cámara lenta.
  stepParticleWorld(world, 5);
  assert.ok(world.time < 1.2);
});

test('reiniciar restaura la semilla y limpia huellas y composición', () => {
  const world = createParticleWorld(90210, 42);
  const original = structuredClone(world.particles);
  perturbParticleWorld(world, 0.4, 0.6);
  gatherParticleWorld(world);
  run(world, 20);

  resetParticleWorld(world);
  assert.deepEqual(world.particles, original);
  assert.equal(world.traces.length, 0);
  assert.equal(world.interactions, 0);
  assert.equal(world.composition, 0);
  assert.equal(narrativeState(world), 'dispersion');
});

test('reiniciar devuelve el mundo entero al estado de creación: reglas, figura, régimen y contadores', () => {
  const world = createParticleWorld(555, 64);
  const pristine = structuredClone(world);
  perturbParticleWorld(world, 0.3, 0.3);
  randomizeRules(world);
  randomizeWorld(world);
  nextFigure(world);
  setGravity(world, 'center');
  setViscosity(world, 'dense');
  setNoise(world, true);
  gatherParticleWorld(world);
  run(world, 40);
  assert.notDeepEqual(world, pristine);

  resetParticleWorld(world);
  assert.deepEqual(world, pristine);
  assert.equal(world.particles.length, 64);
  assert.equal(regimeOf(world), 'stable');
});

test('el resultado no depende de los fotogramas por segundo', () => {
  // El paso es fijo (1/60 s) con acumulador: a 30 fotogramas por segundo se
  // simulan dos por llamada y a 45 se alternan uno y dos. En diez segundos los
  // tres mundos han corrido exactamente los mismos 600 fotogramas.
  const smooth = createParticleWorld(7, 120);
  const choppy = createParticleWorld(7, 120);
  const odd = createParticleWorld(7, 120);
  for (const world of [smooth, choppy, odd]) {
    setNoise(world, true);
    perturbParticleWorld(world, 0.4, 0.5);
  }
  run(smooth, 600, 1 / 60);
  run(choppy, 300, 1 / 30);
  run(odd, 450, 1 / 45);
  assert.ok(Math.abs(smooth.time - choppy.time) < 1e-9);
  assert.ok(Math.abs(smooth.time - odd.time) < 1e-9);
  assert.ok(meanGap(smooth, choppy) < 0.05, `distancia media ${meanGap(smooth, choppy)}`);
  assert.equal(meanGap(smooth, choppy), 0, '1/30 s no es idéntico a 1/60 s');
  assert.equal(meanGap(smooth, odd), 0, '1/45 s no es idéntico a 1/60 s');
});

test('el acumulador guarda el tiempo que no llega a un fotograma', () => {
  const world = createParticleWorld(7, 30);
  const start = structuredClone(world.particles);
  stepParticleWorld(world, 1 / 120);
  assert.equal(world.time, 0, 'medio fotograma no se simula');
  assert.deepEqual(world.particles, start);
  stepParticleWorld(world, 1 / 120);
  assert.ok(Math.abs(world.time - 1 / 60) < 1e-12, 'dos medios fotogramas son uno entero');
  assert.notDeepEqual(world.particles, start);
  assert.ok(world.accumulator < 1e-9);
  assert.ok(world.particles.every((particle) => particle.previousX === start[particle.target].x));

  // Un paso desmesurado se recorta a 0,12 s: siete fotogramas y el resto en el acumulador.
  stepParticleWorld(world, 5);
  assert.ok(Math.abs(world.time - 8 / 60) < 1e-9, `tiempo ${world.time}`);
  assert.ok(Math.abs(world.accumulator - (0.12 - 7 / 60)) < 1e-9);
});

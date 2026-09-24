import { DPR_CAP, getQuality } from '@/lib/quality';
import type { ConsciousnessStateId, RegimeId } from '@/lib/types';
import type { ParticleWorld } from './particle-life';

/**
 * Un color por grupo: cian, blanco frío, violeta, magenta y el verde de la
 * cápsula. Con tres grupos (las reglas de fábrica) sólo se ven los tres
 * primeros; el caos puede subir a cinco.
 */
const COLORS = ['#3fd8ee', '#eef3f6', '#9a8dff', '#f07ab9', '#78f0b4'] as const;
/** El fondo del lienzo: opaco la primera vez, y después un velo que deja huella. */
const BACKGROUND = 'rgba(3, 8, 16, 1)';
const VEIL = '3, 8, 16';

export interface FieldSize {
  width: number;
  height: number;
  dpr: number;
}

/**
 * Ajusta el lienzo a su caja y a la densidad de píxeles, con tope: es 2D y hay
 * que pintar cada fotograma. El tope baja con la calidad medida (`lib/quality`).
 */
export function sizeParticleCanvas(canvas: HTMLCanvasElement, width: number, height: number): FieldSize {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.6, DPR_CAP[getQuality()]);
  const pixelWidth = Math.max(1, Math.round(width * dpr));
  const pixelHeight = Math.max(1, Math.round(height * dpr));
  if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
  if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
  return { width, height, dpr };
}

/**
 * Cuánto se borra del fotograma anterior. Menos es más huella: en los estados
 * de huella y autoobservación las partículas dejan estela; con ruido, más
 * todavía —el campo se ve como un flujo—; en el caos, menos, para que las
 * figuras que emergen se lean nítidas.
 */
function veilFor(state: ConsciousnessStateId, regime: RegimeId) {
  if (regime === 'drift') return 0.07;
  if (regime === 'chaos') return 0.2;
  if (state === 'trace' || state === 'self') return 0.11;
  return 0.16;
}

/**
 * Pinta el mundo. `fresh` pide un fondo opaco (primer fotograma, tras
 * redimensionar o al pintar una sola vez con movimiento reducido); si no, un
 * velo translúcido que deja ver el rastro de los fotogramas anteriores.
 */
export function drawParticleWorld(
  context: CanvasRenderingContext2D,
  world: ParticleWorld,
  size: FieldSize,
  state: ConsciousnessStateId,
  regime: RegimeId,
  fresh = false,
) {
  const { width, height, dpr } = size;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.globalAlpha = 1;
  context.fillStyle = fresh ? BACKGROUND : `rgba(${VEIL}, ${veilFor(state, regime)})`;
  context.fillRect(0, 0, width, height);

  // Un lavado radial muy tenue, que crece al reunirse: el centro del campo respira.
  const wash = context.createRadialGradient(
    width * 0.5,
    height * 0.5,
    0,
    width * 0.5,
    height * 0.5,
    width * 0.56,
  );
  wash.addColorStop(0, `rgba(93, 120, 190, ${0.02 + world.composition * 0.05})`);
  wash.addColorStop(0.6, 'rgba(25, 66, 92, 0.012)');
  wash.addColorStop(1, 'rgba(3, 8, 16, 0)');
  context.fillStyle = wash;
  context.fillRect(0, 0, width, height);

  // Las huellas de cada perturbación: un anillo que se abre y se apaga.
  context.lineWidth = 1;
  for (const trace of world.traces) {
    const x = trace.x * width;
    const y = trace.y * height;
    const radius = (1 - trace.life) * 46 + 8;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.strokeStyle = `rgba(154, 141, 255, ${trace.life * 0.26})`;
    context.stroke();
  }

  // Las partículas: un punto por grupo, algo mayor al reunirse; el grupo blanco lleva halo.
  const grow = world.composition * 0.35;
  for (const particle of world.particles) {
    const x = particle.x * width;
    const y = particle.y * height;
    const color = COLORS[particle.group % COLORS.length];
    const radius = (particle.group === 1 ? 1.4 : 1.1) + grow;

    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fillStyle = color;
    context.globalAlpha = 0.78 + world.composition * 0.18;
    context.fill();

    if (particle.group !== 1) continue;
    context.beginPath();
    context.arc(x, y, radius * 3.6, 0, Math.PI * 2);
    context.fillStyle = 'rgba(224, 249, 255, 0.05)';
    context.fill();
  }

  context.globalAlpha = 1;
}

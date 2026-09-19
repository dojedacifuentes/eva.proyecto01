'use client';

/**
 * EVA // INTERIOR — la escena.
 *
 * Un corazón que late, partículas que recorren los vasos, una silueta
 * translúcida y seis órganos que se eligen. Las técnicas —el corazón como
 * esferas escaladas y una punta invertida que se contrae de golpe, los vasos
 * como tubos sobre curvas Catmull-Rom, el fluido como una nube de puntos que
 * avanza por esas curvas repartida según su largo, los órganos como mallas
 * levemente deformadas y el destello sincronizado con el latido— están
 * adaptadas de:
 *
 *   christianpasinrey/human-blood-system («HÆMA») —
 *   https://github.com/christianpasinrey/human-blood-system
 *   Copyright (c) 2026 Christian Pasín Rey. Licencia MIT (docs/ASSET_LICENSES.md).
 *
 * Reescrito para React Three Fiber y three 0.186 (el original es vanilla con
 * three 0.170 por CDN), con la paleta y el modelo de EVA, sin cámara libre ni
 * controles propios: la capa HTML (`EvaInterior`) manda, y esto sólo dibuja.
 */

import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { ComposerSizeGuard } from '@/components/eva/ComposerSizeGuard';
import type { OrganId } from '@/content/ejes';
import { seeded } from '@/lib/random';
import { bodySignal } from './body-signal';
import {
  BODY_CENTER_Y,
  BODY_COLOR,
  BODY_HEIGHT,
  BODY_WIDTH,
  BRAIN_AT,
  GHOST,
  HEART_AT,
  ORGANS,
  VESSELS,
  pathLength,
  shareCells,
  type GhostPart,
  type Point,
} from './interior-data';
import { flash, squeeze } from './pulse';

const FOV = 30;
const CAMERA_Z = 12;
/** Cuánto del lienzo ocupa el modelo entero. */
const FILL = 0.9;
/** Un clic con más arrastre que esto no elige nada: era un giro (trampa 13 del handoff). */
const CLICK_SLOP = 6;
/** Vaivén en reposo: amplitud en radianes y velocidad. */
const SWAY = 0.55;
const SWAY_SPEED = 0.22;
/** Cuánto dura el impulso que baja desde la cabeza, en segundos. */
const IMPULSE_SECONDS = 1.5;
/** Por dónde baja: cabeza, cuello, pecho, abdomen, pelvis. */
const SPINE: readonly Point[] = [BRAIN_AT, [0, 3.3, 0.06], [0, 2.6, 0.12], [0.1, 1.0, 0.2], [0, -0.55, 0.18]];

const WHITE = '#ffffff';

/** Escala con la que el modelo entero llena el lienzo, por la dimensión que limite. */
function fitScale(aspect: number) {
  const visible = 2 * CAMERA_Z * Math.tan((FOV * Math.PI) / 360);
  return Math.min((FILL * visible) / BODY_HEIGHT, (FILL * visible * aspect) / BODY_WIDTH);
}

/** Disco suave para las partículas: pintado en un lienzo, sin imagen que descargar. */
function discTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (context) {
    const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.85)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
  }
  return new THREE.CanvasTexture(canvas);
}

/** Icosaedro con un relieve suave y determinista: lo orgánico sin ruido aleatorio. */
function organGeometry() {
  const geometry = new THREE.IcosahedronGeometry(1, 3);
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);
    const bump = 1 + Math.sin(x * 5.1 + y * 3.7) * 0.045 + Math.sin(z * 6.3 - y * 2.9) * 0.04;
    position.setXYZ(i, x * bump, y * bump, z * bump);
  }
  geometry.computeVertexNormals();
  return geometry;
}

/* ───────────── Silueta ───────────── */

/**
 * Una pieza de la silueta: un velo casi transparente y una malla de alambre
 * tenue, por debajo del umbral del bloom. Es el contorno de un holograma, no un
 * maniquí: lo que tiene que brillar está dentro. En radiografía el velo se va y
 * el alambre se marca.
 */
function GhostPiece({ part, xray }: { part: GhostPart; xray: boolean }) {
  const [a = 1, b = 1, c = 1] = part.size;
  const geometry =
    part.shape === 'sphere' ? (
      <sphereGeometry args={[a, 14, 10]} />
    ) : part.shape === 'cylinder' ? (
      <cylinderGeometry args={[a, b, c, 16, 2, true]} />
    ) : (
      <capsuleGeometry args={[a, b, 3, 10]} />
    );

  return (
    <group position={[...part.position]} scale={part.scale ? [...part.scale] : 1} rotation={[0, 0, part.tilt ?? 0]}>
      <mesh>
        {geometry}
        <meshBasicMaterial
          color={BODY_COLOR.ghost}
          transparent
          opacity={xray ? 0.006 : 0.028}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh>
        {geometry}
        <meshBasicMaterial
          color={BODY_COLOR.ghostWire}
          wireframe
          transparent
          opacity={xray ? 0.16 : 0.07}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/* ───────────── Modelo ───────────── */

interface ModelProps extends Omit<InteriorSceneProps, 'active' | 'quality' | 'onReady'> {
  cells: number;
}

function Model({
  cells,
  reduced,
  selected,
  hovered,
  xray,
  isolate,
  reverse,
  breath,
  impulse,
  surge,
  flare,
  flareOrgan,
  reset,
  onHover,
  onSelect,
}: ModelProps) {
  const size = useThree((state) => state.size);
  const spin = useRef<THREE.Group>(null);
  const frame = useRef<THREE.Group>(null);
  const heart = useRef<THREE.Group>(null);
  const heartGlow = useRef<THREE.PointLight>(null);
  const core = useRef<THREE.Mesh>(null);
  const lungs = useRef<THREE.Group>(null);
  const blood = useRef<THREE.Points>(null);
  const bloodMaterial = useRef<THREE.PointsMaterial>(null);
  const spark = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const ringMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const tubes = useRef<(THREE.Mesh | null)[]>([]);
  const organs = useRef<(THREE.Group | null)[]>([]);

  /** Giro acumulado por el arrastre, y señales que los botones encienden y el bucle apaga. */
  const turn = useRef(0);
  const breathing = useRef(0);
  const impulseAt = useRef(-1);
  const flowing = useRef(0);
  const flaring = useRef<number[]>(ORGANS.map(() => 0));
  const ringAt = useRef(-1);
  const ringOrgan = useRef(0);
  const zoomNow = useRef(1);
  const focusNow = useRef(new THREE.Vector3(0, BODY_CENTER_Y, 0));

  const aspect = size.width / Math.max(1, size.height);
  const fit = fitScale(aspect);
  const selectedAt = selected ? ORGANS.findIndex((organ) => organ.id === selected) : -1;
  const hoveredAt = hovered ? ORGANS.findIndex((organ) => organ.id === hovered) : -1;

  const scratch = useMemo(() => ({ a: new THREE.Vector3(), b: new THREE.Vector3(), color: new THREE.Color() }), []);

  /* Curvas, tubos y tablas de posiciones: una vez. */
  const vessels = useMemo(
    () =>
      VESSELS.map((vessel) => {
        const curve = new THREE.CatmullRomCurve3(
          vessel.points.map((point) => new THREE.Vector3(...point)),
          false,
          'catmullrom',
          0.4,
        );
        const length = curve.getLength();
        const steps = Math.max(8, Math.ceil(length * 16));
        const table = new Float32Array((steps + 1) * 3);
        curve.getSpacedPoints(steps).forEach((point, at) => point.toArray(table, at * 3));
        return {
          ...vessel,
          length,
          steps,
          table,
          tube: new THREE.TubeGeometry(curve, Math.ceil(length * 12), vessel.radius, 8, false),
        };
      }),
    [],
  );
  useEffect(() => () => vessels.forEach((vessel) => vessel.tube.dispose()), [vessels]);

  const spine = useMemo(
    () => new THREE.CatmullRomCurve3(SPINE.map((point) => new THREE.Vector3(...point))),
    [],
  );

  const lobe = useMemo(() => organGeometry(), []);
  useEffect(() => () => lobe.dispose(), [lobe]);
  const disc = useMemo(() => discTexture(), []);
  useEffect(() => () => disc.dispose(), [disc]);

  /*
   * El fluido: cada partícula sabe en qué vaso va, desde dónde sale y a qué
   * paso. Esto es el reparto inicial y no se toca; lo que cambia en cada
   * fotograma —por dónde va cada una— vive en `along`, y las posiciones se
   * escriben en el búfer de la geometría a través de su ref.
   */
  const flow = useMemo(() => {
    const random = seeded(0xe7a07);
    const share = shareCells(
      VESSELS.map((vessel) => pathLength(vessel.points)),
      cells,
    );
    const count = share.reduce((sum, value) => sum + value, 0);
    const vessel = new Uint8Array(count);
    const start = new Float32Array(count);
    const pace = new Float32Array(count);
    const wobble = new Float32Array(count * 3);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const artery = new THREE.Color(BODY_COLOR.artery);
    const vein = new THREE.Color(BODY_COLOR.vein);
    const pale = new THREE.Color(BODY_COLOR.cell);

    let at = 0;
    share.forEach((amount, index) => {
      const line = vessels[index];
      for (let i = 0; i < amount; i++, at++) {
        vessel[at] = index;
        start[at] = random();
        pace[at] = 0.8 + random() * 0.45;
        wobble[at * 3] = random() - 0.5;
        wobble[at * 3 + 1] = random() - 0.5;
        wobble[at * 3 + 2] = random() - 0.5;
        const tint = random() < 0.06 ? pale : line.type === 'art' ? artery : vein;
        tint.toArray(colors, at * 3);
        // Posición de reposo: es lo que se ve con movimiento reducido.
        const o = Math.min(line.steps - 1, Math.floor(start[at] * line.steps)) * 3;
        positions[at * 3] = line.table[o];
        positions[at * 3 + 1] = line.table[o + 1];
        positions[at * 3 + 2] = line.table[o + 2];
      }
    });
    return { count, vessel, start, pace, wobble, positions, colors };
  }, [cells, vessels]);

  const along = useRef<Float32Array | null>(null);
  useEffect(() => {
    along.current = Float32Array.from(flow.start);
    return () => {
      along.current = null;
    };
  }, [flow]);

  /* Cada pulsación recarga su señal; el fotograma la va apagando. */
  useEffect(() => {
    if (breath > 0) breathing.current = 1;
  }, [breath]);
  useEffect(() => {
    if (impulse > 0) impulseAt.current = 0;
  }, [impulse]);
  useEffect(() => {
    if (surge > 0) flowing.current = 1;
  }, [surge]);
  useEffect(() => {
    if (reset > 0) turn.current = 0;
  }, [reset]);
  useEffect(() => {
    if (flare === 0 || !flareOrgan) return;
    const at = ORGANS.findIndex((organ) => organ.id === flareOrgan);
    if (at < 0) return;
    flaring.current[at] = 1;
    ringOrgan.current = at;
    ringAt.current = 0;
  }, [flare, flareOrgan]);

  useFrame((state, delta) => {
    const step = Math.min(delta, 0.05);
    const time = state.clock.elapsedTime;
    const phase = bodySignal.heart.phase;
    const beat = reduced ? 0 : flash(phase);
    const ease = reduced ? 1 : Math.min(1, step * 3.2);

    /* Giro: el vaivén se aparta mientras se arrastra, y el impulso del arrastre se frena solo. */
    turn.current += bodySignal.velocity;
    bodySignal.velocity *= 0.9;
    if (Math.abs(bodySignal.velocity) < 0.0002) bodySignal.velocity = 0;
    if (spin.current) {
      const sway = reduced ? 0 : Math.sin(time * SWAY_SPEED) * SWAY * (selectedAt >= 0 ? 0.45 : 1);
      spin.current.rotation.y = sway + turn.current;
    }

    /* Encuadre: el modelo entero, o el órgano elegido llevado al centro y acercado. */
    const target = selectedAt >= 0 ? ORGANS[selectedAt] : null;
    zoomNow.current += ((target?.zoom ?? 1) - zoomNow.current) * ease;
    scratch.a.set(...(target?.focus ?? ([0, BODY_CENTER_Y, 0] as const)));
    focusNow.current.lerp(scratch.a, ease);
    if (frame.current) {
      const scale = fit * zoomNow.current;
      frame.current.scale.setScalar(scale);
      frame.current.position.copy(focusNow.current).multiplyScalar(-scale);
    }

    /* Corazón: se contrae con la fase; el núcleo torácico y la luz destellan con él. */
    if (heart.current) heart.current.scale.setScalar(reduced ? 1 : squeeze(phase, bodySignal.force));
    if (heartGlow.current) heartGlow.current.intensity = 1.6 + beat * 5 * bodySignal.force;
    if (core.current) {
      const material = core.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.35 + beat * 0.6;
      core.current.scale.setScalar(1 + beat * 0.12);
    }

    /* Pulmones: respiran despacio, y hondo cuando se pide. */
    breathing.current = Math.max(0, breathing.current - step / 3.2);
    const deep = Math.sin(Math.min(1, 1 - breathing.current) * Math.PI) * (breathing.current > 0 ? 1 : 0);
    if (lungs.current) {
      lungs.current.scale.setScalar(1 + (reduced ? 0 : Math.sin(time * 0.9) * 0.03) + deep * 0.16);
    }

    /* Impulso: una chispa baja desde la cabeza y enciende cada órgano al pasar. */
    if (impulseAt.current >= 0) {
      impulseAt.current += step / (reduced ? 0.001 : IMPULSE_SECONDS);
      const progress = Math.min(1, impulseAt.current);
      spine.getPointAt(progress, scratch.b);
      ORGANS.forEach((organ, at) => {
        if (organ.focus[1] >= scratch.b.y && flaring.current[at] < 0.6) flaring.current[at] = 1;
      });
      if (spark.current) {
        spark.current.visible = progress < 1;
        spark.current.position.copy(scratch.b);
        spark.current.scale.setScalar(0.09 + Math.sin(progress * Math.PI) * 0.08);
      }
      if (progress >= 1) impulseAt.current = -1;
    }

    /* Órganos: brillo por elección, por apuntar y por destello; los demás se apagan al aislar. */
    ORGANS.forEach((organ, at) => {
      flaring.current[at] = Math.max(0, flaring.current[at] - step * 1.1);
      const chosen = at === selectedAt;
      const dimmed = isolate && selectedAt >= 0 && !chosen;
      const glow = (chosen ? 0.75 : at === hoveredAt ? 0.5 : 0.2) + flaring.current[at] * 1.6 + beat * 0.12;
      const opacity = dimmed ? 0.05 : xray && !chosen ? 0.22 : chosen ? 0.82 : 0.5;
      organs.current[at]?.traverse((node) => {
        const mesh = node as THREE.Mesh;
        if (!mesh.isMesh) return;
        const material = mesh.material as THREE.MeshStandardMaterial;
        if (!material.emissive) return;
        material.emissiveIntensity += (glow - material.emissiveIntensity) * ease;
        material.opacity += (opacity - material.opacity) * ease;
      });
    });

    /* Vasos: la aorta es un órgano más; el caudal abierto los enciende a todos. */
    flowing.current = Math.max(0, flowing.current - step / 4.5);
    const aortaAt = ORGANS.findIndex((organ) => organ.id === 'aorta');
    vessels.forEach((vessel, at) => {
      const material = tubes.current[at]?.material as THREE.MeshStandardMaterial | undefined;
      if (!material) return;
      const isAorta = vessel.id === 'aorta';
      const chosen = isAorta && selectedAt === aortaAt;
      const dimmed = isolate && selectedAt >= 0 && !chosen;
      const glow =
        (chosen ? 1.1 : isAorta && hoveredAt === aortaAt ? 0.8 : 0.32) +
        flowing.current * 0.9 +
        (isAorta ? flaring.current[aortaAt] * 1.4 : 0) +
        beat * 0.18;
      const opacity = dimmed ? 0.05 : xray ? 0.62 : chosen ? 0.6 : 0.34;
      material.emissiveIntensity += (glow - material.emissiveIntensity) * ease;
      material.opacity += (opacity - material.opacity) * ease;
    });

    /* Fluido: avanza a golpes, con el pulso; al derecho o al revés. */
    const points = blood.current;
    const places = along.current;
    if (points && places && !reduced) {
      const surgeNow = 1 + flowing.current * 2.4;
      const pulse = 0.55 + Math.max(0, 1 - phase * 3) * 0.95;
      const advance = step * 0.62 * (bodySignal.bpm / 60) * pulse * surgeNow * (reverse ? -1 : 1);
      const { count, vessel, pace, wobble } = flow;
      const positions = points.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        const line = vessels[vessel[i]];
        let t = places[i] + (advance * pace[i]) / line.length;
        t -= Math.floor(t);
        places[i] = t;
        const at = t * line.steps;
        const from = Math.min(line.steps - 1, Math.floor(at));
        const mix = at - from;
        const table = line.table;
        const o = from * 3;
        const drift = 0.018;
        positions[i * 3] = table[o] + (table[o + 3] - table[o]) * mix + wobble[i * 3] * drift * Math.sin(time * 2 + i);
        positions[i * 3 + 1] =
          table[o + 1] + (table[o + 4] - table[o + 1]) * mix + wobble[i * 3 + 1] * drift * Math.cos(time * 1.7 + i);
        positions[i * 3 + 2] = table[o + 2] + (table[o + 5] - table[o + 2]) * mix + wobble[i * 3 + 2] * drift;
      }
      points.geometry.attributes.position.needsUpdate = true;
    }
    if (bloodMaterial.current) {
      const dimmed = isolate && selectedAt >= 0;
      const lift = 1 + deep * 1.3 + flowing.current * 0.8 + beat * 0.25;
      bloodMaterial.current.color.setScalar(lift);
      bloodMaterial.current.opacity += ((dimmed ? 0.18 : 0.95) - bloodMaterial.current.opacity) * ease;
    }

    /* Anillo del destello: nace en el órgano y se abre mirando siempre a la cámara. */
    if (ring.current && ringMaterial.current) {
      if (ringAt.current >= 0 && frame.current) {
        ringAt.current += step / (reduced ? 0.4 : 0.95);
        const progress = Math.min(1, ringAt.current);
        const organ = ORGANS[ringOrgan.current];
        scratch.b.set(...organ.focus);
        frame.current.localToWorld(scratch.b);
        ring.current.position.copy(scratch.b);
        ring.current.quaternion.copy(state.camera.quaternion);
        ring.current.scale.setScalar(fit * zoomNow.current * (0.35 + progress * 1.1));
        ring.current.visible = true;
        ringMaterial.current.color.set(organ.color);
        ringMaterial.current.opacity = (1 - progress) * 0.85;
        if (progress >= 1) ringAt.current = -1;
      } else {
        ring.current.visible = false;
      }
    }
  });

  /** Elegir desde la escena: un clic, no el final de un giro. */
  const pick = (id: OrganId) => (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (event.delta > CLICK_SLOP) return;
    onSelect(id);
  };
  const over = (id: OrganId) => (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    if (!bodySignal.dragging) onHover(id);
  };
  const out = () => onHover(null);

  return (
    <>
      <group ref={spin}>
        <group ref={frame} scale={fit} position={[0, -BODY_CENTER_Y * fit, 0]}>
          {GHOST.map((part) => (
            <GhostPiece key={part.id} part={part} xray={xray} />
          ))}

          {vessels.map((vessel, at) => {
            const color = vessel.type === 'art' ? BODY_COLOR.artery : BODY_COLOR.vein;
            const events =
              vessel.id === 'aorta'
                ? { onClick: pick('aorta'), onPointerOver: over('aorta'), onPointerOut: out }
                : {};
            return (
              <mesh
                key={vessel.id}
                ref={(mesh) => {
                  tubes.current[at] = mesh;
                }}
                geometry={vessel.tube}
                {...events}
              >
                {/* Sin escribir profundidad: el fluido va por dentro del tubo y tiene que verse a través. */}
                <meshStandardMaterial
                  color={color}
                  emissive={color}
                  emissiveIntensity={0.32}
                  roughness={0.35}
                  metalness={0.1}
                  transparent
                  opacity={0.34}
                  depthWrite={false}
                />
              </mesh>
            );
          })}

          {ORGANS.map((organ, at) => (
            <group
              key={organ.id}
              ref={(group) => {
                organs.current[at] = group;
              }}
              onClick={pick(organ.id)}
              onPointerOver={over(organ.id)}
              onPointerOut={out}
            >
              {organ.id === 'corazon' ? (
                /* El corazón: dos aurículas, el cuerpo y una punta invertida. */
                <group ref={heart} position={[...HEART_AT]}>
                  <group scale={0.3}>
                    {([1, -1] as const).map((sign) => (
                      <mesh key={sign} position={[sign * 0.42, 0.42, 0]} scale={[1, 1.05, 0.92]}>
                        <sphereGeometry args={[0.62, 20, 16]} />
                        <meshStandardMaterial
                          color={organ.color}
                          emissive={organ.color}
                          emissiveIntensity={0.2}
                          roughness={0.35}
                          metalness={0.1}
                          transparent
                          opacity={0.5}
                        />
                      </mesh>
                    ))}
                    <mesh scale={[1.05, 1.1, 0.95]}>
                      <sphereGeometry args={[0.95, 24, 20]} />
                      <meshStandardMaterial
                        color={organ.color}
                        emissive={organ.color}
                        emissiveIntensity={0.2}
                        roughness={0.35}
                        metalness={0.1}
                        transparent
                        opacity={0.5}
                      />
                    </mesh>
                    <mesh position={[0, -1, 0]} rotation={[0, 0, Math.PI]} scale={[1, 1, 0.9]}>
                      <coneGeometry args={[0.82, 1.25, 20]} />
                      <meshStandardMaterial
                        color={organ.color}
                        emissive={organ.color}
                        emissiveIntensity={0.2}
                        roughness={0.35}
                        metalness={0.1}
                        transparent
                        opacity={0.5}
                      />
                    </mesh>
                  </group>
                </group>
              ) : organ.id === 'pulmones' ? (
                <group ref={lungs} position={[...organ.focus]}>
                  {organ.lobes.map((item, index) => (
                    <mesh
                      key={index}
                      geometry={lobe}
                      position={[
                        item.position[0] - organ.focus[0],
                        item.position[1] - organ.focus[1],
                        item.position[2] - organ.focus[2],
                      ]}
                      scale={[...item.radii]}
                    >
                      <meshStandardMaterial
                        color={organ.color}
                        emissive={organ.color}
                        emissiveIntensity={0.2}
                        roughness={0.55}
                        transparent
                        opacity={0.5}
                        depthWrite={false}
                      />
                    </mesh>
                  ))}
                </group>
              ) : (
                organ.lobes.map((item, index) => (
                  <mesh key={index} geometry={lobe} position={[...item.position]} scale={[...item.radii]}>
                    <meshStandardMaterial
                      color={organ.color}
                      emissive={organ.color}
                      emissiveIntensity={0.2}
                      roughness={0.5}
                      transparent
                      opacity={0.5}
                      depthWrite={false}
                    />
                  </mesh>
                ))
              )}
            </group>
          ))}

          {/* El núcleo torácico: el aro que en las imágenes de EVA brilla en el pecho. */}
          <mesh ref={core} position={[HEART_AT[0], HEART_AT[1], HEART_AT[2] + 0.34]}>
            <torusGeometry args={[0.2, 0.014, 8, 48]} />
            <meshBasicMaterial
              color={BODY_COLOR.core}
              transparent
              opacity={0.35}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </mesh>
          <pointLight ref={heartGlow} position={[...HEART_AT]} color={BODY_COLOR.artery} intensity={1.6} distance={4} decay={2} />

          {/* El fluido se dibuja después de todo lo translúcido: por encima de los tubos que lo contienen. */}
          <points ref={blood} frustumCulled={false} renderOrder={2}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[flow.positions, 3]} />
              <bufferAttribute attach="attributes-color" args={[flow.colors, 3]} />
            </bufferGeometry>
            <pointsMaterial
              ref={bloodMaterial}
              map={disc}
              size={0.16}
              vertexColors
              transparent
              opacity={0.95}
              sizeAttenuation
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </points>

          <mesh ref={spark} visible={false}>
            <sphereGeometry args={[1, 12, 10]} />
            <meshBasicMaterial color={WHITE} toneMapped={false} />
          </mesh>
        </group>
      </group>

      <mesh ref={ring} visible={false}>
        <ringGeometry args={[0.92, 1, 56]} />
        <meshBasicMaterial
          ref={ringMaterial}
          color={WHITE}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </>
  );
}

/* ───────────── Escena ───────────── */

export interface InteriorSceneProps {
  /** `low` en móvil y equipos modestos: sin postprocesado y con menos partículas. */
  quality: 'low' | 'high';
  reduced: boolean;
  /** `false` deja el bucle a demanda: fuera de pantalla o tapado, no se anima nada. */
  active: boolean;
  selected: OrganId | null;
  hovered: OrganId | null;
  /** Conmutadores: radiografía, aislar el órgano elegido e invertir el flujo. */
  xray: boolean;
  isolate: boolean;
  reverse: boolean;
  /** Contadores de pulsación: al subir, encienden su señal en la escena. */
  breath: number;
  impulse: number;
  surge: number;
  flare: number;
  /** El órgano que destella con `flare`. */
  flareOrgan: OrganId | null;
  /** Contador: al subir, el giro manual vuelve a cero. */
  reset: number;
  onHover: (id: OrganId | null) => void;
  onSelect: (id: OrganId) => void;
  onReady: (stats: { cells: number; vessels: number }) => void;
}

export default function InteriorScene({ quality, active, onReady, ...model }: InteriorSceneProps) {
  const low = quality === 'low';
  const cells = low ? 620 : 1500;

  return (
    <Canvas
      dpr={low ? [1, 1.3] : [1, 1.6]}
      /* A demanda y no `never`: inactiva no se anima, pero pinta su primer
         fotograma y se repinta si el lienzo cambia de tamaño (trampa 19). */
      frameloop={active ? 'always' : 'demand'}
      camera={{ position: [0, 0, CAMERA_Z], fov: FOV, near: 0.1, far: 60 }}
      gl={{ antialias: low, alpha: true, powerPreference: 'high-performance' }}
      onCreated={() => onReady({ cells, vessels: VESSELS.length })}
      onPointerMissed={() => model.onHover(null)}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 6, 8]} intensity={0.9} color="#fdeef6" />
      <directionalLight position={[-6, 2, -5]} intensity={0.7} color={BODY_COLOR.vein} />
      <pointLight position={[0, -3, 5]} intensity={6} color={BODY_COLOR.core} />

      <Model cells={cells} {...model} />

      {!low && (
        <EffectComposer enableNormalPass={false}>
          <Bloom intensity={0.75} luminanceThreshold={0.28} luminanceSmoothing={0.4} mipmapBlur />
        </EffectComposer>
      )}
      {/* Tercera escena con bloom de la página: sin esto hereda el tamaño de otra (trampa 22). */}
      <ComposerSizeGuard />
    </Canvas>
  );
}

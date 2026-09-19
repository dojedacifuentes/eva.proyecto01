'use client';

import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { BrainZone } from '@/content/neuroscan';
import { SEED, seeded, type BrainData, type Detail } from './neural-data';
import { coreSignal } from './neural-signal';

/*
 * Paleta de la red. Los colores nacen de los tokens de EVA y se multiplican
 * por encima de 1: ese excedente es justo lo que el bloom convierte en halo.
 * Índices de tinte: 0 actividad (cian), 1 previsualización (blanco azulado),
 * 2 selección (violeta), 3 alerta (magenta).
 */
const rgb = (hex: string, scale: number) => new THREE.Color(hex).multiplyScalar(scale).toArray();
const NODE_DIM = rgb('#1d5f78', 0.6);
const NODE_BRIGHT = [rgb('#3fd8ee', 2.6), rgb('#dff4ff', 2.8), rgb('#9a8dff', 2.9), rgb('#f07ab9', 2.8)];
const EDGE_DIM = rgb('#1d5f78', 0.34);
const EDGE_BRIGHT = [rgb('#3fd8ee', 1.9), rgb('#dff4ff', 2.0), rgb('#9a8dff', 2.1), rgb('#f07ab9', 2.0)];
const HUB_EMISSIVE = ['#3fd8ee', '#dff4ff', '#9a8dff', '#f07ab9'].map((hex) => new THREE.Color(hex));
const SPARK = '#dff4ff';

/** Velocidad de un impulso, en unidades de cerebro por segundo. */
const SPEED = 1.15;
/** Cada salto conserva esta fracción de la energía. */
const DAMPING = 0.74;
/** Segundos entre impulsos espontáneos según el nivel de detalle. */
const SPONTANEOUS: Record<Detail['tier'], number> = { low: 1.3, mid: 0.95, high: 0.7 };

interface Spark {
  edge: number;
  /** Recorre la arista de su primer nodo al segundo, o al revés. */
  forward: boolean;
  /** Progreso 0–1 sobre la arista. */
  t: number;
  /** 0 es un hueco libre en la reserva. */
  energy: number;
  /** Saltos que le quedan antes de apagarse. */
  hops: number;
}

/** Estado de la simulación: vive en un ref y se toca sólo desde el bucle. */
interface Sim {
  energy: Float32Array;
  sparks: Spark[];
  random: () => number;
  clock: number;
  nextSpark: number;
  nextCascade: number;
}

/** Reserva de impulsos: crece con el ritmo de la sala, para que haya con qué ramificar. */
function sparkPool(detail: Detail, tempo: number): number {
  return Math.round(detail.sparks * (1 + (tempo - 1) * 0.5));
}

function createSim(data: BrainData, pool: number): Sim {
  return {
    energy: new Float32Array(data.count),
    sparks: Array.from({ length: pool }, () => ({
      edge: 0,
      forward: true,
      t: 0,
      energy: 0,
      hops: 0,
    })),
    random: seeded(SEED ^ 0x51),
    clock: 0,
    nextSpark: 0.4,
    nextCascade: 2.5,
  };
}

/**
 * Enciende hasta `branch` impulsos que salen de un nodo por aristas distintas
 * a la de llegada. Si la reserva está llena, la señal simplemente no sigue.
 */
function ignite(
  sim: Sim,
  data: BrainData,
  node: number,
  energy: number,
  hops: number,
  exclude: number,
  branch: number,
) {
  const start = data.adjacencyOffset[node];
  const degree = data.adjacencyOffset[node + 1] - start;
  if (degree === 0) return;
  const offset = Math.floor(sim.random() * degree);
  let placed = 0;
  for (let k = 0; k < degree && placed < branch; k++) {
    const edge = data.adjacency[start + ((offset + k) % degree)];
    if (edge === exclude) continue;
    const slot = sim.sparks.find((spark) => spark.energy <= 0);
    if (!slot) return;
    slot.edge = edge;
    slot.forward = data.edges[edge * 2] === node;
    slot.t = 0;
    slot.energy = energy;
    slot.hops = hops;
    placed++;
  }
}

/**
 * Un paso de simulación: decaimiento, viaje de los impulsos y actividad
 * espontánea. `tempo` acelera los impulsos, acorta la espera entre chispas y
 * trae las cascadas más a menudo: con 2, cada 2–4 s en vez de cada 5–10.
 */
function advance(
  sim: Sim,
  data: BrainData,
  step: number,
  spontaneous: number,
  quiet: boolean,
  tempo: number,
) {
  const { energy, sparks } = sim;
  const speed = SPEED * (1 + (tempo - 1) * 0.4);
  const decay = Math.exp(-step * 1.9);
  for (let i = 0; i < energy.length; i++) {
    energy[i] = energy[i] < 0.003 ? 0 : energy[i] * decay;
  }

  for (const spark of sparks) {
    if (spark.energy <= 0) continue;
    spark.t += (step * speed) / Math.max(0.04, data.edgeLength[spark.edge]);
    if (spark.t < 1) continue;
    // Llegada: el nodo se enciende y, si queda energía y saltos, la señal se ramifica.
    const node = spark.forward ? data.edges[spark.edge * 2 + 1] : data.edges[spark.edge * 2];
    energy[node] = Math.max(energy[node], spark.energy);
    const next = spark.energy * DAMPING;
    const hops = spark.hops - 1;
    const edge = spark.edge;
    spark.energy = 0;
    if (hops > 0 && next > 0.12) ignite(sim, data, node, next, hops, edge, next > 0.45 ? 2 : 1);
  }

  if (quiet) return;
  sim.clock += step;
  // Chispas sueltas: una neurona cualquiera se enciende y contagia a dos o tres vecinas.
  if (sim.clock >= sim.nextSpark) {
    const node = Math.floor(sim.random() * data.count);
    ignite(sim, data, node, 0.5 + sim.random() * 0.25, 3, -1, 1);
    sim.nextSpark = sim.clock + (spontaneous / tempo) * (0.6 + sim.random() * 0.9);
  }
  // De vez en cuando, una secuencia mayor que nace en una región.
  if (sim.clock >= sim.nextCascade) {
    const hub = data.hubNode[Math.floor(sim.random() * data.hubNode.length)];
    ignite(sim, data, hub, 0.85, 4, -1, 2);
    sim.nextCascade = sim.clock + (5 + sim.random() * 5) / (1 + (tempo - 1) * 1.5);
  }
}

interface NeuralNetworkProps {
  data: BrainData;
  detail: Detail;
  zones: readonly BrainZone[];
  reduced: boolean;
  /** Ritmo de la red: 1 en el escáner, 2 en la sala del núcleo. */
  tempo?: number;
  /** Índice de la región seleccionada en `zones`, o -1. */
  selected: number;
  /** Índice de la región previsualizada, o -1. */
  hovered: number;
  /** Índice de la región que se enciende en magenta al seleccionarla. */
  alert: number;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}

/**
 * La red viva: neuronas instanciadas, sinapsis en un único búfer de líneas,
 * impulsos que recorren las aristas y los ocho nodos-región, que son lo único
 * que recibe el puntero. Todo lo que cambia por fotograma se escribe directo
 * en los búferes; React sólo se entera de los hovers y los clics.
 */
export function NeuralNetwork({
  data,
  detail,
  zones,
  reduced,
  tempo = 1,
  selected,
  hovered,
  alert,
  onHover,
  onSelect,
}: NeuralNetworkProps) {
  const pool = sparkPool(detail, tempo);
  const nodes = useRef<THREE.InstancedMesh>(null);
  const sparks = useRef<THREE.InstancedMesh>(null);
  const lines = useRef<THREE.LineSegments>(null);
  const hubs = useRef<(THREE.Mesh | null)[]>([]);
  const reticles = useRef<(THREE.Group | null)[]>([]);
  const sim = useRef<Sim | null>(null);
  const selectedRef = useRef(-1);
  const hoveredRef = useRef(-1);
  const hubStart = data.count - zones.length;

  const geo = useMemo(
    () => ({
      node: new THREE.IcosahedronGeometry(0.021, 1),
      spark: new THREE.SphereGeometry(0.026, 8, 6),
      hit: new THREE.SphereGeometry(0.2, 12, 8),
      core: new THREE.IcosahedronGeometry(0.055, 1),
      ringA: new THREE.TorusGeometry(0.115, 0.004, 4, 48),
      ringB: new THREE.TorusGeometry(0.15, 0.003, 4, 48),
    }),
    [],
  );
  useEffect(
    () => () => {
      for (const geometry of Object.values(geo)) geometry.dispose();
    },
    [geo],
  );

  const scratch = useMemo(
    () => ({
      matrix: new THREE.Matrix4(),
      position: new THREE.Vector3(),
      scale: new THREE.Vector3(),
      quaternion: new THREE.Quaternion(),
    }),
    [],
  );

  /* Sinapsis: extremos fijos, colores que se reescriben en cada fotograma. */
  const linePositions = useMemo(() => {
    const array = new Float32Array(data.edgeCount * 6);
    for (let e = 0; e < data.edgeCount; e++) {
      const a = data.edges[e * 2] * 3;
      const b = data.edges[e * 2 + 1] * 3;
      array.set(data.positions.subarray(a, a + 3), e * 6);
      array.set(data.positions.subarray(b, b + 3), e * 6 + 3);
    }
    return array;
  }, [data]);
  const lineColors = useMemo(() => {
    const array = new Float32Array(data.edgeCount * 6);
    for (let v = 0; v < data.edgeCount * 2; v++) array.set(EDGE_DIM, v * 3);
    return array;
  }, [data]);

  /* Posiciones de los nodos-región, para colocar sus mallas. */
  const hubPositions = useMemo(
    () =>
      data.hubNode.map(
        (node) =>
          [data.positions[node * 3], data.positions[node * 3 + 1], data.positions[node * 3 + 2]] as [
            number,
            number,
            number,
          ],
      ),
    [data],
  );

  /* La simulación nace con los datos y muere con ellos. */
  useLayoutEffect(() => {
    sim.current = createSim(data, pool);
    return () => {
      sim.current = null;
    };
  }, [data, pool]);

  /* Primer fotograma: cada neurona en su sitio, apagada, y las chispas escondidas. */
  useLayoutEffect(() => {
    const mesh = nodes.current;
    const flash = sparks.current;
    if (!mesh || !flash) return;
    const { matrix, position, scale, quaternion } = scratch;
    const color = new THREE.Color(NODE_DIM[0], NODE_DIM[1], NODE_DIM[2]);
    quaternion.identity();
    for (let i = 0; i < data.count; i++) {
      position.fromArray(data.positions, i * 3);
      scale.setScalar(i >= hubStart ? 0 : 1);
      mesh.setMatrixAt(i, matrix.compose(position, quaternion, scale));
      mesh.setColorAt(i, color);
    }
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.instanceColor?.setUsage(THREE.DynamicDrawUsage);
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

    scale.setScalar(0);
    for (let k = 0; k < pool; k++) {
      flash.setMatrixAt(k, matrix.compose(position, quaternion, scale));
    }
    flash.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    flash.instanceMatrix.needsUpdate = true;
  }, [data, pool, hubStart, scratch]);

  /* Selección: la región queda encendida y, sin movimiento reducido, arranca una descarga. */
  useEffect(() => {
    selectedRef.current = selected;
    const state = sim.current;
    if (selected < 0 || !state || reduced) return;
    ignite(state, data, data.hubNode[selected], 1, 6, -1, 3);
  }, [selected, reduced, data]);

  useEffect(() => {
    hoveredRef.current = hovered;
  }, [hovered]);

  useFrame((state, delta) => {
    const mesh = nodes.current;
    const flash = sparks.current;
    const web = lines.current;
    const world = sim.current;
    if (!mesh || !flash || !web || !world || !mesh.instanceColor) return;
    const step = Math.min(delta, 0.05);
    const time = state.clock.elapsedTime;
    const { energy } = world;
    const { matrix, position, scale, quaternion } = scratch;
    const sel = selectedRef.current;
    const hov = hoveredRef.current;
    const selTint = sel === alert ? 3 : 2;

    advance(world, data, step, SPONTANEOUS[detail.tier], reduced, tempo);

    // Suelo de energía: la región previsualizada brilla un poco; la seleccionada, más y latiendo.
    const selFloor = 0.42 + (reduced ? 0 : 0.08 * Math.sin(time * 2.2));
    for (let i = 0; i < data.count; i++) {
      const r = data.region[i];
      if (r === sel) energy[i] = Math.max(energy[i], i >= hubStart ? 0.9 : selFloor);
      else if (r === hov) energy[i] = Math.max(energy[i], i >= hubStart ? 0.65 : 0.26);
    }

    // Neuronas: color y tamaño según su energía; los nodos-región se dibujan aparte.
    const colors = mesh.instanceColor.array as Float32Array;
    for (let i = 0; i < data.count; i++) {
      const e = Math.min(1, energy[i]);
      const r = data.region[i];
      const bright = NODE_BRIGHT[r === sel ? selTint : r === hov ? 1 : 0];
      colors[i * 3] = NODE_DIM[0] + (bright[0] - NODE_DIM[0]) * e;
      colors[i * 3 + 1] = NODE_DIM[1] + (bright[1] - NODE_DIM[1]) * e;
      colors[i * 3 + 2] = NODE_DIM[2] + (bright[2] - NODE_DIM[2]) * e;
      position.fromArray(data.positions, i * 3);
      scale.setScalar(i >= hubStart ? 0 : 1 + e * 1.1);
      mesh.setMatrixAt(i, matrix.compose(position, quaternion, scale));
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.instanceColor.needsUpdate = true;

    // Sinapsis: cada extremo toma la energía de su nodo, así el brillo se degrada a lo largo.
    const tint = web.geometry.attributes.color.array as Float32Array;
    for (let e = 0; e < data.edgeCount; e++) {
      const i = data.edges[e * 2];
      const j = data.edges[e * 2 + 1];
      const ri = data.region[i];
      const rj = data.region[j];
      const bright =
        EDGE_BRIGHT[ri === sel && rj === sel ? selTint : ri === hov && rj === hov ? 1 : 0];
      const ei = Math.min(1, energy[i]);
      const ej = Math.min(1, energy[j]);
      const at = e * 6;
      tint[at] = EDGE_DIM[0] + (bright[0] - EDGE_DIM[0]) * ei;
      tint[at + 1] = EDGE_DIM[1] + (bright[1] - EDGE_DIM[1]) * ei;
      tint[at + 2] = EDGE_DIM[2] + (bright[2] - EDGE_DIM[2]) * ei;
      tint[at + 3] = EDGE_DIM[0] + (bright[0] - EDGE_DIM[0]) * ej;
      tint[at + 4] = EDGE_DIM[1] + (bright[1] - EDGE_DIM[1]) * ej;
      tint[at + 5] = EDGE_DIM[2] + (bright[2] - EDGE_DIM[2]) * ej;
    }
    web.geometry.attributes.color.needsUpdate = true;

    // Impulsos: un punto que viaja por su arista; los huecos libres se encogen a cero.
    let travelling = 0;
    world.sparks.forEach((spark, k) => {
      if (spark.energy <= 0) {
        scale.setScalar(0);
      } else {
        travelling++;
        const a = spark.forward ? data.edges[spark.edge * 2] : data.edges[spark.edge * 2 + 1];
        const b = spark.forward ? data.edges[spark.edge * 2 + 1] : data.edges[spark.edge * 2];
        position.set(
          data.positions[a * 3] + (data.positions[b * 3] - data.positions[a * 3]) * spark.t,
          data.positions[a * 3 + 1] + (data.positions[b * 3 + 1] - data.positions[a * 3 + 1]) * spark.t,
          data.positions[a * 3 + 2] + (data.positions[b * 3 + 2] - data.positions[a * 3 + 2]) * spark.t,
        );
        scale.setScalar(0.55 + spark.energy * 0.9);
      }
      flash.setMatrixAt(k, matrix.compose(position, quaternion, scale));
    });
    flash.instanceMatrix.needsUpdate = true;

    // Nodos-región: emisión y retícula. La retícula sólo aparece al previsualizar o seleccionar.
    for (let r = 0; r < zones.length; r++) {
      const hub = hubs.current[r];
      const ring = reticles.current[r];
      if (!hub || !ring) continue;
      const e = Math.min(1, energy[data.hubNode[r]]);
      const material = hub.material as THREE.MeshStandardMaterial;
      material.emissive.copy(HUB_EMISSIVE[r === sel ? selTint : r === hov ? 1 : 0]);
      material.emissiveIntensity = 0.6 + e * 2.4;
      hub.scale.setScalar(1 + e * 0.35 + (r === sel ? 0.15 : 0));
      const target = r === sel || r === hov ? 1 : 0;
      ring.scale.setScalar(ring.scale.x + (target - ring.scale.x) * Math.min(1, step * 8));
      if (!reduced) {
        ring.rotation.y += step * 0.8;
        ring.rotation.z += step * 0.35;
      }
    }

    // Lo que la corteza necesita saber: cuánta actividad hay y dónde está el foco.
    coreSignal.activity = Math.min(1, travelling / pool + (sel >= 0 ? 0.25 : 0));
    const focus = hov >= 0 ? hov : sel;
    if (focus >= 0) {
      const [x, y, z] = hubPositions[focus];
      coreSignal.focusX = x;
      coreSignal.focusY = y;
      coreSignal.focusZ = z;
      coreSignal.focusStrength = hov >= 0 ? 0.9 : 0.5;
    } else {
      coreSignal.focusStrength = 0;
    }
  });

  const over = (index: number) => (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    if (coreSignal.dragging) return;
    coreSignal.hovering = true;
    onHover(zones[index].id);
  };
  const out = () => {
    coreSignal.hovering = false;
    onHover(null);
  };
  const click = (index: number) => (event: ThreeEvent<MouseEvent>) => {
    // Un arrastre que termina sobre un nodo no es un clic.
    if (event.delta > 6) return;
    event.stopPropagation();
    onSelect(zones[index].id);
  };

  return (
    <group>
      <instancedMesh
        ref={nodes}
        args={[geo.node, undefined, data.count]}
        frustumCulled={false}
        renderOrder={2}
      >
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>

      <lineSegments ref={lines} frustumCulled={false} renderOrder={1}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[lineColors, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </lineSegments>

      <instancedMesh
        ref={sparks}
        args={[geo.spark, undefined, pool]}
        frustumCulled={false}
        renderOrder={2}
      >
        <meshBasicMaterial color={SPARK} toneMapped={false} />
      </instancedMesh>

      {zones.map((zone, index) => (
        <group key={zone.id} position={hubPositions[index]}>
          {/* Sólo esta esfera invisible recibe el puntero: ocho objetos que trazar, no cientos. */}
          <mesh
            geometry={geo.hit}
            onPointerOver={over(index)}
            onPointerOut={out}
            onClick={click(index)}
          >
            <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
          </mesh>
          <mesh
            ref={(element) => {
              hubs.current[index] = element;
            }}
            geometry={geo.core}
            renderOrder={2}
          >
            <meshStandardMaterial
              color="#0a2431"
              emissive="#3fd8ee"
              emissiveIntensity={0.6}
              roughness={0.35}
              metalness={0.6}
            />
          </mesh>
          <group
            ref={(element) => {
              reticles.current[index] = element;
            }}
            scale={0}
          >
            <mesh geometry={geo.ringA} rotation={[Math.PI / 2, 0, 0]}>
              <meshBasicMaterial
                color="#3fd8ee"
                transparent
                opacity={0.85}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                toneMapped={false}
              />
            </mesh>
            <mesh geometry={geo.ringB} rotation={[0, 0, Math.PI / 2]}>
              <meshBasicMaterial
                color="#9a8dff"
                transparent
                opacity={0.7}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                toneMapped={false}
              />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
}

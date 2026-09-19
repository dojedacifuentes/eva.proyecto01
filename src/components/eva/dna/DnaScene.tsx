'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { useEffect, useLayoutEffect, useMemo, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import { pointerSignal } from '@/lib/pointer';

/** Geometría de la hélice. Constantes, no props: la forma no cambia en runtime. */
const TURNS = 2.7;
const HEIGHT = 7.4;
const RADIUS = 1.05;
const SAMPLES = 150;
const TUBE_RADIUS = 0.058;

const CYAN = '#5fd8f4';
const VIOLET = '#9a8dff';
const WHITE = '#dff4ff';
const MAGENTA = '#f07ab9';

/**
 * Generador pseudoaleatorio con semilla. El polvo debe salir idéntico en cada
 * render: Math.random() en fase de render es impuro y da resultados inestables.
 */
function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/** Curva de un filamento: una hélice muestreada y suavizada. */
function helixCurve(phase: number) {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const t = i / SAMPLES;
    const angle = t * Math.PI * 2 * TURNS + phase;
    points.push(
      new THREE.Vector3(Math.cos(angle) * RADIUS, (t - 0.5) * HEIGHT, Math.sin(angle) * RADIUS),
    );
  }
  return new THREE.CatmullRomCurve3(points);
}

interface Geometries {
  curveA: THREE.CatmullRomCurve3;
  curveB: THREE.CatmullRomCurve3;
  tubeA: THREE.TubeGeometry;
  tubeB: THREE.TubeGeometry;
  rod: THREE.CylinderGeometry;
  node: THREE.SphereGeometry;
  spark: THREE.SphereGeometry;
}

function useGeometries(): Geometries {
  return useMemo(() => {
    const curveA = helixCurve(0);
    const curveB = helixCurve(Math.PI);
    // El cilindro nace sobre Y; se tumba sobre X una sola vez.
    const rod = new THREE.CylinderGeometry(0.022, 0.022, RADIUS * 2, 6, 1);
    rod.rotateZ(Math.PI / 2);
    return {
      curveA,
      curveB,
      tubeA: new THREE.TubeGeometry(curveA, SAMPLES, TUBE_RADIUS, 10, false),
      tubeB: new THREE.TubeGeometry(curveB, SAMPLES, TUBE_RADIUS, 10, false),
      rod,
      node: new THREE.SphereGeometry(0.075, 10, 8),
      spark: new THREE.SphereGeometry(0.11, 12, 10),
    };
  }, []);
}

/** Barras y nodos de un cuerpo: se calculan una vez, nunca por fotograma. */
function useBasePairs(pairs: number) {
  const rods = useRef<THREE.InstancedMesh>(null);
  const nodes = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();
    const position = new THREE.Vector3();
    const scale = new THREE.Vector3(1, 1, 1);
    const axis = new THREE.Vector3(0, 1, 0);

    for (let i = 0; i < pairs; i++) {
      const t = pairs === 1 ? 0.5 : i / (pairs - 1);
      const angle = t * Math.PI * 2 * TURNS;
      const y = (t - 0.5) * HEIGHT;

      position.set(0, y, 0);
      quaternion.setFromAxisAngle(axis, -angle);
      rods.current?.setMatrixAt(i, matrix.compose(position, quaternion, scale));

      for (const sign of [1, -1] as const) {
        position.set(Math.cos(angle) * RADIUS * sign, y, Math.sin(angle) * RADIUS * sign);
        nodes.current?.setMatrixAt(
          i * 2 + (sign === 1 ? 0 : 1),
          matrix.compose(position, quaternion, scale),
        );
      }
    }
    if (rods.current) rods.current.instanceMatrix.needsUpdate = true;
    if (nodes.current) nodes.current.instanceMatrix.needsUpdate = true;
  }, [pairs]);

  return { rods, nodes };
}

/* ───────────── Cuerpo principal ───────────── */

interface BodyProps {
  geo: Geometries;
  pairs: number;
  particles: number;
  reduced: boolean;
  nearRef: RefObject<number>;
  /** 0–1: la carga que deja «Utilizar», decae sola. */
  energyRef: RefObject<number>;
}

function Body({ geo, pairs, particles, reduced, nearRef, energyRef }: BodyProps) {
  const group = useRef<THREE.Group>(null);
  const strandMaterial = useRef<THREE.MeshStandardMaterial>(null);
  const nodeMaterial = useRef<THREE.MeshStandardMaterial>(null);
  const sparkA = useRef<THREE.Mesh>(null);
  const sparkB = useRef<THREE.Mesh>(null);
  const travel = useRef(0);
  const glow = useRef(0);

  const { rods, nodes } = useBasePairs(pairs);

  const dust = useMemo(() => {
    const random = seeded(0x5eed);
    const positions = new Float32Array(particles * 3);
    for (let i = 0; i < particles; i++) {
      const angle = random() * Math.PI * 2;
      const radius = RADIUS * (1.3 + random() * 2.2);
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (random() - 0.5) * HEIGHT * 1.35;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return positions;
  }, [particles]);

  useFrame((state, delta) => {
    const node = group.current;
    if (!node) return;
    const step = Math.min(delta, 0.05);
    const energy = energyRef.current ?? 0;

    if (!reduced) {
      node.rotation.y += step * (0.24 + energy * 0.5);
      node.position.y = Math.sin(state.clock.elapsedTime * 0.55) * 0.14;
    }

    // Inclinación leve hacia el puntero, con inercia.
    const nx = (pointerSignal.x / window.innerWidth) * 2 - 1;
    const ny = (pointerSignal.y / window.innerHeight) * 2 - 1;
    const tilting = pointerSignal.active && !reduced;
    node.rotation.x += ((tilting ? ny * 0.22 : 0) - node.rotation.x) * 0.06;
    node.rotation.z += ((tilting ? nx * -0.12 : 0) - node.rotation.z) * 0.06;

    // Chispa recorriendo cada filamento: la vida de fondo de la hélice.
    travel.current = (travel.current + step * (0.11 + energy * 0.5)) % 1;
    const point = geo.curveA.getPointAt(travel.current);
    sparkA.current?.position.copy(point);
    sparkB.current?.position.copy(geo.curveB.getPointAt(travel.current));
    const sparkScale = 0.8 + energy * 1.4;
    sparkA.current?.scale.setScalar(sparkScale);
    sparkB.current?.scale.setScalar(sparkScale);

    glow.current += ((nearRef.current ?? 0) - glow.current) * 0.08;
    const lift = glow.current * 1.1 + energy * 1.8;
    if (strandMaterial.current) strandMaterial.current.emissiveIntensity = 1.15 + lift;
    if (nodeMaterial.current) nodeMaterial.current.emissiveIntensity = 1.5 + lift * 1.3;
  });

  return (
    <group ref={group}>
      <mesh geometry={geo.tubeA}>
        <meshStandardMaterial
          ref={strandMaterial}
          color={CYAN}
          emissive={CYAN}
          emissiveIntensity={1.15}
          metalness={0.75}
          roughness={0.22}
        />
      </mesh>
      <mesh geometry={geo.tubeB}>
        <meshStandardMaterial
          color={VIOLET}
          emissive={VIOLET}
          emissiveIntensity={1.05}
          metalness={0.75}
          roughness={0.22}
        />
      </mesh>

      <instancedMesh ref={rods} args={[geo.rod, undefined, pairs]}>
        <meshStandardMaterial
          color={WHITE}
          emissive={CYAN}
          emissiveIntensity={0.55}
          metalness={0.9}
          roughness={0.35}
          transparent
          opacity={0.72}
        />
      </instancedMesh>

      <instancedMesh ref={nodes} args={[geo.node, undefined, pairs * 2]}>
        <meshStandardMaterial
          ref={nodeMaterial}
          color={WHITE}
          emissive={WHITE}
          emissiveIntensity={1.5}
          metalness={0.4}
          roughness={0.15}
        />
      </instancedMesh>

      <mesh ref={sparkA} geometry={geo.spark}>
        <meshBasicMaterial color={WHITE} toneMapped={false} />
      </mesh>
      <mesh ref={sparkB} geometry={geo.spark}>
        <meshBasicMaterial color={CYAN} toneMapped={false} />
      </mesh>

      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dust, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.045}
          color={CYAN}
          transparent
          opacity={0.55}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

/* ───────────── Copias ───────────── */

/**
 * Una copia: sólo los dos filamentos, translúcidos y desplazados. Sin barras ni
 * nodos — se lee igual como copia y cuesta una fracción.
 */
function Clone({ geo, index, reduced }: { geo: Geometries; index: number; reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const side = index % 2 === 0 ? 1 : -1;
  const rank = Math.floor(index / 2) + 1;

  useFrame((state, delta) => {
    const node = group.current;
    if (!node) return;
    if (!reduced) node.rotation.y += Math.min(delta, 0.05) * (0.24 + index * 0.05) * side;
    // Se separa del original y vuelve, como si no terminara de cuajar.
    const wander = Math.sin(state.clock.elapsedTime * 0.35 + index) * 0.22;
    node.position.x = side * rank * (1.5 + wander * 0.4);
    node.position.z = -rank * 0.9;
    node.position.y = wander;
  });

  const opacity = Math.max(0.12, 0.34 - index * 0.05);

  return (
    <group ref={group} scale={0.82 - index * 0.05}>
      <mesh geometry={geo.tubeA}>
        <meshBasicMaterial color={MAGENTA} transparent opacity={opacity} toneMapped={false} />
      </mesh>
      <mesh geometry={geo.tubeB}>
        <meshBasicMaterial color={VIOLET} transparent opacity={opacity} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ───────────── Escena ───────────── */

function Stage({ pairs, particles, reduced, clones, pulse, nearRef }: SceneProps) {
  const geo = useGeometries();
  const energyRef = useRef(0);
  /* Encuadre: la escena se encoge a medida que aparecen copias, en vez de mover
     la cámara (que es valor de hook y no se puede mutar). */
  const frame = useRef<THREE.Group>(null);

  /* Cada «Utilizar» recarga la energía; el fotograma la va apagando. */
  useEffect(() => {
    if (pulse > 0) energyRef.current = 1;
  }, [pulse]);

  useFrame((_, delta) => {
    const step = Math.min(delta, 0.05);
    energyRef.current = Math.max(0, energyRef.current - step * 0.42);
    const node = frame.current;
    if (node) {
      const target = 1 / (1 + clones * 0.16);
      node.scale.setScalar(node.scale.x + (target - node.scale.x) * Math.min(1, step * 2.4));
    }
  });

  return (
    <group ref={frame}>
      <Body
        geo={geo}
        pairs={pairs}
        particles={particles}
        reduced={reduced}
        nearRef={nearRef}
        energyRef={energyRef}
      />
      {Array.from({ length: clones }, (_, index) => (
        <Clone key={index} geo={geo} index={index} reduced={reduced} />
      ))}
    </group>
  );
}

export interface SceneProps {
  pairs: number;
  particles: number;
  reduced: boolean;
  /** Copias activas además del original. */
  clones: number;
  /** Contador de pulsaciones de «Utilizar»: al subir, enciende la hélice. */
  pulse: number;
  nearRef: RefObject<number>;
}

export interface DnaSceneProps extends SceneProps {
  /** `never` congela el bucle cuando la hélice sale de pantalla. */
  active: boolean;
}

export default function DnaScene({ active, clones, ...scene }: DnaSceneProps) {
  return (
    <Canvas
      dpr={[1, 1.6]}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0, 9.2], fov: 32 }}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      style={{ pointerEvents: 'none' }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[3, 3, 4]} intensity={28} color={CYAN} />
      <pointLight position={[-3.5, -2, 2]} intensity={18} color={VIOLET} />
      <pointLight position={[0, 0, -5]} intensity={12} color={WHITE} />

      <Stage clones={clones} {...scene} />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.9} luminanceThreshold={0.18} luminanceSmoothing={0.35} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}

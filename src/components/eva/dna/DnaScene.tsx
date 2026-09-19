'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { useLayoutEffect, useMemo, useRef, type RefObject } from 'react';
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

/** Un filamento: puntos sobre una hélice y un tubo a lo largo de la curva. */
function strandGeometry(phase: number) {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const t = i / SAMPLES;
    const angle = t * Math.PI * 2 * TURNS + phase;
    points.push(
      new THREE.Vector3(Math.cos(angle) * RADIUS, (t - 0.5) * HEIGHT, Math.sin(angle) * RADIUS),
    );
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), SAMPLES, TUBE_RADIUS, 10, false);
}

interface HelixProps {
  pairs: number;
  particles: number;
  reduced: boolean;
  /** 0–1: cuánto se acerca el puntero al área. Lo escribe el envoltorio. */
  nearRef: RefObject<number>;
}

function Helix({ pairs, particles, reduced, nearRef }: HelixProps) {
  const group = useRef<THREE.Group>(null);
  const rods = useRef<THREE.InstancedMesh>(null);
  const nodes = useRef<THREE.InstancedMesh>(null);
  const strandMaterial = useRef<THREE.MeshStandardMaterial>(null);
  const nodeMaterial = useRef<THREE.MeshStandardMaterial>(null);
  const glow = useRef(0);

  const strandA = useMemo(() => strandGeometry(0), []);
  const strandB = useMemo(() => strandGeometry(Math.PI), []);

  /** El cilindro nace sobre Y; se tumba sobre X una sola vez. */
  const rodGeometry = useMemo(() => {
    const geometry = new THREE.CylinderGeometry(0.022, 0.022, RADIUS * 2, 6, 1);
    geometry.rotateZ(Math.PI / 2);
    return geometry;
  }, []);
  const nodeGeometry = useMemo(() => new THREE.SphereGeometry(0.075, 10, 8), []);

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

  /* Las matrices de barras y nodos se calculan una vez, no por fotograma. */
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

      // Un nodo en cada extremo de la barra.
      for (const sign of [1, -1] as const) {
        position.set(Math.cos(angle) * RADIUS * sign, y, Math.sin(angle) * RADIUS * sign);
        nodes.current?.setMatrixAt(i * 2 + (sign === 1 ? 0 : 1), matrix.compose(position, quaternion, scale));
      }
    }
    if (rods.current) rods.current.instanceMatrix.needsUpdate = true;
    if (nodes.current) nodes.current.instanceMatrix.needsUpdate = true;
  }, [pairs]);

  useFrame((state, delta) => {
    const node = group.current;
    if (!node) return;

    const step = Math.min(delta, 0.05);
    if (!reduced) {
      node.rotation.y += step * 0.24;
      node.position.y = Math.sin(state.clock.elapsedTime * 0.55) * 0.14;
    }

    // Inclinación leve hacia el puntero, con inercia.
    const nx = (pointerSignal.x / window.innerWidth) * 2 - 1;
    const ny = (pointerSignal.y / window.innerHeight) * 2 - 1;
    const active = pointerSignal.active && !reduced;
    node.rotation.x += ((active ? ny * 0.22 : 0) - node.rotation.x) * 0.06;
    node.rotation.z += ((active ? nx * -0.12 : 0) - node.rotation.z) * 0.06;

    // Cerca del puntero, la hélice se enciende un poco más.
    glow.current += ((nearRef.current ?? 0) - glow.current) * 0.08;
    if (strandMaterial.current) strandMaterial.current.emissiveIntensity = 1.15 + glow.current * 1.1;
    if (nodeMaterial.current) nodeMaterial.current.emissiveIntensity = 1.5 + glow.current * 1.4;
  });

  return (
    <group ref={group} scale={0.98}>
      <mesh geometry={strandA}>
        <meshStandardMaterial
          ref={strandMaterial}
          color={CYAN}
          emissive={CYAN}
          emissiveIntensity={1.15}
          metalness={0.75}
          roughness={0.22}
        />
      </mesh>
      <mesh geometry={strandB}>
        <meshStandardMaterial
          color={VIOLET}
          emissive={VIOLET}
          emissiveIntensity={1.05}
          metalness={0.75}
          roughness={0.22}
        />
      </mesh>

      <instancedMesh ref={rods} args={[rodGeometry, undefined, pairs]}>
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

      <instancedMesh ref={nodes} args={[nodeGeometry, undefined, pairs * 2]}>
        <meshStandardMaterial
          ref={nodeMaterial}
          color={WHITE}
          emissive={WHITE}
          emissiveIntensity={1.5}
          metalness={0.4}
          roughness={0.15}
        />
      </instancedMesh>

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

export interface DnaSceneProps {
  pairs: number;
  particles: number;
  reduced: boolean;
  /** `never` congela el bucle cuando la hélice sale de pantalla. */
  active: boolean;
  nearRef: RefObject<number>;
}

export default function DnaScene({ pairs, particles, reduced, active, nearRef }: DnaSceneProps) {
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

      <Helix pairs={pairs} particles={particles} reduced={reduced} nearRef={nearRef} />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.9} luminanceThreshold={0.18} luminanceSmoothing={0.35} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}

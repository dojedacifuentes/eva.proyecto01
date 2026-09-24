'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import { ComposerSizeGuard } from '@/components/eva/ComposerSizeGuard';
import { pointerSignal } from '@/lib/pointer';
import { spinSignal } from '@/lib/spin';

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

/** Cuánto dura un barrido de escaneo, en segundos. */
const SCAN_SECONDS = 1.9;
/** Desplegado: subida, tiempo abierta y bajada, en segundos. */
const UNWIND_RAMP = 0.9;
const UNWIND_HOLD = 3.2;

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

/** La misma hélice desenrollada: una vertical a cada lado, sin vueltas. */
function ladderCurve(side: number) {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const t = i / SAMPLES;
    points.push(new THREE.Vector3(side * RADIUS, (t - 0.5) * HEIGHT, 0));
  }
  return new THREE.CatmullRomCurve3(points);
}

/**
 * Cuelga del tubo helicoidal un objetivo de morph con la forma desplegada.
 * Mismos parámetros de TubeGeometry ⇒ mismo número de vértices, que es lo que
 * exige un morph target absoluto.
 */
function withLadderMorph(tube: THREE.TubeGeometry, side: number) {
  const ladder = new THREE.TubeGeometry(ladderCurve(side), SAMPLES, TUBE_RADIUS, 10, false);
  tube.morphAttributes.position = [
    new THREE.Float32BufferAttribute(Float32Array.from(ladder.attributes.position.array), 3),
  ];
  tube.morphTargetsRelative = false;
  ladder.dispose();
  return tube;
}

interface Geometries {
  curveA: THREE.CatmullRomCurve3;
  curveB: THREE.CatmullRomCurve3;
  tubeA: THREE.TubeGeometry;
  tubeB: THREE.TubeGeometry;
  rod: THREE.CylinderGeometry;
  node: THREE.SphereGeometry;
  spark: THREE.SphereGeometry;
  ring: THREE.RingGeometry;
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
      tubeA: withLadderMorph(new THREE.TubeGeometry(curveA, SAMPLES, TUBE_RADIUS, 10, false), 1),
      tubeB: withLadderMorph(new THREE.TubeGeometry(curveB, SAMPLES, TUBE_RADIUS, 10, false), -1),
      rod,
      node: new THREE.SphereGeometry(0.075, 10, 8),
      spark: new THREE.SphereGeometry(0.11, 12, 10),
      ring: new THREE.RingGeometry(RADIUS * 0.25, RADIUS * 2.1, 56),
    };
  }, []);
}

/**
 * Barras y nodos de un cuerpo. Se escriben una vez en reposo y sólo se vuelven
 * a escribir mientras la hélice se despliega: `unwind` va de 0 (enrollada) a 1
 * (escalera plana) reduciendo el ángulo de cada par.
 */
function useBasePairs(pairs: number) {
  const rods = useRef<THREE.InstancedMesh>(null);
  const nodes = useRef<THREE.InstancedMesh>(null);
  const scratch = useMemo(
    () => ({
      matrix: new THREE.Matrix4(),
      quaternion: new THREE.Quaternion(),
      position: new THREE.Vector3(),
      scale: new THREE.Vector3(1, 1, 1),
      axis: new THREE.Vector3(0, 1, 0),
    }),
    [],
  );

  const write = useCallback(
    (unwind: number) => {
      const { matrix, quaternion, position, scale, axis } = scratch;
      for (let i = 0; i < pairs; i++) {
        const t = pairs === 1 ? 0.5 : i / (pairs - 1);
        const angle = t * Math.PI * 2 * TURNS * (1 - unwind);
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
    },
    [pairs, scratch],
  );

  useLayoutEffect(() => write(0), [write]);

  return { rods, nodes, write };
}

/** Señales que los botones encienden y el bucle de render va apagando. */
interface Signals {
  energy: RefObject<number>;
  mutation: RefObject<number>;
  /** Progreso del barrido, 0–1; por encima de 1 está en reposo. */
  scan: RefObject<number>;
  /** 0 enrollada, 1 escalera plana. */
  unwind: RefObject<number>;
  near: RefObject<number>;
}

/* ───────────── Cuerpo principal ───────────── */

interface BodyProps {
  geo: Geometries;
  pairs: number;
  particles: number;
  reduced: boolean;
  signals: Signals;
}

function Body({ geo, pairs, particles, reduced, signals }: BodyProps) {
  const group = useRef<THREE.Group>(null);
  const shake = useRef<THREE.Group>(null);
  const strandMaterial = useRef<THREE.MeshStandardMaterial>(null);
  const nodeMaterial = useRef<THREE.MeshStandardMaterial>(null);
  const sparkA = useRef<THREE.Mesh>(null);
  const sparkB = useRef<THREE.Mesh>(null);
  const strandA = useRef<THREE.Mesh>(null);
  const strandB = useRef<THREE.Mesh>(null);
  const travel = useRef(0);
  const glow = useRef(0);
  const lastUnwind = useRef(0);

  const { rods, nodes, write } = useBasePairs(pairs);

  /*
   * R3F asigna la geometría después de construir la malla, así que el
   * constructor de Mesh no llega a ver los morph targets y deja
   * `morphTargetInfluences` sin crear. three.js lo lee en cada fotograma y
   * revienta el bucle entero: hay que pedirlo a mano, antes del primer pintado.
   */
  useLayoutEffect(() => {
    strandA.current?.updateMorphTargets();
    strandB.current?.updateMorphTargets();
  }, []);
  const tints = useMemo(
    () => ({ base: new THREE.Color(CYAN), mutated: new THREE.Color(MAGENTA) }),
    [],
  );

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
    const time = state.clock.elapsedTime;
    const energy = signals.energy.current ?? 0;
    const mutation = signals.mutation.current ?? 0;

    // Giro: el automático se aparta mientras se arrastra, y el impulso frena solo.
    const auto = spinSignal.dragging ? 0 : step * (0.24 + energy * 0.5 + mutation * 0.7);
    if (!reduced) {
      node.rotation.y += auto + spinSignal.velocity;
      node.position.y = Math.sin(time * 0.55) * 0.14;
    }
    spinSignal.velocity *= 0.93;
    if (Math.abs(spinSignal.velocity) < 0.0002) spinSignal.velocity = 0;

    // Desplegado: los tubos hacen morph y las barras se reescriben con él.
    const unwind = signals.unwind.current ?? 0;
    if (Math.abs(unwind - lastUnwind.current) > 0.002) {
      write(unwind);
      lastUnwind.current = unwind;
    }
    if (strandA.current?.morphTargetInfluences) strandA.current.morphTargetInfluences[0] = unwind;
    if (strandB.current?.morphTargetInfluences) strandB.current.morphTargetInfluences[0] = unwind;

    // Inclinación leve hacia el puntero, con inercia.
    const nx = (pointerSignal.x / window.innerWidth) * 2 - 1;
    const ny = (pointerSignal.y / window.innerHeight) * 2 - 1;
    const tilting = pointerSignal.active && !reduced;
    node.rotation.x += ((tilting ? ny * 0.22 : 0) - node.rotation.x) * 0.06;
    node.rotation.z += ((tilting ? nx * -0.12 : 0) - node.rotation.z) * 0.06;

    // La mutación sacude un grupo interior, para no pelearse con la inclinación.
    const inner = shake.current;
    if (inner) {
      inner.rotation.z = Math.sin(time * 37) * 0.055 * mutation;
      inner.scale.setScalar(1 + Math.sin(time * 29) * 0.06 * mutation);
    }

    // Chispa recorriendo cada filamento: la vida de fondo de la hélice.
    travel.current = (travel.current + step * (0.11 + energy * 0.5)) % 1;
    sparkA.current?.position.copy(geo.curveA.getPointAt(travel.current));
    sparkB.current?.position.copy(geo.curveB.getPointAt(travel.current));
    const sparkScale = 0.8 + energy * 1.4 + mutation * 0.8;
    sparkA.current?.scale.setScalar(sparkScale);
    sparkB.current?.scale.setScalar(sparkScale);

    glow.current += ((signals.near.current ?? 0) - glow.current) * 0.08;
    const lift = glow.current * 1.1 + energy * 1.8 + mutation * 1.2;
    if (strandMaterial.current) {
      strandMaterial.current.emissiveIntensity = 0.82 + lift;
      strandMaterial.current.color.lerpColors(tints.base, tints.mutated, mutation);
      strandMaterial.current.emissive.lerpColors(tints.base, tints.mutated, mutation);
    }
    if (nodeMaterial.current) nodeMaterial.current.emissiveIntensity = 1.05 + lift * 1.3;
  });

  return (
    <group ref={group}>
      <group ref={shake}>
        <mesh ref={strandA} geometry={geo.tubeA}>
          <meshStandardMaterial
            ref={strandMaterial}
            color={CYAN}
            emissive={CYAN}
            emissiveIntensity={0.82}
            metalness={0.75}
            roughness={0.22}
          />
        </mesh>
        <mesh ref={strandB} geometry={geo.tubeB}>
          <meshStandardMaterial
            color={VIOLET}
            emissive={VIOLET}
            emissiveIntensity={0.76}
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
      </group>

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

/* ───────────── Barrido de escaneo ───────────── */

/** Un anillo luminoso que recorre la hélice de abajo arriba. */
function ScanRing({ geo, scan }: { geo: Geometries; scan: RefObject<number> }) {
  const mesh = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(() => {
    const node = mesh.current;
    if (!node) return;
    const progress = scan.current ?? 2;
    const running = progress >= 0 && progress <= 1;
    node.visible = running;
    if (!running) return;
    node.position.y = (progress - 0.5) * HEIGHT * 1.12;
    // Entra y sale con un seno: sin cortes al principio ni al final.
    if (material.current) material.current.opacity = Math.sin(progress * Math.PI) * 0.55;
  });

  return (
    <mesh ref={mesh} geometry={geo.ring} rotation={[Math.PI / 2, 0, 0]} visible={false}>
      <meshBasicMaterial
        ref={material}
        color={WHITE}
        transparent
        opacity={0}
        side={THREE.DoubleSide}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
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

  /*
   * Los tubos llevan morph targets para el desplegado, y R3F asigna la
   * geometría después de construir la malla: sin esto, la copia se dibuja sin
   * `morphTargetInfluences` y three.js aborta el fotograma al llegar a ella —
   * el original se veía y las copias no.
   */
  const initMorph = useCallback((mesh: THREE.Mesh | null) => {
    mesh?.updateMorphTargets();
  }, []);

  useFrame((state, delta) => {
    const node = group.current;
    if (!node) return;
    if (!reduced) node.rotation.y += Math.min(delta, 0.05) * (0.24 + index * 0.05) * side;
    // Se separa del original y vuelve, como si no terminara de cuajar.
    const wander = Math.sin(state.clock.elapsedTime * 0.35 + index) * 0.22;
    node.position.x = side * rank * (2.15 + wander * 0.4);
    node.position.z = -rank * 0.8;
    node.position.y = wander;
  });

  const opacity = Math.max(0.2, 0.46 - index * 0.05);

  return (
    <group ref={group} scale={0.82 - index * 0.05}>
      <mesh ref={initMorph} geometry={geo.tubeA}>
        <meshBasicMaterial color={MAGENTA} transparent opacity={opacity} toneMapped={false} />
      </mesh>
      <mesh ref={initMorph} geometry={geo.tubeB}>
        <meshBasicMaterial color={VIOLET} transparent opacity={opacity} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ───────────── Escena ───────────── */

function Stage({ pairs, particles, reduced, clones, pulse, mutate, scan, unwind, express, nearRef }: SceneProps) {
  const geo = useGeometries();
  const frame = useRef<THREE.Group>(null);
  const narrow = useThree((state) => state.size.width < state.size.height);
  const energy = useRef(0);
  const mutation = useRef(0);
  const scanProgress = useRef(2);
  const unwindValue = useRef(0);
  /** Segundos desde que empezó el desplegado; negativo en reposo. */
  const unwindPhase = useRef(-1);

  /* Cada pulsación recarga su señal; el fotograma la va apagando. */
  useEffect(() => {
    if (pulse > 0) energy.current = 1;
  }, [pulse]);
  useEffect(() => {
    if (mutate > 0) mutation.current = 1;
  }, [mutate]);
  useEffect(() => {
    if (scan > 0) scanProgress.current = 0;
  }, [scan]);
  useEffect(() => {
    if (unwind > 0) unwindPhase.current = 0;
  }, [unwind]);
  /* Expresar: la hélice entera se enciende y un barrido la recorre de abajo arriba. */
  useEffect(() => {
    if (express === 0) return;
    energy.current = 1;
    scanProgress.current = 0;
  }, [express]);

  useFrame((_, delta) => {
    const step = Math.min(delta, 0.05);
    energy.current = Math.max(0, energy.current - step * 0.42);
    mutation.current = Math.max(0, mutation.current - step * 0.5);
    if (scanProgress.current <= 1) scanProgress.current += step / SCAN_SECONDS;

    // Desplegado: abre, se queda abierta y vuelve a enrollarse.
    if (unwindPhase.current >= 0) {
      unwindPhase.current += step;
      const at = unwindPhase.current;
      const closing = UNWIND_RAMP + UNWIND_HOLD;
      if (at < UNWIND_RAMP) unwindValue.current = at / UNWIND_RAMP;
      else if (at < closing) unwindValue.current = 1;
      else if (at < closing + UNWIND_RAMP) unwindValue.current = 1 - (at - closing) / UNWIND_RAMP;
      else {
        unwindValue.current = 0;
        unwindPhase.current = -1;
      }
    }

    /* Encuadre: la escena se encoge a medida que aparecen copias, en vez de
       mover la cámara (que es valor de hook y no se puede mutar). En un lienzo
       vertical —móvil— las copias se abren hacia los lados y hay menos ancho:
       se encoge más, para que sigan cabiendo. */
    const node = frame.current;
    if (node) {
      const target = 1 / (1 + clones * (narrow ? 0.36 : 0.21));
      node.scale.setScalar(node.scale.x + (target - node.scale.x) * Math.min(1, step * 2.4));
    }
  });

  const signals: Signals = {
    energy,
    mutation,
    scan: scanProgress,
    unwind: unwindValue,
    near: nearRef,
  };

  return (
    <group ref={frame}>
      <Body geo={geo} pairs={pairs} particles={particles} reduced={reduced} signals={signals} />
      <ScanRing geo={geo} scan={scanProgress} />
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
  /** Contadores de pulsación: al subir, encienden su señal. */
  pulse: number;
  mutate: number;
  scan: number;
  unwind: number;
  express: number;
  nearRef: RefObject<number>;
}

export interface DnaSceneProps extends SceneProps {
  /** `false` deja el bucle a demanda cuando la hélice sale de pantalla. */
  active: boolean;
  /**
   * `low` en móvil o con la calidad medida por los suelos: sin postprocesado y
   * con menos resolución. El bloom es lo más caro de la escena, y en un teléfono
   * convive con el cerebro una pantalla más arriba. `mid` conserva el bloom y
   * recorta píxeles.
   */
  quality?: 'low' | 'mid' | 'high';
}

const DPR: Record<NonNullable<DnaSceneProps['quality']>, [number, number]> = {
  low: [1, 1.2],
  mid: [1, 1.4],
  high: [1, 1.6],
};

export default function DnaScene({ active, quality = 'high', ...scene }: DnaSceneProps) {
  const low = quality === 'low';
  return (
    <Canvas
      dpr={DPR[quality]}
      /* A demanda y no `never`: inactiva no se anima, pero pinta su primer
         fotograma y se repinta si el lienzo cambia de tamaño. */
      frameloop={active ? 'always' : 'demand'}
      camera={{ position: [0, 0, 9.2], fov: 32 }}
      gl={{ antialias: low, alpha: true, powerPreference: 'high-performance' }}
      style={{ pointerEvents: 'none' }}
    >
      <ambientLight intensity={0.46} />
      <pointLight position={[3, 3, 4]} intensity={18} color={CYAN} />
      <pointLight position={[-3.5, -2, 2]} intensity={13} color={VIOLET} />
      <pointLight position={[0, 0, -5]} intensity={8} color={WHITE} />

      <Stage {...scene} />

      {!low && (
        <EffectComposer enableNormalPass={false}>
          {/* Más contenido desde la v8: la hélice se integra en el fondo oscuro en vez de deslumbrar. */}
          <Bloom intensity={0.42} luminanceThreshold={0.34} luminanceSmoothing={0.4} mipmapBlur />
        </EffectComposer>
      )}
      <ComposerSizeGuard />
    </Canvas>
  );
}

'use client';

import { OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { useEffect, useMemo, useRef, type ComponentRef } from 'react';
import * as THREE from 'three';
import type { BrainZone } from '@/content/neuroscan';
import { BrainShell } from './BrainShell';
import { NeuralNetwork } from './NeuralNetwork';
import { buildBrain, type BrainData, type Detail } from './neural-data';
import { coreSignal, resetCoreSignal } from './neural-signal';

const CYAN = '#3fd8ee';
const VIOLET = '#9a8dff';
const WHITE = '#dff4ff';

/** Escala del cerebro en la escena: las unidades de cerebro miden ~2 de largo. */
const SCALE = 1.5;
/** Posición inicial de la cámara: tres cuartos, un poco por encima. */
const HOME = new THREE.Vector3(2.9, 1.8, 4.7);
const ORIGIN = new THREE.Vector3(0, 0, 0);
/** Giro automático en reposo, en radianes por segundo: una vuelta cada ~50 s. */
const SPIN = 0.125;

type Controls = ComponentRef<typeof OrbitControls>;

/* ───────────── Cámara de diagnóstico ───────────── */

/** Halo radial pintado en un lienzo: no hay imagen que descargar ni licenciar. */
function haloTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (context) {
    const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(63, 216, 238, 0.5)');
    gradient.addColorStop(0.42, 'rgba(154, 141, 255, 0.16)');
    gradient.addColorStop(1, 'rgba(154, 141, 255, 0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Dos anillos finos que giran alrededor del cerebro y un halo detrás. */
function Chamber({ reduced }: { reduced: boolean }) {
  const outer = useRef<THREE.Mesh>(null);
  const inner = useRef<THREE.Mesh>(null);
  const halo = useMemo(() => haloTexture(), []);
  useEffect(() => () => halo.dispose(), [halo]);

  useFrame((_, delta) => {
    if (reduced) return;
    const step = Math.min(delta, 0.05);
    if (outer.current) outer.current.rotation.z += step * 0.06;
    if (inner.current) inner.current.rotation.y += step * 0.09;
  });

  return (
    <group>
      <sprite scale={[6, 6, 1]} position={[0, -0.1, -1.6]}>
        <spriteMaterial
          map={halo}
          transparent
          opacity={0.32}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </sprite>
      <mesh ref={outer} rotation={[Math.PI / 2 + 0.22, 0, 0]}>
        <torusGeometry args={[2.85, 0.006, 6, 160]} />
        <meshBasicMaterial
          color={CYAN}
          transparent
          opacity={0.22}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={inner} rotation={[0.35, 0, 0.55]}>
        <torusGeometry args={[3.2, 0.004, 6, 160]} />
        <meshBasicMaterial
          color={VIOLET}
          transparent
          opacity={0.16}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/* ───────────── Escenario ───────────── */

interface StageProps {
  data: BrainData;
  detail: Detail;
  zones: readonly BrainZone[];
  reduced: boolean;
  selected: number;
  hovered: number;
  alert: number;
  reset: number;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}

/**
 * El cerebro y su cámara. El giro automático, la respiración, el enfoque de
 * la región seleccionada y el restablecimiento se animan aquí, sobre el grupo
 * del cerebro y sobre la cámara que entrega el bucle; los controles de órbita
 * ponen lo demás.
 */
function Stage({ data, detail, zones, reduced, selected, hovered, alert, reset, onHover, onSelect }: StageProps) {
  const brain = useRef<THREE.Group>(null);
  const controls = useRef<Controls>(null);
  const camera = useThree((state) => state.camera);
  const spin = useRef(SPIN);
  /** Ángulo objetivo del cerebro mientras se enfoca una región; null en reposo. */
  const yaw = useRef<number | null>(null);
  const resetting = useRef(false);

  /* Al seleccionar, el cerebro gira hasta poner la región de cara a la cámara. */
  useEffect(() => {
    if (selected < 0) return;
    const node = data.hubNode[selected];
    const hubAngle = Math.atan2(data.positions[node * 3], data.positions[node * 3 + 2]);
    const cameraAngle = Math.atan2(camera.position.x, camera.position.z);
    yaw.current = cameraAngle - hubAngle;
  }, [selected, data, camera]);

  /* Restablecer desde el botón: cámara, encuadre y giro vuelven al inicio. */
  useEffect(() => {
    if (reset > 0) coreSignal.resetRequested = true;
  }, [reset]);

  useFrame((state, delta) => {
    const group = brain.current;
    const orbit = controls.current;
    if (!group) return;
    const step = Math.min(delta, 0.05);
    const time = state.clock.elapsedTime;

    if (coreSignal.resetRequested) {
      coreSignal.resetRequested = false;
      resetting.current = true;
      yaw.current = 0;
    }

    // Giro automático: se frena sobre una región y se para al arrastrar o con movimiento reducido.
    const target = reduced || coreSignal.dragging ? 0 : coreSignal.hovering ? SPIN * 0.15 : SPIN;
    spin.current += (target - spin.current) * Math.min(1, step * 3);

    if (yaw.current !== null) {
      const raw = yaw.current - group.rotation.y;
      const diff = Math.atan2(Math.sin(raw), Math.cos(raw));
      group.rotation.y += diff * Math.min(1, step * 2.6);
      if (Math.abs(diff) < 0.01) yaw.current = null;
    } else {
      group.rotation.y += spin.current * step;
    }

    // Respiración: flota, se hincha apenas y cabecea muy despacio.
    if (!reduced) {
      group.position.y = Math.sin(time * 0.5) * 0.05;
      group.scale.setScalar(SCALE * (1 + Math.sin(time * 0.9) * 0.006));
      group.rotation.x = Math.sin(time * 0.31) * 0.03;
    }

    if (resetting.current && orbit) {
      const ease = Math.min(1, step * 3.2);
      state.camera.position.lerp(HOME, ease);
      orbit.target.lerp(ORIGIN, ease);
      if (state.camera.position.distanceTo(HOME) < 0.01 && orbit.target.lengthSq() < 0.0001) {
        resetting.current = false;
      }
    }
  });

  return (
    <>
      <group ref={brain} scale={SCALE}>
        <BrainShell detail={detail} reduced={reduced} />
        <NeuralNetwork
          data={data}
          detail={detail}
          zones={zones}
          reduced={reduced}
          selected={selected}
          hovered={hovered}
          alert={alert}
          onHover={onHover}
          onSelect={onSelect}
        />
      </group>
      <OrbitControls
        ref={controls}
        makeDefault
        enableDamping
        dampingFactor={0.08}
        enablePan={false}
        minDistance={3.8}
        maxDistance={8.2}
        minPolarAngle={0.45}
        maxPolarAngle={2.35}
        rotateSpeed={0.55}
        zoomSpeed={0.6}
        onStart={() => {
          coreSignal.dragging = true;
          resetting.current = false;
          yaw.current = null;
        }}
        onEnd={() => {
          coreSignal.dragging = false;
        }}
      />
    </>
  );
}

/* ───────────── Escena ───────────── */

export interface NeuralSceneProps {
  detail: Detail;
  zones: readonly BrainZone[];
  reduced: boolean;
  /** Identificador de la región seleccionada, o null. */
  selected: string | null;
  /** Identificador de la región previsualizada desde la capa HTML, o null. */
  hovered: string | null;
  /** Identificador de la región que se enciende en magenta al seleccionarla. */
  alert: string;
  /** Contador: al subir, la cámara y el cerebro vuelven a su sitio. */
  reset: number;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  onReady: (stats: { neurons: number; synapses: number }) => void;
}

export default function NeuralScene({
  detail,
  zones,
  reduced,
  selected,
  hovered,
  alert,
  reset,
  onHover,
  onSelect,
  onReady,
}: NeuralSceneProps) {
  const data = useMemo(() => buildBrain(detail, zones), [detail, zones]);
  const selectedIndex = selected ? zones.findIndex((zone) => zone.id === selected) : -1;
  const hoveredIndex = hovered ? zones.findIndex((zone) => zone.id === hovered) : -1;
  const alertIndex = zones.findIndex((zone) => zone.id === alert);

  useEffect(() => {
    resetCoreSignal();
    return resetCoreSignal;
  }, []);

  return (
    <Canvas
      dpr={detail.dpr}
      frameloop="always"
      camera={{ position: HOME.toArray(), fov: 34, near: 0.1, far: 60 }}
      gl={{ antialias: detail.bloom === 0, alpha: true, powerPreference: 'high-performance' }}
      onCreated={() => onReady({ neurons: data.count, synapses: data.edgeCount })}
      onPointerMissed={(event) => {
        // Doble clic en el vacío: la cámara vuelve. Sobre una región no cuenta.
        if (event.type === 'dblclick') coreSignal.resetRequested = true;
      }}
    >
      <ambientLight intensity={0.35} />
      <pointLight position={[3.5, 3, 4]} intensity={22} color={CYAN} />
      <pointLight position={[-4, -1.5, -3.5]} intensity={28} color={VIOLET} />
      <directionalLight position={[-2, 4, 1]} intensity={0.5} color={WHITE} />

      <Chamber reduced={reduced} />
      <Stage
        data={data}
        detail={detail}
        zones={zones}
        reduced={reduced}
        selected={selectedIndex}
        hovered={hoveredIndex}
        alert={alertIndex}
        reset={reset}
        onHover={onHover}
        onSelect={onSelect}
      />

      {detail.bloom > 0 && (
        <EffectComposer multisampling={detail.multisampling} enableNormalPass={false}>
          <Bloom
            intensity={detail.bloom}
            luminanceThreshold={0.5}
            luminanceSmoothing={0.35}
            mipmapBlur
            radius={0.72}
          />
        </EffectComposer>
      )}
    </Canvas>
  );
}

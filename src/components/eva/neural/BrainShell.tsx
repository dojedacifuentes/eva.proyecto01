'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { FOLD_DEPTH, fold, hemisphere, type Detail } from './neural-data';
import { coreSignal } from './neural-signal';

/**
 * Corteza del núcleo: dos hemisferios, cerebelo y tronco en una sola malla,
 * con un material propio. La superficie es oscura y translúcida —deja ver la
 * red de dentro—, se enciende en los bordes (fresnel) y traza con luz el fondo
 * de cada surco. Una banda de escaneo la recorre de abajo arriba.
 *
 * Los surcos se calculan por vértice en JavaScript y viajan como atributo:
 * así el sombreador no repite el ruido por píxel y el móvil lo agradece.
 */

const VERTEX = /* glsl */ `
  attribute float aFold;
  varying float vFold;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vLocal;

  void main() {
    vFold = aFold;
    vLocal = position;
    vec4 view = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-view.xyz);
    gl_Position = projectionMatrix * view;
  }
`;

const FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  uniform float uActivity;
  uniform float uSweep;
  uniform vec3 uBase;
  uniform vec3 uRim;
  uniform vec3 uBack;
  uniform vec3 uSpec;
  uniform vec3 uLine;
  uniform vec3 uFocus;
  uniform float uFocusStrength;
  varying float vFold;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vLocal;

  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vView);
    float fresnel = pow(1.0 - max(dot(n, v), 0.0), 3.0);

    // Luz fría lateral y contraluz violeta, fijas respecto a la cámara: la corteza
    // se lee desde cualquier ángulo. El reflejo es duro y pequeño, como sobre vidrio.
    vec3 key = normalize(vec3(0.55, 0.7, 0.45));
    vec3 back = normalize(vec3(-0.6, -0.15, -0.75));
    float diffuse = max(dot(n, key), 0.0);
    float counter = max(dot(n, back), 0.0);
    float spec = pow(max(dot(reflect(-key, n), v), 0.0), 48.0);

    // Un trazo fino en el fondo de cada surco, con un latido lento que viaja de atrás adelante.
    float line = smoothstep(0.62, 0.95, vFold);
    float pulse = 0.55 + 0.45 * sin(uTime * 0.7 + vLocal.z * 2.4 + vLocal.y * 1.6);
    // Banda de escaneo: una franja horizontal que sube por la corteza.
    float sweep = exp(-pow((vLocal.y - uSweep) * 7.0, 2.0));
    // Foco: la región previsualizada se ilumina alrededor de su nodo.
    vec3 toFocus = vLocal - uFocus;
    float focus = exp(-dot(toFocus, toFocus) * 9.0) * uFocusStrength;

    float glow = line * (0.3 + 0.7 * pulse) * (0.6 + uActivity)
      + line * sweep * 1.4
      + focus * (0.3 + line);
    vec3 color = uBase * (0.45 + diffuse * 0.75)
      + uRim * fresnel
      + uBack * counter
      + uSpec * spec * 0.45
      + uLine * glow;
    float alpha = uOpacity + diffuse * 0.05 + fresnel * 0.4 + line * 0.14 + sweep * 0.06 + focus * 0.2;
    gl_FragColor = vec4(color, clamp(alpha, 0.0, 0.92));
  }
`;

/** Altura de la banda de escaneo en cada vuelta: de la base del tronco a la bóveda. */
const SWEEP_FROM = -1.15;
const SWEEP_TO = 0.85;
const SWEEP_SECONDS = 4.2;

/** Un hemisferio derecho: esfera deformada, con los surcos hundidos y anotados. */
function buildHemisphere(segments: [number, number]): THREE.BufferGeometry {
  const geometry = new THREE.SphereGeometry(1, segments[0], segments[1]);
  const position = geometry.attributes.position as THREE.BufferAttribute;
  const folds = new Float32Array(position.count);
  const point = { x: 0, y: 0, z: 0 };
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);
    const depth = fold(x, y, z);
    const radius = 1 - FOLD_DEPTH * depth;
    hemisphere(x * radius, y * radius, z * radius, point);
    position.setXYZ(i, point.x, point.y, point.z);
    folds[i] = depth;
  }
  geometry.setAttribute('aFold', new THREE.BufferAttribute(folds, 1));
  geometry.computeVertexNormals();
  return geometry;
}

/** El espejo de una geometría: x invertida, normales invertidas y caras dadas la vuelta. */
function mirrored(source: THREE.BufferGeometry): THREE.BufferGeometry {
  const geometry = source.clone();
  const position = geometry.attributes.position as THREE.BufferAttribute;
  const normal = geometry.attributes.normal as THREE.BufferAttribute;
  for (let i = 0; i < position.count; i++) {
    position.setX(i, -position.getX(i));
    normal.setX(i, -normal.getX(i));
  }
  const index = geometry.index;
  if (index) {
    for (let t = 0; t < index.count; t += 3) {
      const b = index.getX(t + 1);
      index.setX(t + 1, index.getX(t + 2));
      index.setX(t + 2, b);
    }
  }
  return geometry;
}

/** Cerebelo: un elipsoide bajo y atrás, con folias horizontales en vez de circunvoluciones. */
function buildCerebellum(segments: [number, number]): THREE.BufferGeometry {
  const geometry = new THREE.SphereGeometry(1, Math.round(segments[0] * 0.6), Math.round(segments[1] * 0.6));
  const position = geometry.attributes.position as THREE.BufferAttribute;
  const folds = new Float32Array(position.count);
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);
    const stripe = 0.5 - 0.5 * Math.cos(Math.asin(Math.max(-1, Math.min(1, y))) * 22);
    const depth = stripe * stripe;
    const radius = 1 - 0.03 * depth;
    // Dos lóbulos: una leve cintura en el plano medio.
    const waist = 1 - 0.1 * Math.exp(-(x * x) / 0.05);
    position.setXYZ(i, x * radius * 0.44, y * radius * 0.24 * waist, z * radius * 0.32);
    folds[i] = depth * 0.7;
  }
  geometry.setAttribute('aFold', new THREE.BufferAttribute(folds, 1));
  geometry.computeVertexNormals();
  geometry.translate(0, -0.56, -0.6);
  return geometry;
}

/** Tronco: un cilindro que baja y se echa un poco hacia atrás, con anillos tenues. */
function buildStem(): THREE.BufferGeometry {
  const geometry = new THREE.CylinderGeometry(0.095, 0.15, 0.62, 28, 8, false);
  const position = geometry.attributes.position as THREE.BufferAttribute;
  const folds = new Float32Array(position.count);
  for (let i = 0; i < position.count; i++) {
    const ring = 0.5 - 0.5 * Math.cos(position.getY(i) * 34);
    folds[i] = ring * ring * 0.6;
  }
  geometry.setAttribute('aFold', new THREE.BufferAttribute(folds, 1));
  geometry.rotateX(0.26);
  geometry.translate(0, -0.66, -0.33);
  return geometry;
}

function buildShell(segments: [number, number]): THREE.BufferGeometry {
  const right = buildHemisphere(segments);
  const left = mirrored(right);
  const cerebellum = buildCerebellum(segments);
  const stem = buildStem();
  const merged = mergeGeometries([right, left, cerebellum, stem], false);
  for (const part of [right, left, cerebellum, stem]) part.dispose();
  return merged;
}

interface BrainShellProps {
  detail: Detail;
  reduced: boolean;
  /** Ritmo de la sala: acorta la vuelta de la banda de escaneo. 1 es el del escáner. */
  tempo?: number;
}

export function BrainShell({ detail, reduced, tempo = 1 }: BrainShellProps) {
  const sweepSeconds = SWEEP_SECONDS / (1 + (tempo - 1) * 0.6);
  const material = useRef<THREE.ShaderMaterial>(null);
  const geometry = useMemo(() => buildShell(detail.shell), [detail]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  /*
   * Uniformes estables: se mutan a través del ref del material, nunca desde el
   * render. Sin bloom (nivel bajo) los surcos suben un punto para no apagarse.
   */
  const boost = detail.bloom === 0 ? 1.5 : 1;
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: 0.11 * boost },
      uActivity: { value: 0 },
      uSweep: { value: -9 },
      uBase: { value: new THREE.Color('#071120') },
      uRim: { value: new THREE.Color('#3fd8ee').multiplyScalar(0.3 * boost) },
      uBack: { value: new THREE.Color('#9a8dff').multiplyScalar(0.26) },
      uSpec: { value: new THREE.Color('#dff4ff') },
      uLine: { value: new THREE.Color('#3fd8ee').multiplyScalar(boost) },
      uFocus: { value: new THREE.Vector3() },
      uFocusStrength: { value: 0 },
    }),
    [boost],
  );

  useFrame((state, delta) => {
    const shader = material.current;
    if (!shader) return;
    const step = Math.min(delta, 0.05);
    const time = state.clock.elapsedTime;
    const u = shader.uniforms;
    u.uTime.value = time;
    u.uActivity.value += (coreSignal.activity - u.uActivity.value) * Math.min(1, step * 4);
    // Con movimiento reducido no hay barrido: la banda se queda fuera de la corteza.
    u.uSweep.value = reduced
      ? -9
      : SWEEP_FROM + ((time % sweepSeconds) / sweepSeconds) * (SWEEP_TO - SWEEP_FROM);
    const focus = u.uFocus.value as THREE.Vector3;
    const ease = Math.min(1, step * 6);
    if (coreSignal.focusStrength > 0) {
      focus.x += (coreSignal.focusX - focus.x) * ease;
      focus.y += (coreSignal.focusY - focus.y) * ease;
      focus.z += (coreSignal.focusZ - focus.z) * ease;
    }
    u.uFocusStrength.value += (coreSignal.focusStrength - u.uFocusStrength.value) * ease;
  });

  return (
    <mesh geometry={geometry} renderOrder={3}>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={VERTEX}
        fragmentShader={FRAGMENT}
        transparent
        depthWrite={false}
        side={THREE.FrontSide}
      />
    </mesh>
  );
}

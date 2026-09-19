/**
 * Estado compartido del modelo interior entre la capa HTML, el trazo cardíaco
 * y el bucle de render. Objeto mutable de módulo, como `spinSignal` y
 * `coreSignal`: se escribe desde eventos y se lee sesenta veces por segundo,
 * sin pasar por React. Sólo hay un interior en la página, así que un singleton
 * basta; se reinicia al montar la pieza.
 *
 * El latido lo mueve un solo dueño —el trazo cardíaco, que existe con WebGL y
 * sin él— y la escena 3D sólo lo lee: así el corazón y el electrocardiograma
 * van siempre al compás.
 */
import { BPM, createHeartbeat, type Heartbeat } from './pulse';

export interface BodySignal {
  heart: Heartbeat;
  /** Ritmo vigente, que persigue a `targetBpm` sin saltos. */
  bpm: number;
  targetBpm: number;
  /** Cuánto se exagera la contracción: 1 en reposo; un latido forzado lo sube y decae solo. */
  force: number;
  /** Giro manual: radianes por fotograma que aporta el arrastre; se frena solo. */
  velocity: number;
  dragging: boolean;
}

export const bodySignal: BodySignal = {
  heart: createHeartbeat(),
  bpm: BPM.rest,
  targetBpm: BPM.rest,
  force: 1,
  velocity: 0,
  dragging: false,
};

export function resetBodySignal() {
  bodySignal.heart = createHeartbeat();
  bodySignal.bpm = BPM.rest;
  bodySignal.targetBpm = BPM.rest;
  bodySignal.force = 1;
  bodySignal.velocity = 0;
  bodySignal.dragging = false;
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { lab } from '@/content/lab';
import { neuroscan } from '@/content/neuroscan';
import { seeded } from './neural-data';

/**
 * EVA // NEURAL READOUT: la ventana que lee el núcleo en vivo. Una terminal
 * rectangular que teclea muy rápido —conexiones, probabilidades, millones de
 * relaciones, un pensamiento suelto, volcados binarios— y se despliega hacia
 * abajo sin parar. Al seleccionar una región del cerebro, la lee en voz alta.
 *
 * Es ficción: los números salen de un generador con semilla, no de ninguna
 * medición. Todo se escribe directo en el DOM desde un bucle de animación;
 * React sólo sabe qué región está seleccionada y si hay que teclear.
 */

const { readout } = lab.core;
const { labels } = readout;
const { zones } = neuroscan.brain;

/** Caracteres por segundo. Muy rápido a propósito: se lee el ritmo, no cada cifra. */
const SPEED = 800;
/** Pausa al cerrar cada línea, en milisegundos: así se perciben como unidades. */
const HOLD = 70;
/** Líneas que se conservan en pantalla; por encima, las más viejas se van. */
const KEEP = 90;
/** Frases sueltas del flujo de pensamiento, para que a veces piense en palabras. */
const THOUGHTS = neuroscan.stream.flatMap((fragment) => fragment.lines).filter((line) => line.length < 70);

type Kind = 'meta' | 'math' | 'link' | 'count' | 'thought' | 'region' | 'binary';

interface Line {
  kind: Kind;
  text: string;
}

const number = new Intl.NumberFormat('es-CL');
const decimal = (value: number, digits: number) => value.toFixed(digits).replace('.', ',');
const pad = (value: number) => String(value).padStart(2, '0');

/**
 * Generador de líneas. Lleva su propio reloj de ciclos: cada tantas líneas
 * suelta un contador de relaciones, un pensamiento o una ráfaga binaria, y
 * el resto es aritmética de red. Determinista para una misma semilla.
 */
type Stats = { neurons: number; synapses: number } | null;

function createFeed(seed: number) {
  const random = seeded(seed);
  const pick = <T,>(items: readonly T[]) => items[Math.floor(random() * items.length)];
  let step = 0;
  let cycle = 7;
  let relations = 2_000_000_000 + Math.floor(random() * 90_000_000);
  let burst = 0;

  const region = () => pick(zones).code;
  const weight = () => decimal(random(), 4);
  const signed = () => `${random() < 0.5 ? '−' : '+'}${decimal(random() * 0.02, 5)}`;

  const math = (): Line => {
    const forms = [
      () => `σ(w·x + b) → ${weight()}   ∂L/∂w[${Math.floor(random() * 1500)}] = ${signed()}`,
      () => `${labels.next} = ${decimal(0.97 + random() * 0.03, 4)} · ${2048 * (1 + Math.floor(random() * 3))} ${labels.dims}`,
      () => `${labels.entropy} H = ${decimal(3 + random() * 2.5, 3)} bits · λ₁ = ${decimal(1 + random() * 2, 4)}`,
      () => `cos θ = ${weight()} · ‖v‖ = 1,000 · Δt = ${decimal(15 + random() * 3, 1)} ms`,
      () => `∇ = [${weight()}, ${weight()}, ${weight()}] → norm ${decimal(random() * 0.3, 3)}`,
      () => `softmax(z)[${Math.floor(random() * 8)}] = ${weight()}   argmax → ${labels.region} ${region()}`,
    ];
    return { kind: 'math', text: pick(forms)() };
  };

  const link = (): Line => {
    const pairs = Array.from({ length: 3 }, () => `${region()} ⇄ ${region()} :: ${weight()}`);
    return { kind: 'link', text: `${labels.link} ${pairs.join('   ')}` };
  };

  const count = (): Line => {
    const delta = 1_000_000 + Math.floor(random() * 4_000_000);
    relations += delta;
    return {
      kind: 'count',
      text: `${labels.relations}: ${number.format(relations)} (+${number.format(delta)})`,
    };
  };

  const meta = (current: Stats): Line => {
    const nodes = current ? number.format(current.neurons) : '···';
    const synapses = current ? number.format(current.synapses) : '···';
    return {
      kind: 'meta',
      text: `> ${labels.read} ${labels.cycle} ${pad(cycle)} :: ${nodes} ${labels.nodes} · ${synapses} ${labels.synapses} · ${labels.thinking}…`,
    };
  };

  const binary = (): Line => {
    const groups = Array.from({ length: 12 }, () =>
      Array.from({ length: 4 }, () => (random() < 0.5 ? '0' : '1')).join(''),
    );
    return { kind: 'binary', text: groups.join(' ') };
  };

  const thought = (): Line => ({ kind: 'thought', text: `» ${pick(THOUGHTS)}` });

  return {
    /** La línea siguiente; el recuento real de nodos y sinapsis llega de fuera. */
    next(current: Stats): Line {
      step += 1;
      if (burst > 0) {
        burst -= 1;
        return binary();
      }
      if (step % 28 === 0) {
        burst = 3 + Math.floor(random() * 4);
        return { kind: 'meta', text: `> ${labels.binary} ${pad(cycle)}` };
      }
      if (step % 19 === 0) {
        cycle += 1;
        return meta(current);
      }
      if (step % 11 === 0) return thought();
      if (step % 6 === 0) return count();
      return random() < 0.45 ? link() : math();
    },
    /** Lectura de una región: cabecera, sus líneas y cierre. */
    region(id: string): Line[] {
      const zone = zones.find((item) => item.id === id);
      if (!zone) return [];
      return [
        {
          kind: 'region',
          text: `> ${labels.region} ${zone.code} // ${zone.name.toUpperCase()} :: ${zone.tag} · ${labels.active}`,
        },
        ...zone.lines.map((line): Line => ({ kind: 'region', text: `  «${line}»` })),
        { kind: 'meta', text: `> ${labels.end} :: ${zone.code}` },
      ];
    },
  };
}

interface NeuralReadoutProps {
  selected: string | null;
  stats: { neurons: number; synapses: number } | null;
  /** Fuera de pantalla o tapada, la ventana deja de teclear. */
  active: boolean;
  reduced: boolean;
}

export function NeuralReadout({ selected, stats, active, reduced }: NeuralReadoutProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef(stats);
  const queue = useRef<Line[]>([]);
  const [feed] = useState(() => createFeed(0xe7a02));
  /* Con movimiento reducido no hay mecanografía: una lectura fija, de un generador aparte. */
  const [frozen] = useState(() => {
    const still = createFeed(0xe7a03);
    return Array.from({ length: 14 }, () => still.next(null));
  });

  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  /* Una región seleccionada se lee en cuanto termine la línea en curso. */
  useEffect(() => {
    if (selected) queue.current.push(...feed.region(selected));
  }, [selected, feed]);

  /* El bucle de escritura: una línea nueva cada vez que acaba la anterior. */
  useEffect(() => {
    const body = bodyRef.current;
    if (!body || !active || reduced) return;

    let frame = 0;
    let last = 0;
    let current: HTMLParagraphElement | null = null;
    let text = '';
    let shown = 0;
    let carry = 0;
    let holdUntil = 0;

    const tick = (now: number) => {
      const delta = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;

      if (!current && now < holdUntil) {
        frame = requestAnimationFrame(tick);
        return;
      }

      if (!current) {
        const line = queue.current.shift() ?? feed.next(statsRef.current);
        current = document.createElement('p');
        current.dataset.kind = line.kind;
        body.appendChild(current);
        text = line.text;
        shown = 0;
        while (body.childElementCount > KEEP) body.firstElementChild?.remove();
      }

      carry += delta * SPEED;
      const advance = Math.floor(carry);
      carry -= advance;
      shown = Math.min(text.length, shown + advance);
      current.textContent = text.slice(0, shown);
      if (shown >= text.length) {
        current = null;
        holdUntil = now + HOLD;
      }

      body.scrollTop = body.scrollHeight;
      frame = requestAnimationFrame(tick);
    };

    body.dataset.typing = 'true';
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      body.dataset.typing = 'false';
    };
  }, [active, reduced, feed]);

  return (
    <div className="readout" aria-hidden="true">
      <p className="readout__bar mono">
        <span>{readout.title}</span>
        <span className="readout__status">
          <i />
          {reduced ? readout.reduced : readout.status}
        </span>
      </p>
      <div ref={bodyRef} className="readout__body mono">
        {reduced
          ? frozen.map((line, index) => (
              <p key={index} data-kind={line.kind}>
                {line.text}
              </p>
            ))
          : readout.boot.map((line) => (
              <p key={line} data-kind="meta">
                {`> ${line}`}
              </p>
            ))}
      </div>
      <p className="readout__foot mono">{readout.hint}</p>
    </div>
  );
}

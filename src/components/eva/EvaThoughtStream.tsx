'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { neuroscan } from '@/content/neuroscan';
import { synapse } from '@/content/site';

/**
 * Las frases del flujo del neuroescáner, sin etiquetas ni lecturas técnicas.
 * El texto es el mismo en los dos sitios: aquí se asoma, ahí dentro se lee
 * entero.
 */
const LINES: string[] = neuroscan.stream.flatMap((fragment) => fragment.lines);

/** Milisegundos por carácter y pausa al terminar una frase. */
const TYPE_MS = 26;
const HOLD_MS = 1500;
/** Cuántas frases ya escritas quedan a la vista por encima de la actual. */
const HISTORY = 2;

const MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Preferencia de movimiento del sistema.
 *
 * Con `useSyncExternalStore` en lugar de estado: esta franja sí se renderiza en
 * el servidor, donde no hay `window`, y el tercer argumento da la instantánea
 * del servidor sin desajustar la hidratación.
 */
function useReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const motion = window.matchMedia(MOTION_QUERY);
      motion.addEventListener('change', onChange);
      return () => motion.removeEventListener('change', onChange);
    },
    () => window.matchMedia(MOTION_QUERY).matches,
    () => false,
  );
}

/**
 * Actividad cerebral artificial: EVA escribiendo sus pensamientos bajo el
 * acrónimo, el genoma y su propio retrato.
 *
 * Se teclea carácter a carácter y no para nunca: al llegar al final del flujo
 * vuelve a empezar. Fuera de pantalla se detiene, y con movimiento reducido
 * muestra las frases enteras sin mecanografía.
 */
export function EvaThoughtStream() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState(0);
  const [visible, setVisible] = useState(false);
  const reduced = useReducedMotion();

  const line = LINES[index] ?? '';
  const done = typed >= line.length;

  /* Fuera de pantalla no se teclea: nada de temporizadores invisibles. */
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: '120px',
    });
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  /* Un carácter, o el salto a la frase siguiente. */
  useEffect(() => {
    if (!visible || reduced) return;
    const timer = setTimeout(
      () => {
        if (done) {
          setIndex((value) => (value + 1) % LINES.length);
          setTyped(0);
          return;
        }
        setTyped((value) => value + 1);
      },
      done ? HOLD_MS : TYPE_MS,
    );
    return () => clearTimeout(timer);
  }, [visible, reduced, done, typed, index]);

  /*
   * Las frases ya escritas, sin dar la vuelta al final del flujo: al empezar no
   * hay historial, y lo primero que se lee es el principio del pensamiento, no
   * su desenlace.
   */
  const history = Array.from({ length: HISTORY }, (_, offset) => index - (HISTORY - offset))
    .filter((at) => at >= 0)
    .map((at) => ({ at, text: LINES[at] }));

  return (
    <section ref={hostRef} className="synapse" aria-label={synapse.title}>
      <p className="synapse__head mono">
        <span className="synapse__title">{synapse.title}</span>
        <span aria-hidden="true" className="synapse__meta">
          {synapse.channel}: {String((index % 99) + 1).padStart(2, '0')} · {synapse.state}
        </span>
        <span aria-hidden="true" className="synapse__bars">
          {Array.from({ length: 9 }, (_, bar) => (
            <i key={bar} style={{ animationDelay: `${bar * 90}ms` }} />
          ))}
        </span>
      </p>

      {/* aria-live off: es ambiente, no información que haya que anunciar. */}
      <div className="synapse__lines" aria-live="off">
        {history.map((entry) => (
          <p key={`${entry.at}-${entry.text}`} className="synapse__line">
            <span aria-hidden="true" className="synapse__prompt">
              {synapse.prompt}
            </span>
            {entry.text}
          </p>
        ))}
        <p className="synapse__line synapse__line--current">
          <span aria-hidden="true" className="synapse__prompt">
            {synapse.prompt}
          </span>
          {reduced ? line : line.slice(0, typed)}
          {!reduced && (
            <span aria-hidden="true" className="synapse__caret">
              ▊
            </span>
          )}
        </p>
      </div>
    </section>
  );
}

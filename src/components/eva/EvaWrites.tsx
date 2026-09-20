'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ejes } from '@/content/ejes';
import { useReducedMotion } from '@/lib/motion';
import type { WritesBlock } from '@/lib/types';

const subscribeNever = () => () => {};

/** Milisegundos por carácter. Rápido: es EVA, no una máquina de escribir. */
const TYPE_MS = 11;
/** Pausa tras cerrar una frase; menor tras una coma. El texto respira por frases. */
const SENTENCE_MS = 230;
const COMMA_MS = 55;
/** Pausa entre bloques y entre filas de una ficha. */
const BLOCK_MS = 380;
const ROW_MS = 120;
/** Fracción de la caja que tiene que verse para que empiece a escribir. */
const THRESHOLD = 0.25;

/** Cajas ya escritas en esta visita: al volver a un lugar no se vuelven a teclear. */
const written = new Set<string>();

interface EvaWritesProps {
  /** Identidad de la caja: se recuerda por visita. */
  id: string;
  /** Rótulo del lugar en la cabecera: «01.01 · NÚCLEO CEREBRAL». Sin él, la caja va sin cabecera. */
  place?: string;
  blocks: readonly WritesBlock[];
  className?: string;
}

/**
 * EVA // ESCRIBE — la caja donde EVA redacta el contenido de cada lugar.
 *
 * Los párrafos se teclean carácter a carácter; los rótulos y las consignas
 * aparecen enteros; las fichas y las tablas salen fila a fila. Empieza al
 * entrar en pantalla, se detiene si el visitante se va a mitad y sigue donde
 * iba al volver; una vez escrita, se queda escrita para toda la visita.
 *
 * Todo el texto está en el DOM desde el principio: lo que falta por escribir
 * es invisible pero ocupa su sitio, así que la caja tiene su alto final desde
 * el primer fotograma y nada salta. Sin JavaScript —y para un lector de
 * pantalla— es texto normal, completo. Con movimiento reducido aparece
 * escrito de una vez.
 *
 * El bucle escribe directo en el DOM (textContent y data-atributos sobre
 * nodos que React creó vacíos, como hace la ventana de lectura); React sólo
 * se entera al terminar. Ver HANDOFF, trampa 23: el bucle nunca borra nodos.
 */
export function EvaWrites({ id, place, blocks, className }: EvaWritesProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const blockRefs = useRef<(HTMLElement | null)[]>([]);
  const blockAt = useRef(0);
  const charAt = useRef(0);
  const rowAt = useRef(0);
  const reduced = useReducedMotion();
  /* En el navegador lo no escrito se oculta ya al hidratar; sin JavaScript se lee entero. */
  const armed = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
  const [visible, setVisible] = useState(false);
  const [done, setDone] = useState(false);
  /* Ya tecleó algo: si la caja sale de pantalla a medias, está «en pausa». Se marca desde el bucle. */
  const [started, setStarted] = useState(false);

  const complete = done || reduced;
  const status = complete ? 'done' : visible || !started ? 'typing' : 'paused';

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: THRESHOLD,
    });
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (complete || !visible) return;

    let timer: ReturnType<typeof setTimeout>;
    const finish = () => {
      written.add(id);
      setDone(true);
    };
    // Ya se escribió en esta visita (la caja se volvió a montar): se queda escrita.
    if (written.has(id)) {
      timer = setTimeout(finish, 0);
      return () => clearTimeout(timer);
    }

    const step = () => {
      if (blockAt.current === 0 && charAt.current === 0) setStarted(true);
      const block = blocks[blockAt.current];
      if (!block) {
        finish();
        return;
      }
      const element = blockRefs.current[blockAt.current];
      if (!element) {
        blockAt.current += 1;
        timer = setTimeout(step, 0);
        return;
      }
      element.dataset.shown = '';

      if (block.kind === 'p') {
        const shown = element.querySelector<HTMLElement>('.writes__shown');
        const rest = element.querySelector<HTMLElement>('.writes__rest');
        if (charAt.current >= block.text.length) {
          delete element.dataset.typing;
          blockAt.current += 1;
          charAt.current = 0;
          timer = setTimeout(step, BLOCK_MS);
          return;
        }
        element.dataset.typing = '';
        charAt.current += 1;
        if (shown) shown.textContent = block.text.slice(0, charAt.current);
        if (rest) rest.textContent = block.text.slice(charAt.current);
        const last = block.text[charAt.current - 1];
        const pause = '.:;!?'.includes(last) ? SENTENCE_MS : last === ',' ? COMMA_MS : 0;
        timer = setTimeout(step, TYPE_MS + pause);
        return;
      }

      if (block.kind === 'label' || block.kind === 'slogan') {
        blockAt.current += 1;
        timer = setTimeout(step, block.kind === 'slogan' ? BLOCK_MS * 1.6 : BLOCK_MS * 0.6);
        return;
      }

      // Fichas y tablas: fila a fila.
      const rows = element.querySelectorAll<HTMLElement>('[data-row]');
      if (rowAt.current >= rows.length) {
        blockAt.current += 1;
        rowAt.current = 0;
        timer = setTimeout(step, BLOCK_MS);
        return;
      }
      rows[rowAt.current].dataset.shown = '';
      rowAt.current += 1;
      timer = setTimeout(step, ROW_MS);
    };

    timer = setTimeout(step, 420);
    return () => clearTimeout(timer);
  }, [id, blocks, visible, complete]);

  const skip = () => {
    written.add(id);
    setDone(true);
  };

  const statusLabel =
    status === 'done' ? ejes.writes.done : status === 'paused' ? ejes.writes.paused : ejes.writes.typing;

  return (
    <div
      ref={hostRef}
      className={`writes${className ? ` ${className}` : ''}`}
      data-done={complete || undefined}
      data-armed={armed || undefined}
      data-status={status}
    >
      {place && (
        <p className="writes__bar mono">
          <span className="writes__title">{ejes.writes.title}</span>
          <span className="writes__place">{place}</span>
          {/* «Mostrar todo» vive en la barra: no le quita alto a la caja. Sin barra no hay botón. */}
          {!complete && (
            <button type="button" className="writes__skip mono" onClick={skip}>
              {ejes.writes.skip}
            </button>
          )}
          <span className="writes__status">
            <i aria-hidden="true" />
            {statusLabel}
          </span>
        </p>
      )}

      <div className="writes__body">
        {blocks.map((block, index) => {
          const attach = (element: HTMLElement | null) => {
            blockRefs.current[index] = element;
          };
          switch (block.kind) {
            case 'label':
              return (
                <p key={index} ref={attach} className="writes__label mono" data-block="">
                  {block.text}
                </p>
              );
            case 'slogan':
              return (
                <p key={index} ref={attach} className="writes__slogan mono" data-block="">
                  <span>{block.text}</span>
                </p>
              );
            case 'spec':
              return (
                <dl key={index} ref={attach} className="writes__spec mono" data-block="">
                  {block.rows.map(([term, detail]) => (
                    <div key={term} data-row="">
                      <dt>{term}</dt>
                      <dd>{detail}</dd>
                    </div>
                  ))}
                </dl>
              );
            case 'table':
              return (
                <table key={index} ref={attach} className="writes__table mono" data-block="">
                  <thead>
                    <tr data-row="">
                      {block.head.map((cell, at) => (
                        <th key={at} scope="col">
                          {cell}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map(([term, human, eva]) => (
                      <tr key={term} data-row="">
                        <th scope="row">{term}</th>
                        <td>{human}</td>
                        <td>{eva}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              );
            default:
              return (
                <p key={index} ref={attach} className="writes__p" data-block="">
                  {complete ? (
                    block.text
                  ) : (
                    <>
                      <span className="sr-only">{block.text}</span>
                      <span aria-hidden="true">
                        <span className="writes__shown" />
                        <span className="writes__caret">▊</span>
                        {/* Sin JavaScript se queda así: el párrafo entero a la vista. */}
                        <span className="writes__rest">{block.text}</span>
                      </span>
                    </>
                  )}
                </p>
              );
          }
        })}
      </div>
    </div>
  );
}

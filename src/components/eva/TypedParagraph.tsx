'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useReducedMotion } from '@/lib/motion';

const subscribeNever = () => () => {};

/** Milisegundos por carácter: unos trece segundos para el párrafo del genoma. */
const TYPE_MS = 28;
/** Pausa extra tras un punto: el párrafo respira por frases. */
const SENTENCE_MS = 260;

/** Textos ya escritos en esta visita: al volver a la sección no se repite la escritura. */
const written = new Set<string>();

interface TypedParagraphProps {
  text: string;
  className?: string;
  /** Rótulo del botón que completa el texto de una vez. */
  skipLabel: string;
}

/**
 * Un párrafo que se escribe solo, una vez por visita, y se queda.
 *
 * El texto entero está en el DOM desde el principio: la parte aún no escrita
 * es invisible pero ocupa su sitio, así que la caja tiene su alto final desde
 * el primer fotograma y nada salta mientras se teclea. Para un lector de
 * pantalla —y sin JavaScript— es un párrafo normal, completo.
 *
 * Empieza al entrar en pantalla, se detiene si el visitante se va a mitad y
 * sigue donde iba al volver. Con movimiento reducido aparece escrito.
 */
export function TypedParagraph({ text, className, skipLabel }: TypedParagraphProps) {
  const hostRef = useRef<HTMLParagraphElement>(null);
  const shownRef = useRef<HTMLSpanElement>(null);
  const restRef = useRef<HTMLSpanElement>(null);
  const at = useRef(0);
  const reduced = useReducedMotion();
  /* En el navegador el resto se oculta ya al hidratar, mucho antes de que el
     visitante llegue: sin JavaScript, el párrafo se lee entero. */
  const armed = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
  const [visible, setVisible] = useState(false);
  const [done, setDone] = useState(false);

  const complete = done || reduced;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.5,
    });
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const shown = shownRef.current;
    const rest = restRef.current;
    if (!shown || !rest || complete || !visible) return;

    let timer: ReturnType<typeof setTimeout>;
    const finish = () => {
      written.add(text);
      setDone(true);
    };
    // Ya se escribió en esta visita (el componente se volvió a montar): se queda escrito.
    if (written.has(text)) {
      timer = setTimeout(finish, 0);
      return () => clearTimeout(timer);
    }

    const step = () => {
      if (at.current >= text.length) {
        finish();
        return;
      }
      at.current += 1;
      shown.textContent = text.slice(0, at.current);
      rest.textContent = text.slice(at.current);
      const pause = text[at.current - 1] === '.' ? SENTENCE_MS : 0;
      timer = setTimeout(step, TYPE_MS + pause);
    };
    timer = setTimeout(step, 320);
    return () => clearTimeout(timer);
  }, [text, visible, complete]);

  const skip = () => {
    written.add(text);
    setDone(true);
  };

  return (
    <div className="typed" data-done={complete || undefined} data-armed={armed || undefined}>
      <p ref={hostRef} className={className}>
        {complete ? (
          text
        ) : (
          <>
            <span className="sr-only">{text}</span>
            <span aria-hidden="true">
              <span ref={shownRef} />
              <span className="typed__caret">▊</span>
              {/* Sin JavaScript se queda así: el párrafo entero a la vista. */}
              <span ref={restRef} className="typed__rest">
                {text}
              </span>
            </span>
          </>
        )}
      </p>
      {!complete && (
        <button type="button" className="typed__skip mono" onClick={skip}>
          {skipLabel}
        </button>
      )}
    </div>
  );
}

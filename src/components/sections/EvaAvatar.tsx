'use client';

import Image from 'next/image';
import { useCallback, useState } from 'react';
import { avatar, identity } from '@/data/eva';

const FACES = {
  seria: '/eva/eva-seria.png',
  sonrisa: '/eva/eva-sonrisa.png',
} as const;

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * EVA, presente y respondona.
 *
 * El retrato no decora: es el remate del chiste. EVA dice lo que dice con la
 * misma cara, y sólo se le escapa media sonrisa en las frases más crueles — qué
 * gesto merece cada línea está declarado en los datos, no aquí.
 *
 * Las frases avanzan en orden y no al azar: pulsar dos veces tiene que dar dos
 * cosas distintas. Un aleatorio que repite rompe la ilusión de que hay alguien
 * al otro lado.
 *
 * Las dos imágenes se montan a la vez y se cruzan por opacidad. Intercambiar el
 * `src` produciría un parpadeo en blanco la primera vez que aparece cada gesto,
 * que es justo el momento en que se está mirando.
 */
export function EvaAvatar() {
  const [index, setIndex] = useState(0);
  const line = avatar.lines[index];

  const next = useCallback(
    () => setIndex((current) => (current + 1) % avatar.lines.length),
    [],
  );

  return (
    <figure className="m-0 w-full max-w-[22rem]">
      <button
        type="button"
        onClick={next}
        aria-label={`${avatar.cue}: ${avatar.hint}`}
        className="group block w-full cursor-pointer text-left"
      >
        <div className="eva-portrait relative aspect-4/5 overflow-hidden rounded-eva border border-border bg-surface">
          {(Object.keys(FACES) as (keyof typeof FACES)[]).map((face) => (
            <Image
              key={face}
              src={FACES[face]}
              alt={
                face === line.face
                  ? `${identity.name}, retrato`
                  : ''
              }
              aria-hidden={face !== line.face}
              width={896}
              height={1200}
              priority={face === 'seria'}
              sizes="(min-width: 1024px) 22rem, 60vw"
              className={`absolute inset-0 size-full object-cover object-[50%_22%] transition-opacity duration-500 ${
                face === line.face ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}

          <div aria-hidden="true" className="eva-portrait-scrim" />

          {/* Chapa de estado, al modo de una ficha: sello, señal y numeración. */}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 border-t border-border bg-background/80 px-3 py-2 backdrop-blur-[2px]">
            <span className="eva-mono flex items-center gap-2 text-muted">
              <span
                aria-hidden="true"
                className="eva-dot size-[5px] shrink-0 rounded-full bg-accent"
              />
              {identity.name}
              <span className="eva-seal">{identity.seal}</span>
            </span>
            <span className="eva-mono text-muted" data-numeric>
              {pad(index + 1)}/{pad(avatar.lines.length)}
            </span>
          </div>
        </div>

        <figcaption className="mt-5">
          <p
            aria-live="polite"
            className="min-h-[6.5rem] text-[1.0625rem] leading-relaxed text-pretty"
          >
            {line.text}
          </p>
          <span className="eva-mono mt-3 inline-flex items-center gap-2 text-muted transition-colors group-hover:text-accent-ink">
            {avatar.cue}
            <span aria-hidden="true">▸</span>
          </span>
        </figcaption>
      </button>
    </figure>
  );
}

import type { ReactNode } from 'react';
import { lab, rooms } from '@/content/lab';

interface LabSectionProps {
  id: (typeof rooms)[number]['id'];
  eyebrow: string;
  title: string;
  lede: string;
  /** Sin título visible ni entrada: la sala habla por sí misma (el núcleo). */
  compact?: boolean;
  children: ReactNode;
}

/**
 * Una sala del laboratorio: un slide con cabecera (código, título, entrada),
 * el contenido que le pase cada sección y, al pie, el paso a la sala
 * siguiente. El acento sale de `rooms`, así que la sala no lo repite.
 */
export function LabSection({
  id,
  eyebrow,
  title,
  lede,
  compact = false,
  children,
}: LabSectionProps) {
  const index = rooms.findIndex((room) => room.id === id);
  const room = rooms[index];
  const next = rooms[index + 1];

  return (
    <section
      id={id}
      className={`slide section section--ruled lab${compact ? ' lab--compact' : ''}`}
      aria-labelledby={`${id}-titulo`}
      data-accent={room.accent}
    >
      <div className="wrap">
        <div className="lab__head reveal">
          <span aria-hidden="true" className="lab__code mono">
            {room.code}
          </span>
          <div>
            <p className="eyebrow mono">{eyebrow}</p>
            <h2 id={`${id}-titulo`} className={compact ? 'sr-only' : 'h2'}>
              {title}
            </h2>
            <p className={compact ? 'lab__hint mono' : 'lede'}>{lede}</p>
          </div>
        </div>

        {children}

        <p className="slide__foot mono">
          <span>
            {room.code} / 0{rooms.length}
          </span>
          {next ? (
            <a href={`#${next.id}`} data-sound="open">
              {next.code} — {next.name} <span aria-hidden="true">↓</span>
            </a>
          ) : (
            <a href="#inicio" data-sound="open">
              {lab.back} <span aria-hidden="true">↑</span>
            </a>
          )}
        </p>
      </div>
    </section>
  );
}

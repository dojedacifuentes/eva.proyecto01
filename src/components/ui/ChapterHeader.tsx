import type { ReactNode } from 'react';
import type { Chapter } from '@/data/eva';

/**
 * Cabecera de un capítulo con página propia.
 *
 * Abre con el número y la categoría en el mismo lenguaje que el lateral y la
 * barra inferior: la misma cifra en los tres sitios es lo que hace que se sepa
 * dónde se está sin tener que leer.
 */
export function ChapterHeader({
  chapter,
  children,
}: {
  chapter: Chapter;
  children?: ReactNode;
}) {
  return (
    <section className="eva-container pt-14 pb-16 md:pt-20 md:pb-24">
      <p className="eva-mono flex items-center gap-3">
        <span className="text-accent-ink">{chapter.number}</span>
        <span aria-hidden="true" className="h-px w-6 bg-border" />
        <span className="text-muted">{chapter.eyebrow}</span>
      </p>

      <h1 className="mt-7 max-w-[18ch] text-[clamp(2.25rem,6vw,4rem)] leading-[1.02] font-medium tracking-[-0.03em] text-balance">
        {chapter.title}
      </h1>

      <p className="mt-8 max-w-[62ch] text-lg leading-relaxed text-pretty text-muted md:text-xl">
        {chapter.text}
      </p>

      {children}
    </section>
  );
}

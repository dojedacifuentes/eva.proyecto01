import type { Metadata } from 'next';
import { ChapterHeader } from '@/components/ui/ChapterHeader';
import { chapterBySlug, workLines } from '@/data/eva';

const chapter = chapterBySlug['eva'];

export const metadata: Metadata = {
  title: 'El proyecto',
  description: chapter.text,
};

/** Quién es EVA y sus cuatro líneas de trabajo, en composición tipográfica. */
export default function Page() {
  return (
    <ChapterHeader chapter={chapter}>
      <ul className="mt-16 grid grid-cols-1 border-t border-border md:mt-20 sm:grid-cols-2 lg:grid-cols-4">
        {workLines.map((line) => (
          <li
            key={line.index}
            className="border-b border-border py-6 sm:pr-6 lg:py-8 lg:[&:not(:last-child)]:border-r"
          >
            <p className="eva-mono text-accent-ink">{line.index}</p>
            <p className="mt-4 text-xl tracking-[-0.01em] md:text-2xl">
              {line.label}
            </p>
            <p className="eva-mono mt-2 text-muted">{line.note}</p>
          </li>
        ))}
      </ul>
    </ChapterHeader>
  );
}

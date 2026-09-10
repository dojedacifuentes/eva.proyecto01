import type { Metadata } from 'next';
import { ChapterHeader } from '@/components/ui/ChapterHeader';
import { EmptyChapter } from '@/components/ui/EmptyChapter';
import { chapterBySlug, chapterStatus } from '@/data/eva';
import { courses, prototypes, reports } from '@/data/collections';

const chapter = chapterBySlug['informes'];
const state = chapterStatus['informes'];
const collection = { cursos: courses, prototipos: prototypes, informes: reports };

export const metadata: Metadata = {
  title: chapter.title,
  description: chapter.text,
};

export default function Page() {
  const items = collection['informes'];

  return (
    <ChapterHeader chapter={chapter}>
      {items.length === 0 ? (
        <EmptyChapter
          status={state.status}
          note={state.note}
          label={state.label}
        />
      ) : null}
    </ChapterHeader>
  );
}

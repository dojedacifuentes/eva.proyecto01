import { EmptyChapter } from '@/components/ui/EmptyChapter';
import { SectionIntro } from '@/components/ui/SectionIntro';
import { reports } from '@/data/collections';
import { sections } from '@/data/eva';

const s = sections.reports;

/**
 * Capítulo «Informes». El tipo `Report` ya define título, fecha, categoría,
 * resumen, enlace y PDF: la arquitectura está lista aunque no haya informes.
 */
export function ReportsSection() {
  return (
    <SectionIntro
      id={s.id}
      number={s.number}
      eyebrow={s.eyebrow}
      title={s.title}
      text={s.text}
    >
      {reports.length === 0 ? (
        <EmptyChapter status={s.status} note={s.emptyNote} />
      ) : null}
    </SectionIntro>
  );
}

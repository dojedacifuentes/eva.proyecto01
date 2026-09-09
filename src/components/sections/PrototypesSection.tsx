import { EmptyChapter } from '@/components/ui/EmptyChapter';
import { SectionIntro } from '@/components/ui/SectionIntro';
import { prototypes } from '@/data/collections';
import { sections } from '@/data/eva';

const s = sections.prototypes;

/** Capítulo «Prototipos» — el laboratorio de EVA. */
export function PrototypesSection() {
  return (
    <SectionIntro id={s.id} eyebrow={s.eyebrow} title={s.title} text={s.text}>
      {prototypes.length === 0 ? (
        <EmptyChapter status={s.status} note={s.emptyNote} label={s.label} />
      ) : null}
    </SectionIntro>
  );
}

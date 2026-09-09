import { EmptyChapter } from '@/components/ui/EmptyChapter';
import { SectionIntro } from '@/components/ui/SectionIntro';
import { courses } from '@/data/collections';
import { sections } from '@/data/eva';

const s = sections.courses;

/**
 * Capítulo «Cursos». Mientras `courses` esté vacío se muestra el estado
 * editorial; cuando se añada el primer curso real, aquí entra la rejilla de
 * fichas sin tocar el resto de la página.
 */
export function CoursesSection() {
  return (
    <SectionIntro id={s.id} eyebrow={s.eyebrow} title={s.title} text={s.text}>
      {courses.length === 0 ? (
        <EmptyChapter status={s.status} note={s.emptyNote} />
      ) : null}
    </SectionIntro>
  );
}

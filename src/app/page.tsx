import { Hero } from '@/components/sections/Hero';
import { AboutEva } from '@/components/sections/AboutEva';
import { CoursesSection } from '@/components/sections/CoursesSection';
import { PrototypesSection } from '@/components/sections/PrototypesSection';
import { ReportsSection } from '@/components/sections/ReportsSection';
import { LegalTeamsSection } from '@/components/sections/LegalTeamsSection';
import { ClosingSection } from '@/components/sections/ClosingSection';

/**
 * Landing v0.1.
 *
 * Cada sección es un capítulo preparado para crecer. En cuanto una de ellas
 * necesite página propia (/cursos, /prototipos, /informes…), su componente se
 * reutiliza tal cual y sólo cambia el `href` en `src/data/eva.ts`.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <AboutEva />
      <CoursesSection />
      <PrototypesSection />
      <ReportsSection />
      <LegalTeamsSection />
      <ClosingSection />
    </>
  );
}

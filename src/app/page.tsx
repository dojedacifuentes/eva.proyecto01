import { CoursesSection } from '@/components/sections/CoursesSection';
import { FeaturedProject } from '@/components/sections/FeaturedProject';
import { HeroEva } from '@/components/sections/HeroEva';
import { ModuleGrid } from '@/components/sections/ModuleGrid';
import { ModuleSection } from '@/components/sections/ModuleSection';
import { NewsPreview } from '@/components/sections/NewsPreview';
import { topics } from '@/content/resources';
import { flags, sections } from '@/content/site';

export default function HomePage() {
  return (
    <>
      <HeroEva />
      <ModuleGrid />
      <FeaturedProject />

      <ModuleSection id="academy" layout="lead">
        <div className="topics reveal">
          <p className="topics__label mono">{sections.library.topicsLabel}</p>
          <ul className="tags">
            {topics.map((topic) => (
              <li key={topic} className="tag">
                {topic}
              </li>
            ))}
          </ul>
        </div>
      </ModuleSection>

      <CoursesSection />

      {flags.news && <NewsPreview />}
      <ModuleSection id="arcade" layout="split" />
      <ModuleSection id="lab" layout="split" />
    </>
  );
}

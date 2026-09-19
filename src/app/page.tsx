import { ArchiveStats } from '@/components/sections/ArchiveStats';
import { FeaturedProject } from '@/components/sections/FeaturedProject';
import { HeroEva } from '@/components/sections/HeroEva';
import { InstitutionalCTA } from '@/components/sections/InstitutionalCTA';
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
          <p className="topics__label mono">{sections.archive.topicsLabel}</p>
          <ul className="tags">
            {topics.map((topic) => (
              <li key={topic} className="tag">
                {topic}
              </li>
            ))}
          </ul>
        </div>
      </ModuleSection>

      {flags.news && <NewsPreview />}
      <ModuleSection id="arcade" layout="split" />
      <ModuleSection id="lab" layout="split" />

      {flags.archive && <ArchiveStats />}
      {flags.contactCta && <InstitutionalCTA />}
    </>
  );
}

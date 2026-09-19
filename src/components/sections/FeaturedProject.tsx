import type { CSSProperties } from 'react';
import { ExternalLink } from '@/components/ui/ExternalLink';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { sections, ui } from '@/content/site';
import { getFeaturedProject, getModule } from '@/lib/content';

const SKYLINE = [38, 62, 46, 88, 54, 72, 34, 58];

/** Proyecto destacado. Se elige en `projects.ts` con `featured: true`. */
export function FeaturedProject() {
  const project = getFeaturedProject();
  if (!project?.href) return null;

  const moduleId = project.modules[0];
  const home = getModule(moduleId);
  const context = project.contexts?.[moduleId];

  return (
    <section id="foro" className="slide section" aria-labelledby="destacado-titulo" data-accent={home.accent}>
      <div className="wrap">
        <div className="featured reveal">
          <div>
            <p className="eyebrow mono">
              {sections.featured.eyebrow} · {home.name}
            </p>
            <h2 id="destacado-titulo" className="featured__title">
              {project.title}
            </h2>
            {project.descriptor && (
              <p className="featured__descriptor mono">{project.descriptor}</p>
            )}
            <p className="featured__text">{project.description}</p>
            {project.featuredPitch && <p className="aside featured__pitch">{project.featuredPitch}</p>}
            <div className="featured__actions">
              <ExternalLink href={project.href} className="btn btn--solid">
                {context?.cta ?? 'Abrir'}
              </ExternalLink>
              <StatusBadge status={project.status} />
              <span className="mono">{ui.externalExperience}</span>
            </div>
          </div>

          <div className="skyline" aria-hidden="true">
            <span className="skyline__tag mono">FORO // SECTOR 01</span>
            {SKYLINE.map((height, index) => (
              <i key={index} style={{ '--h': `${height}%` } as CSSProperties} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

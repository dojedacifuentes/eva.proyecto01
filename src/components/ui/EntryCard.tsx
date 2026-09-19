import { ui } from '@/content/site';
import { isLive } from '@/lib/content';
import type { ModuleEntry } from '@/lib/types';
import { ExternalLink } from './ExternalLink';
import { StatusBadge } from './StatusBadge';

interface EntryCardProps {
  entry: ModuleEntry;
  lead?: boolean;
}

/** Ficha de un proyecto o recurso dentro de un universo. Sin destino, sin enlace. */
export function EntryCard({ entry, lead = false }: EntryCardProps) {
  const live = isLive(entry.href);
  const classes = [
    'entry',
    'reveal',
    lead && 'entry--lead',
    live ? 'entry--live' : 'entry--concept',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article className={classes}>
      <div className="entry__meta">
        <span className="mono">{entry.intent ?? ui.queued}</span>
        <StatusBadge status={entry.status} />
      </div>
      <h3 className="entry__title">{entry.title}</h3>
      {entry.descriptor && <p className="entry__descriptor mono">{entry.descriptor}</p>}
      <p className="entry__text">{entry.description}</p>
      <div className="entry__foot">
        <ul className="tags" aria-label="Etiquetas">
          {entry.tags.map((tag) => (
            <li key={tag} className="tag">
              {tag}
            </li>
          ))}
        </ul>
        {live ? (
          <ExternalLink href={entry.href!} className="entry__link mono">
            {entry.cta ?? 'Abrir'}
          </ExternalLink>
        ) : (
          <span className="entry__off mono">{ui.unavailable}</span>
        )}
      </div>
    </article>
  );
}

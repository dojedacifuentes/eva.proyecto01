import { EntryArt } from '@/components/links/EntryArt';
import type { LinkEntry } from '@/content/links';

/**
 * Una experiencia de EVA, como pieza y no como botón: la tarjeta entera es el
 * enlace (cómodo con el pulgar) y se abre en la misma pestaña. Jerarquía:
 * categoría, título, descripción, llamada.
 *
 * Dos tamaños. `featured` (el Arcade): ilustración arriba, nodo y estado sobre
 * ella. `compact` (Academy, Lab): ilustración cuadrada a la izquierda, el nodo
 * dentro de ella, y el texto al lado; pesa menos a propósito.
 */
export function EntryCard({ entry, featured = false }: { entry: LinkEntry; featured?: boolean }) {
  return (
    <a
      className={`arcade-card ${featured ? 'arcade-card--featured' : 'arcade-card--compact'}`}
      data-accent={entry.accent}
      href={entry.href}
    >
      <div className="arcade-card__art">
        <EntryArt art={entry.art} />
        <span className="arcade-card__node mono">{featured ? `NODE ${entry.node}` : entry.node}</span>
        {featured && entry.status && <span className="arcade-card__status mono">{entry.status}</span>}
      </div>
      <div className="arcade-card__body">
        <p className="arcade-card__category mono">{entry.category}</p>
        <h3 className="arcade-card__title">{entry.title}</h3>
        <p className="arcade-card__text">{entry.description}</p>
        <span className="arcade-card__cta">
          {entry.cta}
          <span className="arcade-card__arrow" aria-hidden="true">
            ↗
          </span>
        </span>
      </div>
    </a>
  );
}

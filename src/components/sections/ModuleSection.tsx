import type { ReactNode } from 'react';
import { EntryCard } from '@/components/ui/EntryCard';
import { getModule, getModuleEntries } from '@/lib/content';
import type { ModuleId } from '@/lib/types';

interface ModuleSectionProps {
  id: Exclude<ModuleId, 'news'>;
  /** `lead`: la primera ficha ocupa todo el ancho. `split`: 7/5. */
  layout: 'lead' | 'split';
  children?: ReactNode;
}

/** Un universo en detalle: cabecera, fichas proyectadas desde los datos y extras. */
export function ModuleSection({ id, layout, children }: ModuleSectionProps) {
  const current = getModule(id);
  const entries = getModuleEntries(id);

  return (
    <section
      id={id}
      className="slide section section--ruled"
      aria-labelledby={`${id}-titulo`}
      data-accent={current.accent}
    >
      <div className="wrap">
        <div className="module__head reveal">
          <span aria-hidden="true" className="module__code">
            {current.code}
          </span>
          <div>
            <p className="eyebrow mono">{current.intent}</p>
            <h2 id={`${id}-titulo`} className="h2">
              {current.name}
            </h2>
            <p className="lede">{current.description}</p>
          </div>
        </div>

        <div className={`entries entries--${layout}`}>
          {entries.map((entry, index) => (
            <EntryCard key={entry.id} entry={entry} lead={index === 0} />
          ))}
        </div>

        {children}
        {current.aside && <p className="aside module__aside">{current.aside}</p>}
      </div>
    </section>
  );
}

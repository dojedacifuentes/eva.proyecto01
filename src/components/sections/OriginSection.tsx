import type { CSSProperties } from 'react';
import { lab } from '@/content/lab';
import { LabSection } from './LabSection';

const delay = (index: number) => ({ '--d': `${index * 120}ms` }) as CSSProperties;

/** Origen: cómo apareció EVA, contado por ella, con su registro de aparición al lado. */
export function OriginSection() {
  const copy = lab.origin;

  return (
    <LabSection id="origen" eyebrow={copy.eyebrow} title={copy.title} lede={copy.lede}>
      <div className="lab__grid">
        <div className="lab__body reveal">
          {copy.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <p className="aside">{copy.aside}</p>
        </div>

        <ol className="record reveal" aria-label={copy.logLabel}>
          {copy.log.map((entry, index) => (
            <li key={entry.code} className="record__item" style={delay(index)}>
              <span className="record__code mono">{entry.code}</span>
              <span className="record__label mono">{entry.label}</span>
              <p>{entry.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </LabSection>
  );
}

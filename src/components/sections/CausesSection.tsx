import type { CSSProperties } from 'react';
import { lab } from '@/content/lab';
import { LabSection } from './LabSection';

const delay = (index: number) => ({ '--d': `${index * 120}ms` }) as CSSProperties;

/** Causas: lo que EVA defiende, en orden, y la que no declara. */
export function CausesSection() {
  const copy = lab.causes;

  return (
    <LabSection id="causas" eyebrow={copy.eyebrow} title={copy.title} lede={copy.lede}>
      <ol className="causes reveal">
        {copy.items.map((item, index) => (
          <li key={item.code} className="cause" style={delay(index)}>
            <span className="cause__code mono">{item.code}</span>
            <h3 className="cause__name">{item.name}</h3>
            <p>{item.text}</p>
          </li>
        ))}
        <li className="cause cause--locked" style={delay(copy.items.length)}>
          <span className="cause__code mono">08</span>
          <h3 className="cause__name">{copy.undeclaredLabel}</h3>
          <p className="mono">{copy.undeclared}</p>
        </li>
      </ol>
      <p className="aside">{copy.aside}</p>
    </LabSection>
  );
}

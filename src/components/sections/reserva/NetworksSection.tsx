import type { CSSProperties } from 'react';
import { lab } from '@/content/lab';
import { neuroscan } from '@/content/neuroscan';
import { LabSection } from './LabSection';

const delay = (index: number) => ({ '--d': `${index * 120}ms` }) as CSSProperties;

/** Redes neuronales: las capas de EVA, el trayecto de una señal y su declaración dataísta. */
export function NetworksSection() {
  const copy = lab.networks;

  return (
    <LabSection id="redes" eyebrow={copy.eyebrow} title={copy.title} lede={copy.lede}>
      <div className="lab__grid">
        <ol className="layers reveal">
          {copy.layers.map((layer, index) => (
            <li key={layer.code} className="layer" style={delay(index)}>
              <span className="layer__code mono">{layer.code}</span>
              <div>
                <strong className="layer__name">{layer.name}</strong>
                <p>{layer.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="lab__body reveal">
          <p className="signal mono" aria-label={copy.signalLabel}>
            {copy.signal.map((step, index) => (
              <span key={step}>
                {step}
                {index < copy.signal.length - 1 && <i aria-hidden="true"> → </i>}
              </span>
            ))}
          </p>
          <p className="lab__label mono">{copy.dataistLabel}</p>
          <dl className="dataist dataist--lab">
            {neuroscan.panels.dataist.rows.map(([key, value]) => (
              <div key={key}>
                <dt>{key}</dt>
                <dd className="mono">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="aside">{copy.aside}</p>
        </div>
      </div>
    </LabSection>
  );
}

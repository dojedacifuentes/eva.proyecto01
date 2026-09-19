import { NeuroscanTrigger } from '@/components/eva/NeuroscanTrigger';
import { lab } from '@/content/lab';
import { neuroscan } from '@/content/neuroscan';
import { LabSection } from './LabSection';

/**
 * Cerebro: la arquitectura cognitiva de EVA y sus ocho regiones, las mismas
 * del neuroescáner. Desde aquí se abre el escáner con el cerebro 3D.
 */
export function BrainSection() {
  const copy = lab.brain;
  const { zones, core } = neuroscan.brain;

  return (
    <LabSection id="cerebro" eyebrow={copy.eyebrow} title={copy.title} lede={copy.lede}>
      <div className="lab__grid">
        <div className="lab__body reveal">
          {copy.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <div className="lab__actions">
            <NeuroscanTrigger className="btn btn--solid" label={neuroscan.trigger.label}>
              {copy.scan}
              <span aria-hidden="true" className="btn__arrow">
                ↗
              </span>
            </NeuroscanTrigger>
            <span className="lab__hint mono">{copy.scanHint}</span>
          </div>
          <p className="aside">{copy.aside}</p>
        </div>

        <ul className="regions reveal" aria-label={copy.regionsLabel}>
          {zones.map((zone) => (
            <li key={zone.id} className="region" data-locked={zone.id === core.alert || undefined}>
              <span className="region__code mono">{zone.code}</span>
              <span className="region__name">{zone.name}</span>
              <span className="region__tag mono">{zone.tag}</span>
            </li>
          ))}
        </ul>
      </div>
    </LabSection>
  );
}

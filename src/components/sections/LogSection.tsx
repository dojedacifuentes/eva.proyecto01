import type { CSSProperties } from 'react';
import { NeuroscanTrigger } from '@/components/eva/NeuroscanTrigger';
import { lab } from '@/content/lab';
import { neuroscan } from '@/content/neuroscan';
import { nav, ui } from '@/content/site';
import { LabSection } from './LabSection';

const delay = (index: number) => ({ '--d': `${index * 120}ms` }) as CSSProperties;

/**
 * Bitácora: el registro personal de EVA y el interrogatorio abierto, que
 * reutiliza las respuestas de la terminal del escáner para no contradecirla.
 */
export function LogSection() {
  const copy = lab.log;
  const answers = copy.questions
    .map((id) => neuroscan.answers.find((answer) => answer.id === id))
    .filter((answer) => answer !== undefined);

  return (
    <LabSection id="bitacora" eyebrow={copy.eyebrow} title={copy.title} lede={copy.lede}>
      <div className="lab__grid">
        <ol className="diary reveal">
          {copy.entries.map((entry, index) => (
            <li key={entry.code} className="diary__entry" style={delay(index)}>
              <p className="diary__meta mono">
                <span>{entry.code}</span>
                <span>{entry.cycle}</span>
              </p>
              <h3 className="diary__title">{entry.title}</h3>
              <p>{entry.text}</p>
            </li>
          ))}
        </ol>

        <div className="ask reveal">
          <p className="lab__label mono">{copy.askLabel}</p>
          <p className="ask__lede">{copy.askLede}</p>
          {answers.map((answer) => (
            <details key={answer.id} className="ask__item">
              <summary className="ask__question">{answer.question}</summary>
              <div className="ask__answer">
                {answer.lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </details>
          ))}
          <div className="lab__actions">
            <NeuroscanTrigger className="btn btn--ghost" label={neuroscan.trigger.label}>
              {copy.more}
            </NeuroscanTrigger>
            <a
              className="btn btn--ghost"
              href={nav.contact.href}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="external"
            >
              {copy.write}
              <span className="sr-only"> ({ui.external})</span>
            </a>
          </div>
          <p className="lab__hint mono">{copy.moreHint}</p>
        </div>
      </div>
    </LabSection>
  );
}

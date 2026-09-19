import { EvaDnaHelix } from '@/components/eva/EvaDnaHelix';
import { TypedParagraph } from '@/components/eva/TypedParagraph';
import { ejes } from '@/content/ejes';
import { subById } from '@/content/structure';
import { NodeFoot, NodeHead } from './NodeParts';

/**
 * 01.10 · Genoma digital. La hélice es la columna del slide —sangra por arriba
 * y por abajo, sin caja— y a su lado van el título, el párrafo del nacimiento
 * de EVA, que se escribe una sola vez, y la consola con las siete acciones.
 */
export function GenomaSection() {
  const copy = ejes.genoma;
  const place = subById('genoma');

  return (
    <section
      id="genoma"
      className="slide section node node--genoma"
      aria-labelledby="genoma-titulo"
      data-accent={place?.axis.accent}
    >
      <div className="wrap">
        <EvaDnaHelix
          head={
            <NodeHead
              id="genoma"
              eyebrow={`${place?.sub.name} — ${place?.sub.motto}`}
              title={copy.title}
            />
          }
          copy={
            <div className="genome__copy">
              <p className="genome__label mono">{copy.birthLabel}</p>
              <TypedParagraph className="genome__birth" text={copy.birth} skipLabel={copy.skip} />
            </div>
          }
          foot={<p className="genome__fiction mono">{copy.fiction}</p>}
        />

        <NodeFoot id="genoma" />
      </div>
    </section>
  );
}

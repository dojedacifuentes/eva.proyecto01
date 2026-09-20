import { EvaDnaHelix } from '@/components/eva/EvaDnaHelix';
import { EvaWrites } from '@/components/eva/EvaWrites';
import { ejes } from '@/content/ejes';
import { axisById, axisMottos } from '@/content/structure';
import { NodeFoot, NodeHead } from './NodeParts';

/**
 * 10 · Genoma. La segunda pregunta: si una hélice y una cadena de bits son la
 * misma cosa escrita con otro alfabeto. La hélice es la columna del slide
 * —sangra por arriba y por abajo, sin caja— y a su lado van el título, la caja
 * donde EVA escribe y la consola.
 */
export function GenomaSection() {
  const copy = ejes.genoma;
  const place = axisById('genoma');

  return (
    <section
      id="genoma"
      className="slide section node node--genoma"
      aria-labelledby="genoma-titulo"
      data-accent={place?.accent}
    >
      <div className="wrap">
        <EvaDnaHelix
          head={
            <NodeHead
              id="genoma"
              eyebrow={`${place?.name} — ${axisMottos.genoma}`}
              title={copy.title}
            />
          }
          copy={
            <EvaWrites
              id="genoma"
              place={`${place?.code} · ${place?.name.toUpperCase()}`}
              blocks={copy.writes}
            />
          }
          foot={
            <p key="fiction" className="genome__fiction mono">
              {copy.fiction}
            </p>
          }
        />

        <NodeFoot id="genoma" />
      </div>
    </section>
  );
}

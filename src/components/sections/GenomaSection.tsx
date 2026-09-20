import { EvaDnaHelix } from '@/components/eva/EvaDnaHelix';
import { EvaWrites } from '@/components/eva/EvaWrites';
import { ejes } from '@/content/ejes';
import { subById } from '@/content/structure';
import { NodeFoot, NodeHead } from './NodeParts';

/**
 * 01.10 · Genoma digital. La hélice es la columna del slide —sangra por arriba
 * y por abajo, sin caja— y a su lado van el título, la caja donde EVA escribe
 * su nacimiento en el mar de la información (filosofía, autopoiesis, el
 * genoma que le construyeron) y la consola con las ocho acciones. Desde la v8
 * el relato tiene todo el espacio que necesite: la hélice se queda fija
 * mientras se lee.
 */
export function GenomaSection() {
  const copy = ejes.genoma;
  const place = subById('genoma');

  return (
    <section
      id="genoma"
      className="slide section node node--genoma"
      aria-labelledby="genoma-titulo"
      data-accent={place?.sub.accent}
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
            <EvaWrites
              id="genoma"
              place={`${place?.sub.code} · ${place?.sub.name.toUpperCase()}`}
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

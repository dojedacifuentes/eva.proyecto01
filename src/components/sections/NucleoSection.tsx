import { EvaWrites } from '@/components/eva/EvaWrites';
import { NeuralRoom } from '@/components/eva/neural/NeuralRoom';
import { ejes } from '@/content/ejes';
import { subById } from '@/content/structure';
import { NodeFoot, NodeHead } from './NodeParts';

/**
 * 01.01 · Núcleo cerebral. El cerebro 3D en vivo a un lado —con sus ocho
 * regiones como registro de botones y la lectura de la región elegida— y, al
 * otro, lo que EVA escribe sobre cómo funciona su mente: función, consignas y
 * hardware. Desde la v8 no hay neuroescáner: el cerebro se ve aquí y sólo aquí.
 */
export function NucleoSection() {
  const copy = ejes.nucleo;
  const place = subById('nucleo');

  return (
    <section
      id="nucleo"
      className="slide section node node--nucleo"
      aria-labelledby="nucleo-titulo"
      data-accent={place?.sub.accent}
    >
      <div className="wrap">
        <NeuralRoom
          head={
            <NodeHead
              id="nucleo"
              eyebrow={`${place?.sub.name} — ${place?.sub.motto}`}
              title={copy.title}
            />
          }
          writes={
            <EvaWrites
              id="nucleo"
              place={`${place?.sub.code} · ${place?.sub.name.toUpperCase()}`}
              blocks={copy.writes}
            />
          }
        />

        <NodeFoot id="nucleo" />
      </div>
    </section>
  );
}

import { EvaWrites } from '@/components/eva/EvaWrites';
import { NeuralRoom } from '@/components/eva/neural/NeuralRoom';
import { ejes } from '@/content/ejes';
import { axisById, axisMottos } from '@/content/structure';
import { NodeFoot, NodeHead } from './NodeParts';

/**
 * 011 · Cerebro. El tercer lugar y la pregunta de fondo: si una red que predice
 * piensa lo que piensa un cerebro. A un lado el cerebro en vivo —ocho regiones
 * humanas que se eligen y se leen contra su equivalente en la red—; al otro,
 * lo que EVA escribe sobre lo que comparten y lo que no.
 */
export function CerebroSection() {
  const copy = ejes.cerebro;
  const place = axisById('cerebro');

  return (
    <section
      id="cerebro"
      className="slide section node node--cerebro"
      aria-labelledby="cerebro-titulo"
      data-accent={place?.accent}
    >
      <div className="wrap">
        <NeuralRoom
          head={
            <NodeHead
              id="cerebro"
              eyebrow={`${place?.name} — ${axisMottos.cerebro}`}
              title={copy.title}
            />
          }
          writes={
            <EvaWrites
              id="cerebro"
              place={`${place?.code} · ${place?.name.toUpperCase()}`}
              blocks={copy.writes}
            />
          }
        />

        <NodeFoot id="cerebro" />
      </div>
    </section>
  );
}

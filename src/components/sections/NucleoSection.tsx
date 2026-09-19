import { NeuralRoom } from '@/components/eva/neural/NeuralRoom';
import { NeuroscanTrigger } from '@/components/eva/NeuroscanTrigger';
import { ejes } from '@/content/ejes';
import { neuroscan } from '@/content/neuroscan';
import { subById } from '@/content/structure';
import { NodeFoot, NodeHead } from './NodeParts';

/**
 * 01.01 · Núcleo cerebral. Reúne las dos salas que hablaban del cerebro: el
 * núcleo en vivo —el cerebro 3D con todos sus efectos y la ventana que lo lee—
 * y lo que valía de la sala «Cerebro»: su título, sus ocho regiones (ahora el
 * registro de botones bajo el cerebro, con teclado) y la puerta al neuroescáner.
 *
 * El cerebro es el protagonista: media sala, a todo el alto. El título, la
 * ventana de lectura y la puerta al escáner comparten la otra mitad.
 */
export function NucleoSection() {
  const copy = ejes.nucleo;
  const place = subById('nucleo');

  return (
    <section
      id="nucleo"
      className="slide section node node--nucleo"
      aria-labelledby="nucleo-titulo"
      data-accent={place?.axis.accent}
    >
      <div className="wrap">
        <NeuralRoom
          head={
            <NodeHead
              id="nucleo"
              eyebrow={`${place?.sub.name} — ${place?.sub.motto}`}
              title={copy.title}
              lede={copy.lede}
            />
          }
          aside={
            <div className="node__aside">
              <p>{copy.body}</p>
              <div className="node__actions">
                <NeuroscanTrigger className="btn btn--ghost" label={neuroscan.trigger.label}>
                  {copy.scan}
                  <span aria-hidden="true" className="btn__arrow">
                    ↗
                  </span>
                </NeuroscanTrigger>
                <span className="node__hint mono">{copy.scanHint}</span>
              </div>
            </div>
          }
        />

        <NodeFoot id="nucleo" />
      </div>
    </section>
  );
}

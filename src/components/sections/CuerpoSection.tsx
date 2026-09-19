import { BioReading } from '@/components/eva/cuerpo/BioReading';
import { EvaInterior } from '@/components/eva/cuerpo/EvaInterior';
import { GenomeStrand } from '@/components/eva/GenomeStrand';
import { ejes } from '@/content/ejes';
import { subById } from '@/content/structure';
import { NodeFoot, NodeHead } from './NodeParts';

/**
 * 01.11 · Cuerpo. La tercera parte de la Entidad, en dos lecturas seguidas:
 *
 *   1. LECTURA EXTERIOR — el vídeo de EVA de perfil y la imagen de la cápsula,
 *      con la biolectura: una pasada de partículas que se detiene en los bordes.
 *   2. LECTURA INTERNA — un modelo que late: corazón, vasos y seis órganos que
 *      se eligen, cada uno con su lectura y su acción.
 *
 * Son dos piezas consecutivas, no una encima de otra: el interior es un modelo
 * ficcional, no anatomía sacada de la imagen. Entre las dos, un hilo de señal
 * que se enciende cuando el exterior está analizado (`html[data-body]`, que
 * escribe la biolectura).
 *
 * Abre la cinta del genoma, que en la v6 era todo lo que había en este hueco:
 * la secuencia entra en el cuerpo antes de que el cuerpo se vea. Cada lectura
 * es un slide; el lugar, para la navegación y el canal, es la sección entera.
 */
export function CuerpoSection() {
  const copy = ejes.cuerpo;
  const place = subById('cuerpo');

  return (
    <section
      id="cuerpo"
      className="section node node--cuerpo"
      aria-labelledby="cuerpo-titulo"
      data-accent={place?.axis.accent}
    >
      {/* A sangre: la cinta cruza la página de lado a lado, fuera de la columna. */}
      <GenomeStrand label={copy.strandLabel} />

      <div className="slide cuerpo__slide">
        <div className="wrap">
          <BioReading
            head={
              <NodeHead
                id="cuerpo"
                eyebrow={`${place?.sub.name} — ${place?.sub.motto}`}
                title={copy.title}
                lede={copy.lede}
              />
            }
            foot={<p className="genome__fiction mono">{copy.exterior.fiction}</p>}
          />
        </div>
      </div>

      {/* El hilo: de lo que se ve por fuera a lo que late por dentro. */}
      <div className="wrap">
        <p className="thread mono" aria-hidden="true">
          <span className="thread__from">{copy.thread.from}</span>
          <span className="thread__line" />
          <span className="thread__state">
            <b className="thread__pending">{copy.thread.pending}</b>
            <b className="thread__done">{copy.thread.done}</b>
            <i>{copy.thread.arrow}</i>
            <b className="thread__active">{copy.thread.active}</b>
          </span>
          <span className="thread__line" />
          <span className="thread__to">{copy.thread.to}</span>
        </p>
      </div>

      <div className="slide cuerpo__slide" id="cuerpo-interior">
        <div className="wrap">
          <EvaInterior
            head={
              <div className="node__titles interior__titles">
                <p className="eyebrow mono">{copy.interior.eyebrow}</p>
                <h3 className="h2 interior__title">{copy.interior.title}</h3>
                <p className="node__lede">{copy.interior.lede}</p>
              </div>
            }
            foot={<p className="genome__fiction mono">{copy.interior.fiction}</p>}
          />

          <NodeFoot id="cuerpo" />
        </div>
      </div>
    </section>
  );
}

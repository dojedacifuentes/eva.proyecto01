import { BioReading } from '@/components/eva/cuerpo/BioReading';
import { EvaInterior } from '@/components/eva/cuerpo/EvaInterior';
import { EvaWrites } from '@/components/eva/EvaWrites';
import { GenomeStrand } from '@/components/eva/GenomeStrand';
import { ejes } from '@/content/ejes';
import { subById } from '@/content/structure';
import { NodeFoot, NodeHead } from './NodeParts';

/**
 * 01.11 · Cuerpo. La tercera parte de la Entidad, en tres lecturas seguidas y
 * todas a la vista —nada se abre con clic—:
 *
 *   1. PERFIL — el vídeo de perfil con la biolectura (una pasada de partículas
 *      que se detiene en los bordes) y la caja donde EVA cuenta el chasis: cómo
 *      la dotaron de un cuerpo y en qué se equipara a un humano.
 *   2. CÁPSULA — el vídeo de la cápsula, su biolectura y la caja de la
 *      inmersión: cómo su conciencia explora los sentidos.
 *   3. INTERIOR — un modelo que late: corazón, vasos y seis órganos que se
 *      eligen, cada uno con su lectura y su acción.
 *
 * Son piezas consecutivas, no una encima de otra: el interior es un modelo
 * ficcional, no anatomía sacada de la imagen. Entre las exteriores y la
 * interna, un hilo de señal que se enciende cuando el exterior está analizado
 * (`html[data-body]`, que escribe la biolectura).
 *
 * Abre la cinta del genoma: la secuencia entra en el cuerpo antes de que el
 * cuerpo se vea. El lugar, para la navegación y el canal, es la sección entera.
 */
export function CuerpoSection() {
  const copy = ejes.cuerpo;
  const place = subById('cuerpo');
  const code = place?.sub.code;
  const name = place?.sub.name.toUpperCase();

  return (
    <section
      id="cuerpo"
      className="section node node--cuerpo"
      aria-labelledby="cuerpo-titulo"
      data-accent={place?.sub.accent}
    >
      <div className="slide cuerpo__slide">
        {/* A sangre: la cinta cruza la página de lado a lado, fuera de la columna, y abre el primer slide. */}
        <GenomeStrand label={copy.strandLabel} />
        <div className="wrap">
          <NodeHead id="cuerpo" eyebrow={`${place?.sub.name} — ${place?.sub.motto}`} title={copy.title} />
          <BioReading
            view="profile"
            writes={
              <EvaWrites
                id="cuerpo-perfil"
                place={`${code} · ${name} · ${copy.exterior.views.profile.name.toUpperCase()}`}
                blocks={copy.exterior.views.profile.writes}
              />
            }
            foot={
              <p key="fiction" className="genome__fiction mono">
                {copy.exterior.fiction}
              </p>
            }
          />
        </div>
      </div>

      <div className="slide cuerpo__slide" id="cuerpo-capsula">
        <div className="wrap">
          <BioReading
            view="front"
            writes={
              <EvaWrites
                id="cuerpo-capsula"
                place={`${code} · ${name} · ${copy.exterior.views.front.name.toUpperCase()}`}
                blocks={copy.exterior.views.front.writes}
              />
            }
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
              /* Con claves: al cruzar de servidor a cliente, React valida estos hijos como una lista. */
              <div className="node__titles interior__titles">
                <p key="eyebrow" className="eyebrow mono">
                  {copy.interior.eyebrow}
                </p>
                <h3 key="title" className="h2 interior__title">
                  {copy.interior.title}
                </h3>
                <EvaWrites
                  key="writes"
                  id="cuerpo-interior"
                  place={`${code} · ${name} · ${copy.interior.hud.id}`}
                  blocks={copy.interior.writes}
                  className="writes--tight"
                />
              </div>
            }
            foot={
              /* Con clave: llega del servidor y se coloca en una lista de hijos. */
              <p key="fiction" className="genome__fiction mono">
                {copy.interior.fiction}
              </p>
            }
          />

          <NodeFoot id="cuerpo" />
        </div>
      </div>
    </section>
  );
}

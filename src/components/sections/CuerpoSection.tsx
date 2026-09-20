import { BioReading } from '@/components/eva/cuerpo/BioReading';
import { EvaWrites } from '@/components/eva/EvaWrites';
import { ejes } from '@/content/ejes';
import { axisById, axisMottos } from '@/content/structure';
import { NodeFoot, NodeHead } from './NodeParts';

/**
 * 100 · Cuerpo. El último lugar, y el único que se mira desde fuera: el vídeo
 * de perfil con la biolectura —una pasada de partículas que se detiene en los
 * bordes, a un botón— y la caja donde EVA cuenta el chasis: cómo la dotaron de
 * un cuerpo y en qué se equipara a un humano.
 *
 * De las tres pantallas que tenía en la v8.2 (perfil, cápsula e interior) vuelve
 * una sola, por decisión del propietario (v9.2): un vídeo, no dos, y sin el
 * modelo 3D. La cápsula (`view="front"`), el interior (`eva/cuerpo/EvaInterior`),
 * el hilo entre ambos y la cinta del genoma siguen en el repositorio, sin montar.
 */
export function CuerpoSection() {
  const copy = ejes.cuerpo;
  const place = axisById('cuerpo');
  const take = copy.exterior.views.profile;

  return (
    <section
      id="cuerpo"
      className="slide section node node--cuerpo cuerpo__slide"
      aria-labelledby="cuerpo-titulo"
      data-accent={place?.accent}
    >
      <div className="wrap">
        <NodeHead id="cuerpo" eyebrow={`${place?.name} — ${axisMottos.cuerpo}`} title={copy.title} />
        <BioReading
          view="profile"
          writes={
            <EvaWrites
              id="cuerpo-perfil"
              place={`${place?.code} · ${place?.name.toUpperCase()} · ${take.name.toUpperCase()}`}
              blocks={take.writes}
            />
          }
          foot={
            <p key="fiction" className="genome__fiction mono">
              {copy.exterior.fiction}
            </p>
          }
        />

        <NodeFoot id="cuerpo" />
      </div>
    </section>
  );
}

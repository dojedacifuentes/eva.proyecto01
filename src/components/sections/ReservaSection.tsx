import { GenomeStrand } from '@/components/eva/GenomeStrand';
import { ejes } from '@/content/ejes';
import { subById } from '@/content/structure';
import { NodeFoot, NodeHead } from './NodeParts';

/**
 * 01.11 · Por definir. Una banda, no un slide: reserva el sitio de la tercera
 * subsección de Entidad sin adjudicarle tema, interacciones ni contenido.
 *
 * Lo único que se ve es el genoma de EVA, a la vista y de corrido, en magenta
 * y violeta: la secuencia sigue pasando por un lugar que todavía no tiene
 * nombre. No inventar nada más aquí hasta que se defina.
 */
export function ReservaSection() {
  const copy = ejes.reserva;
  const place = subById('reserva');

  return (
    <section
      id="reserva"
      className="section node node--reserva"
      aria-labelledby="reserva-titulo"
      data-state="reserved"
    >
      <div className="wrap">
        <NodeHead
          id="reserva"
          eyebrow={`${place?.axis.name} · ${place?.sub.ordinal}`}
          title={place?.sub.name ?? ''}
          state={place?.sub.stateLabel}
        />
      </div>

      {/* A sangre: la cinta cruza la página de lado a lado, fuera de la columna. */}
      <GenomeStrand label={copy.strandLabel} />

      <div className="wrap">
        <p className="node__note">{copy.line}</p>
        <NodeFoot id="reserva" />
      </div>
    </section>
  );
}

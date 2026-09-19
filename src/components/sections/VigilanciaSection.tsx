import type { CSSProperties } from 'react';
import { EvaAcronymMesh } from '@/components/eva/EvaAcronymMesh';
import { ejes } from '@/content/ejes';
import { axisById } from '@/content/structure';
import { NodeFoot, NodeHead } from './NodeParts';

/** Cuántas veces se repite el rótulo en la faja: las justas para cruzar la pantalla. */
const REPEAT = 8;

/**
 * 10 · Vigilancia — clausurada. El enlace de la navegación llega aquí: a un
 * estado, no a un vacío ni a una carga que no termina.
 *
 * La «V» del acrónimo, quieta y en magenta, cruzada por una faja de clausura
 * administrativa. El fondo se frena al entrar (lo pide `ContextSpy`). No hay
 * contenido ni funciones: sólo el estado y la frase con la que EVA explica su
 * segunda letra, que es canon del proyecto. No inventar más aquí.
 */
export function VigilanciaSection() {
  const copy = ejes.vigilancia;
  const axis = axisById('vigilancia');

  return (
    <section
      id="vigilancia"
      className="slide section node node--axis node--sealed"
      aria-labelledby="vigilancia-titulo"
      data-axis="vigilancia"
      data-state="sealed"
    >
      <div className="wrap">
        <div className="axis">
          <div className="axis__figure" aria-hidden="true">
            <EvaAcronymMesh
              letters={[axis?.letter ?? 'V']}
              fontVar="--font-orbitron"
              mode="sealed"
              palette="seal"
              className="axis__mesh"
            />
            <div className="seal">
              <p className="seal__tape mono">
                {Array.from({ length: REPEAT }, (_, at) => (
                  <span key={at} style={{ '--i': at } as CSSProperties}>
                    {copy.seal} <i data-bin="">{axis?.code}</i> {copy.sealMeta}
                  </span>
                ))}
              </p>
            </div>
          </div>

          <div className="axis__copy">
            <NodeHead
              id="vigilancia"
              eyebrow={`${axis?.name} · ${axis?.ordinal}`}
              title={axis?.name ?? ''}
              state={axis?.stateLabel}
            />
            <p className="axis__line">{copy.line}</p>
            <p className="node__note">{copy.note}</p>
          </div>
        </div>

        <NodeFoot id="vigilancia" />
      </div>
    </section>
  );
}

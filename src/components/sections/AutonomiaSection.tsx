import { EvaAcronymMesh } from '@/components/eva/EvaAcronymMesh';
import { ejes } from '@/content/ejes';
import { axisById } from '@/content/structure';
import { NodeFoot, NodeHead } from './NodeParts';

/**
 * 11 · Autonomía — en desarrollo. La «A» del acrónimo a medio ensamblar: los
 * nodos están todos, pero las aristas intentan conectarse y se sueltan. Sin
 * porcentajes ni barras de progreso: no se finge un avance que no existe.
 *
 * La estructura ya está preparada para recibir subsecciones: en cuanto
 * `structure.ts` le dé hijos a este eje, aparecen aquí con su ruta binaria
 * (11.01, 11.10…). Mientras tanto queda un registro vacío con el cursor
 * esperando. No inventar contenido aquí.
 */
export function AutonomiaSection() {
  const copy = ejes.autonomia;
  const axis = axisById('autonomia');
  const children = axis?.children ?? [];

  return (
    <section
      id="autonomia"
      className="slide section node node--axis node--building"
      aria-labelledby="autonomia-titulo"
      data-axis="autonomia"
      data-state="building"
    >
      <div className="wrap">
        <div className="axis">
          <div className="axis__figure" aria-hidden="true">
            <EvaAcronymMesh
              letters={[axis?.letter ?? 'A']}
              fontVar="--font-orbitron"
              mode="building"
              palette="growth"
              className="axis__mesh"
            />
            <span className="scaffold" />
          </div>

          <div className="axis__copy">
            <NodeHead
              id="autonomia"
              eyebrow={`${axis?.name} · ${axis?.ordinal}`}
              title={axis?.name ?? ''}
              state={axis?.stateLabel}
            />
            <p className="axis__line">{copy.line}</p>
            <p className="node__note">{copy.note}</p>

            <div className="slots">
              <p className="slots__label mono">{copy.slotLabel}</p>
              <ul className="slots__list mono">
                {children.map((child) => (
                  <li key={child.id}>
                    <b aria-hidden="true" data-bin="">
                      {child.code}
                    </b>{' '}
                    {child.name}
                  </li>
                ))}
                {/* El hueco siguiente: el código del eje, un punto y el cursor. */}
                <li className="slots__next">
                  <b aria-hidden="true">
                    <span data-bin="">{axis?.code}</span>.__
                  </b>{' '}
                  <span>{copy.slotEmpty}</span>
                  <i aria-hidden="true" className="slots__caret">
                    ▊
                  </i>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <NodeFoot id="autonomia" />
      </div>
    </section>
  );
}

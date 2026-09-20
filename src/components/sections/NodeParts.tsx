import { ui } from '@/content/site';
import { contextById, contextNodes, home, nextContext, structureLabels } from '@/content/structure';

interface NodeHeadProps {
  /** Id del lugar en `structure.ts`: de ahí salen el código y el acento. */
  id: string;
  /** Antetítulo: el nombre del lugar y, si lo tiene, su lema. */
  eyebrow: string;
  title: string;
  lede?: string;
  /** Rótulo de estado junto al código: «CLAUSURADA», «EN DESARROLLO», «RESERVA…». */
  state?: string;
  /** El título existe para lectores de pantalla pero no se ve: la pieza visual es la sección. */
  quiet?: boolean;
}

/**
 * Cabecera de un lugar del recorrido: el código binario grande y en contorno,
 * el antetítulo y el título. Los bits son adorno; el `h2` lleva el nombre.
 */
export function NodeHead({ id, eyebrow, title, lede, state, quiet = false }: NodeHeadProps) {
  const node = contextById(id);
  const at = contextNodes.findIndex((item) => item.id === id);

  return (
    <div className="node__head reveal">
      <span aria-hidden="true" className="node__code mono" data-bin="">
        {node?.code}
      </span>
      {/* La ficha del experimento: identidad, sesión y posición del módulo. Adorno de instrumento. */}
      <p aria-hidden="true" className="node__meta mono">
        <span>{ui.meta.experiment}</span>
        <span>{ui.meta.session}</span>
        <span>
          {ui.meta.module} {at}/{contextNodes.length - 1} · {ui.meta.state}
        </span>
      </p>
      <div className="node__titles">
        <p className="eyebrow mono">
          {eyebrow}
          {state && <span className="node__state">{state}</span>}
        </p>
        <h2 id={`${id}-titulo`} className={quiet ? 'sr-only' : 'h2'}>
          {title}
        </h2>
        {lede && <p className="node__lede">{lede}</p>}
      </div>
    </div>
  );
}

/** Pie de slide: dónde se está dentro del recorrido y el paso al lugar siguiente. */
export function NodeFoot({ id }: { id: string }) {
  const node = contextById(id);
  const next = nextContext(id);
  const last = contextNodes[contextNodes.length - 1];

  return (
    <p className="slide__foot mono">
      <span aria-hidden="true">
        <b data-bin="">{node?.code}</b> {structureLabels.of} <span data-bin="">{last.code}</span>
      </span>
      {next ? (
        <a href={`#${next.id}`} data-sound="open" aria-label={next.name}>
          <span aria-hidden="true">
            <b data-bin="">{next.code}</b> — {next.name} ↓
          </span>
        </a>
      ) : (
        <a href={home.href} data-sound="open">
          {structureLabels.back} <span aria-hidden="true">↑</span>
        </a>
      )}
    </p>
  );
}

'use client';

import { useSyncExternalStore } from 'react';
import { contextById, contextNodes, structureLabels } from '@/content/structure';
import { getContext, getContextOnServer, subscribeContext } from '@/lib/context';

/** Las cuatro celdas del registro: dos bits de eje y dos de subsección. */
function cells(code: string): (boolean | null)[] {
  const [axis, sub] = code.split('.');
  const bits = (group: string | undefined) =>
    group ? [...group].map((bit) => bit === '1') : [null, null];
  return [...bits(axis), ...bits(sub)];
}

/**
 * Riel de posición: un registro de bits que se enciende según el lugar del
 * recorrido, y debajo, una marca por lugar. La numeración binaria se entiende
 * aquí como patrón aunque no se sepa leer: «01» es una luz, «11» son dos.
 *
 * Sólo en escritorio; en móvil la jerarquía completa está en el menú. Las
 * celdas son adorno: cada marca es un enlace con nombre accesible propio.
 */
export function BitRail() {
  const current = useSyncExternalStore(subscribeContext, getContext, getContextOnServer);
  const node = contextById(current) ?? contextNodes[0];
  const bits = cells(node.code);

  return (
    <nav className="rail" aria-label={structureLabels.rail} data-accent={node.accent}>
      <span aria-hidden="true" className="rail__register">
        {bits.map((bit, at) => (
          <i key={at} data-on={bit === true || undefined} data-void={bit === null || undefined} data-gap={at === 2 || undefined} />
        ))}
      </span>
      <span aria-hidden="true" className="rail__code mono" data-bin="">
        {node.code}
      </span>
      <ol className="rail__list">
        {contextNodes.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              data-nav-target={item.id}
              data-state={item.state}
              data-sound="open"
              aria-label={item.name}
              data-cursor-label={item.code}
            >
              <i aria-hidden="true" />
              <span aria-hidden="true" className="rail__name mono">
                <b data-bin="">{item.code}</b> {item.name}
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

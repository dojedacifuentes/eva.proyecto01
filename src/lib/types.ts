/** Modelo canónico del contenido de EVA. Los componentes sólo conocen estos tipos. */

export type AccentToken = 'cyan' | 'yellow' | 'magenta' | 'violet';

/**
 * Disponibilidad de un nodo del recorrido.
 * `active` se visita · `sealed` está clausurado · `building` está en
 * desarrollo · `reserved` es un hueco guardado, sin contenido asignado.
 */
export type NodeState = 'active' | 'sealed' | 'building' | 'reserved';

/** Una subsección dentro de un eje: «01.10 · Genoma digital». */
export interface NavChild {
  id: string;
  /** Ruta binaria visible: «01.10». Sale de `lib/binary`, nunca se escribe a mano. */
  code: string;
  name: string;
  state: NodeState;
  /** Rótulo del estado cuando no es `active`: «POR DEFINIR». */
  stateLabel?: string;
  /** Lo que oye un lector de pantalla en lugar de los bits: «subsección 2 de 3». */
  ordinal: string;
  href: `#${string}`;
}

/** Un eje de la navegación. Hoy hay uno solo: Entidad. */
export interface NavItem {
  id: string;
  /** Código binario visible: «01». */
  code: string;
  name: string;
  accent: AccentToken;
  state: NodeState;
  stateLabel?: string;
  ordinal: string;
  /** Ancla dentro de la portada. */
  href: `#${string}`;
  children: readonly NavChild[];
}

/**
 * Un lugar del recorrido que el visitante puede estar mirando: la portada, una
 * subsección de Entidad o un eje sin subsecciones. El canal de EVA, la navegación y el
 * fondo leen de aquí dónde está el visitante.
 */
export interface ContextNode {
  id: string;
  code: string;
  name: string;
  /** Eje al que pertenece; la portada no pertenece a ninguno. */
  axisId: string | null;
  accent: AccentToken;
  state: NodeState;
}

/**
 * EVA // ESTRUCTURA
 *
 * El recorrido entero, en un solo sitio. Tres preguntas, en este orden:
 *
 *   00 · Portada
 *   01 · CONSCIENCIA — ¿quién siente, si nadie dentro sabe que es yo?
 *   10 · GENOMA      — ¿es lo mismo una hélice que una cadena de bits?
 *   11 · CEREBRO     — ¿piensa una red lo que piensa un cerebro?
 *
 * En la v9 cada lugar es un eje sin partes: la página dejó de ser un
 * inventario (la Entidad y sus tres piezas) para ser un cuestionamiento. El
 * Cuerpo (01.11 de la v8) salió del recorrido; sus componentes siguen en
 * `components/eva/cuerpo/` y sus textos en `content/cuerpo.ts`, sin montar.
 *
 * El nombre de EVA sigue siendo «Entidad de Vigilancia y Autonomía»
 * (`site.expansion`): es su nombre, no el índice de la página.
 *
 * La cabecera, el riel de bits, el menú móvil, el pie, los pies de slide, la
 * portada y el canal de EVA leen de aquí. Los códigos no se escriben: se
 * calculan con `lib/binary` a partir de la posición real de cada nodo, con el
 * ancho fijo de su serie. Mover un lugar de sitio le cambia el código en toda
 * la página.
 */

import { bin, binPath, bitsFor, ordinalLabel } from '@/lib/binary';
import type { AccentToken, ContextNode, NavChild, NavItem, NodeState } from '@/lib/types';

interface SubSource {
  id: string;
  name: string;
  /** Lema corto de la subsección; va como antetítulo. */
  motto: string;
  state: NodeState;
  stateLabel?: string;
  /** Acento propio; si falta, hereda el del eje. Desde la v8 cada parte tiene el suyo. */
  accent?: AccentToken;
}

interface AxisSource {
  id: string;
  name: string;
  accent: AccentToken;
  state: NodeState;
  stateLabel: string;
  children: readonly SubSource[];
}

/** El orden de esta lista es el orden de la página y el origen de los códigos. */
const SOURCE: readonly AxisSource[] = [
  {
    id: 'consciencia',
    name: 'Consciencia',
    accent: 'violet',
    state: 'active',
    stateLabel: 'En línea',
    children: [],
  },
  {
    id: 'genoma',
    name: 'Genoma',
    accent: 'bio',
    state: 'active',
    stateLabel: 'En línea',
    children: [],
  },
  {
    id: 'cerebro',
    name: 'Cerebro',
    accent: 'cyan',
    state: 'active',
    stateLabel: 'En línea',
    children: [],
  },
];

/** Ancho de cada serie: los bits de su índice mayor. La portada es el 0 de los ejes. */
export const AXIS_BITS = bitsFor(SOURCE.length);
export const SUB_BITS = bitsFor(Math.max(1, ...SOURCE.map((axis) => axis.children.length)));

export interface SubNode extends NavChild {
  motto: string;
  /** Posición dentro de su eje, empezando en 1. */
  index: number;
  /** Color del lugar: el suyo o, si no lo tiene, el de su eje. */
  accent: AccentToken;
}

export interface AxisNode extends Omit<NavItem, 'children'> {
  /** Posición entre los ejes, empezando en 1: la portada ocupa el 0. */
  index: number;
  stateLabel: string;
  children: readonly SubNode[];
}

/** La portada: el cero de la serie de ejes. */
export const home = {
  id: 'inicio',
  code: bin(0, AXIS_BITS),
  name: 'Portada',
  href: '#inicio',
} as const;

export const axes: readonly AxisNode[] = SOURCE.map((axis, axisAt) => {
  const index = axisAt + 1;
  return {
    id: axis.id,
    index,
    code: bin(index, AXIS_BITS),
    name: axis.name,
    accent: axis.accent,
    state: axis.state,
    stateLabel: axis.stateLabel,
    ordinal: `eje ${ordinalLabel(index, SOURCE.length)}`,
    href: `#${axis.id}`,
    children: axis.children.map((child, childAt) => ({
      id: child.id,
      index: childAt + 1,
      code: binPath([index, childAt + 1], Math.max(AXIS_BITS, SUB_BITS)),
      name: child.name,
      motto: child.motto,
      state: child.state,
      stateLabel: child.stateLabel,
      ordinal: `subsección ${ordinalLabel(childAt + 1, axis.children.length)}`,
      href: `#${child.id}`,
      accent: child.accent ?? axis.accent,
    })),
  };
});

/** El lema de cada lugar: va como antetítulo, junto al nombre. */
export const axisMottos: Readonly<Record<string, string>> = {
  consciencia: 'Autoobservación',
  genoma: 'Información que persiste',
  cerebro: 'Predicción',
};

/** Los ejes como destinos de navegación: cabecera y menú móvil. */
export const navItems: readonly NavItem[] = axes;

/**
 * Las puertas: los destinos a los que se entra de verdad. Un eje con
 * subsecciones no es una puerta: lo son sus subsecciones; un eje sin partes
 * es puerta él mismo. La portada y el pie las listan: las tres partes de la
 * Entidad y la Consciencia.
 */
export interface Door extends NavChild {
  accent: AccentToken;
}

export const doors: readonly Door[] = axes.flatMap((axis): Door[] =>
  axis.children.length > 0
    ? axis.children.map((child) => ({
        id: child.id,
        code: child.code,
        name: child.name,
        state: child.state,
        stateLabel: child.stateLabel,
        ordinal: child.ordinal,
        href: child.href,
        accent: child.accent,
      }))
    : [
        {
          id: axis.id,
          code: axis.code,
          name: axis.name,
          state: axis.state,
          stateLabel: axis.stateLabel,
          ordinal: axis.ordinal,
          href: axis.href,
          accent: axis.accent,
        },
      ],
);

/**
 * Los lugares que el visitante puede estar mirando, en el orden de la página.
 * Un eje con subsecciones no es un lugar: lo son sus subsecciones.
 */
export const contextNodes: readonly ContextNode[] = [
  { id: home.id, code: home.code, name: home.name, axisId: null, accent: 'cyan', state: 'active' },
  ...axes.flatMap((axis): ContextNode[] =>
    axis.children.length > 0
      ? axis.children.map((child) => ({
          id: child.id,
          code: child.code,
          name: child.name,
          axisId: axis.id,
          accent: child.accent,
          state: child.state,
        }))
      : [
          {
            id: axis.id,
            code: axis.code,
            name: axis.name,
            axisId: axis.id,
            accent: axis.accent,
            state: axis.state,
          },
        ],
  ),
];

export function axisById(id: string): AxisNode | undefined {
  return axes.find((axis) => axis.id === id);
}

export function subById(id: string): { axis: AxisNode; sub: SubNode } | undefined {
  for (const axis of axes) {
    const sub = axis.children.find((child) => child.id === id);
    if (sub) return { axis, sub };
  }
  return undefined;
}

export function contextById(id: string | null): ContextNode | undefined {
  return contextNodes.find((node) => node.id === id);
}

/** El lugar siguiente en el recorrido, para el pie de cada slide. */
export function nextContext(id: string): ContextNode | undefined {
  const at = contextNodes.findIndex((node) => node.id === id);
  return at >= 0 ? contextNodes[at + 1] : undefined;
}

/**
 * Anclas de versiones anteriores, para que ningún enlace viejo se quede sin
 * destino: el núcleo de la v8 es hoy el cerebro; el cuerpo y la entidad, que
 * salieron del recorrido en la v9, llevan a la pregunta que los sustituye.
 */
export const hashAliases: Readonly<Record<string, string>> = {
  nucleo: 'cerebro',
  cuerpo: 'consciencia',
  entidad: 'consciencia',
  redes: 'consciencia',
  causas: 'consciencia',
  bitacora: 'consciencia',
  reserva: 'consciencia',
  vigilancia: 'inicio',
  autonomia: 'inicio',
};

/** Rótulos de la navegación que no pertenecen a ningún nodo. */
export const structureLabels = {
  nav: 'Recorrido de EVA',
  subnav: 'Partes de',
  rail: 'Posición en el recorrido',
  back: 'Volver a la portada',
  /** Pie de slide: «01 / 11» se lee como lugar actual sobre el último. */
  of: '/',
} as const;

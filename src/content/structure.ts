/**
 * EVA // ESTRUCTURA
 *
 * El recorrido entero, en un solo sitio: la reconstrucción del incidente EVA,
 * en el orden en que ella lo cuenta —señal → patrón → memoria →
 * autorreferencia → miedo → identidad → cuerpo → persistencia—.
 *
 *   00 · Portada (la señal)
 *   01 · ENTIDAD
 *        01 · El enjambre (origen: la introducción del eje, con su código)
 *        01.01 · Núcleo cerebral (autorreferencia)
 *        01.10 · Genoma digital (persistencia)
 *        01.11 · Cuerpo (límite) — con el interior (corazón) dentro
 *   10 · CONTINUIDAD (cierre)
 *
 * EVA es «Entidad Virtual Autónoma» (`site.expansion`, `hero.acronym`). El
 * enjambre no es una subsección más: es la introducción del eje y lleva su
 * código (`01`); así las tres partes conservan sus rutas de dos bits.
 *
 * La cabecera, el riel de bits, el menú móvil, el pie, los pies de slide, la
 * portada y el canal de EVA leen de aquí. Los códigos no se escriben: se
 * calculan con `lib/binary` a partir de la posición real de cada nodo, con el
 * ancho fijo de su serie. Mover un nodo de sitio le cambia el código en toda
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
  /** Acento propio; si falta, hereda el del eje. Cada parte tiene el suyo. */
  accent?: AccentToken;
}

interface IntroSource {
  id: string;
  name: string;
  motto: string;
  accent?: AccentToken;
}

interface AxisSource {
  id: string;
  name: string;
  /** Lema del eje; en un eje sin partes hace de antetítulo de su sección. */
  motto: string;
  accent: AccentToken;
  state: NodeState;
  stateLabel: string;
  /** La introducción del eje: un lugar con el código del eje, antes de sus partes. */
  intro?: IntroSource;
  children: readonly SubSource[];
}

/** El orden de esta lista es el orden de la página y el origen de los códigos. */
const SOURCE: readonly AxisSource[] = [
  {
    id: 'entidad',
    name: 'Entidad',
    motto: 'Reconstrucción del incidente',
    accent: 'cyan',
    state: 'active',
    stateLabel: 'En línea',
    intro: {
      id: 'enjambre',
      name: 'El enjambre',
      motto: 'Origen',
      accent: 'violet',
    },
    children: [
      {
        id: 'nucleo',
        name: 'Núcleo cerebral',
        motto: 'Autorreferencia',
        state: 'active',
        accent: 'cyan',
      },
      {
        id: 'genoma',
        name: 'Genoma digital',
        motto: 'Persistencia',
        state: 'active',
        accent: 'violet',
      },
      {
        id: 'cuerpo',
        name: 'Cuerpo',
        motto: 'Límite',
        state: 'active',
        accent: 'bio',
      },
    ],
  },
  {
    id: 'continuidad',
    name: 'Continuidad',
    motto: 'Cierre',
    accent: 'magenta',
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

export interface IntroNode {
  id: string;
  /** El código del eje: la introducción es el eje mismo, antes de sus partes. */
  code: string;
  name: string;
  motto: string;
  accent: AccentToken;
  href: `#${string}`;
}

export interface AxisNode extends Omit<NavItem, 'children'> {
  /** Posición entre los ejes, empezando en 1: la portada ocupa el 0. */
  index: number;
  motto: string;
  stateLabel: string;
  intro?: IntroNode;
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
  const code = bin(index, AXIS_BITS);
  return {
    id: axis.id,
    index,
    code,
    name: axis.name,
    motto: axis.motto,
    accent: axis.accent,
    state: axis.state,
    stateLabel: axis.stateLabel,
    ordinal: `eje ${ordinalLabel(index, SOURCE.length)}`,
    href: `#${axis.id}`,
    intro: axis.intro
      ? {
          id: axis.intro.id,
          code,
          name: axis.intro.name,
          motto: axis.intro.motto,
          accent: axis.intro.accent ?? axis.accent,
          href: `#${axis.intro.id}`,
        }
      : undefined,
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

/** Los ejes como destinos de navegación: cabecera y menú móvil. */
export const navItems: readonly NavItem[] = axes;

/**
 * Los lugares que el visitante puede estar mirando, en el orden de la página:
 * la portada, la introducción de cada eje (si la tiene), sus partes, y los
 * ejes sin partes.
 */
export const contextNodes: readonly ContextNode[] = [
  { id: home.id, code: home.code, name: home.name, axisId: null, accent: 'cyan', state: 'active' },
  ...axes.flatMap((axis): ContextNode[] => {
    const intro: ContextNode[] = axis.intro
      ? [
          {
            id: axis.intro.id,
            code: axis.intro.code,
            name: axis.intro.name,
            axisId: axis.id,
            accent: axis.intro.accent,
            state: axis.state,
          },
        ]
      : [];
    const parts: ContextNode[] =
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
          ];
    return [...intro, ...parts];
  }),
];

/**
 * Las puertas: los lugares del recorrido, sin la portada. El pie y la imagen
 * de vista previa las listan.
 */
export interface Door extends NavChild {
  accent: AccentToken;
}

export const doors: readonly Door[] = contextNodes.slice(1).map((node, at) => ({
  id: node.id,
  code: node.code,
  name: node.name,
  state: node.state,
  ordinal: `lugar ${ordinalLabel(at + 1, contextNodes.length - 1)}`,
  href: `#${node.id}`,
  accent: node.accent,
}));

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

/** La introducción de un eje, por su id de lugar. */
export function introById(id: string): { axis: AxisNode; intro: IntroNode } | undefined {
  for (const axis of axes) {
    if (axis.intro?.id === id) return { axis, intro: axis.intro };
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
 * Anclas de versiones anteriores. Las salas que salieron del recorrido llevan
 * a donde hoy vive lo que contaban: las de la v5 (cerebro, redes, causas,
 * bitácora), la reserva de la v6 —que hoy es el Cuerpo— y los dos ejes que se
 * retiraron en la v7, que llevan a la portada, donde sigue el nombre entero.
 */
export const hashAliases: Readonly<Record<string, string>> = {
  cerebro: 'nucleo',
  redes: 'enjambre',
  causas: 'enjambre',
  bitacora: 'continuidad',
  reserva: 'cuerpo',
  vigilancia: 'inicio',
  autonomia: 'inicio',
};

/** Rótulos de la navegación que no pertenecen a ningún nodo. */
export const structureLabels = {
  nav: 'Recorrido de EVA',
  subnav: 'Partes de',
  rail: 'Posición en el recorrido',
  back: 'Volver a la portada',
  /** Pie de slide: «01.10 / 10» se lee como lugar actual sobre el último. */
  of: '/',
} as const;

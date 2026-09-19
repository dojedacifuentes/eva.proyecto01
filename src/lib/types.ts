/** Modelo canónico del contenido de EVA. Los componentes sólo conocen estos tipos. */

export type AccentToken = 'cyan' | 'yellow' | 'magenta' | 'violet';

/** Un destino de la navegación: una sala del laboratorio, dentro de la portada. */
export interface NavItem {
  id: string;
  /** Código técnico visible: «01», «02»… */
  code: string;
  name: string;
  accent: AccentToken;
  /** Ancla dentro de la portada. */
  href: `#${string}`;
}

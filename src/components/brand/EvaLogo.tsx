import { BRAND_COLORS, SEAM, polygonsOf, viewBoxOf, type PoseId } from '@/lib/brand';

interface LogoProps {
  /** `logotype`: el nombre (ƎVΛ). `isotype`: el símbolo (el cuadrado sobre la X). */
  pose?: Extract<PoseId, 'logotype' | 'isotype'>;
  /**
   * Prefijo de los id del SVG (degradados y filtro). Tiene que ser único en la
   * página: la cabecera y el pie llevan cada uno el suyo.
   */
  id: string;
  className?: string;
}

/** Aire alrededor de la figura para que el halo no se recorte, en unidades de la marca. */
const PAD = 1.6;

/**
 * La marca de EVA, quieta. Dos capas: debajo, el halo (azul eléctrico a la
 * izquierda, violeta a la derecha, desenfocado); encima, el trazo, casi blanco.
 * Van en dos `<svg>` separados para que el halo pueda respirar con `opacity`
 * sin volver a pintar el trazo ni recalcular el desenfoque: el compositor mueve
 * la capa entera.
 *
 * Es de servidor y decorativa: quien la usa pone el nombre accesible (el
 * enlace de la cabecera lleva su `aria-label`; el pie, un texto oculto).
 */
export function EvaLogo({ pose = 'logotype', id, className = '' }: LogoProps) {
  const box = viewBoxOf(pose, PAD);
  const viewBox = `${box.x} ${box.y} ${box.width} ${box.height}`;
  const shapes = polygonsOf(pose);
  const across = { x1: box.x + PAD, x2: box.x + box.width - PAD, y1: 0, y2: 0 };

  return (
    <span className={`brand-logo brand-logo--${pose} ${className}`} aria-hidden="true">
      <svg className="brand-logo__halo" viewBox={viewBox} focusable="false">
        <defs>
          <linearGradient id={`${id}-glow`} gradientUnits="userSpaceOnUse" {...across}>
            <stop offset="0" stopColor={BRAND_COLORS.glow[0]} />
            <stop offset="0.5" stopColor={BRAND_COLORS.glow[1]} />
            <stop offset="1" stopColor={BRAND_COLORS.glow[2]} />
          </linearGradient>
          {/* Dos desenfoques: uno ancho (el halo) y otro corto (el brillo pegado al trazo). */}
          <filter id={`${id}-blur`} x="-25%" y="-80%" width="150%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.1" result="wide" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.35" result="tight" />
            <feMerge>
              <feMergeNode in="wide" />
              <feMergeNode in="wide" />
              <feMergeNode in="tight" />
            </feMerge>
          </filter>
        </defs>
        <g fill={`url(#${id}-glow)`} filter={`url(#${id}-blur)`}>
          {shapes.map((shape) => (
            <polygon key={shape.id} points={shape.points} />
          ))}
        </g>
      </svg>
      <svg className="brand-logo__core" viewBox={viewBox} focusable="false">
        <defs>
          <linearGradient id={`${id}-core`} gradientUnits="userSpaceOnUse" {...across}>
            <stop offset="0" stopColor={BRAND_COLORS.core[0]} />
            <stop offset="0.5" stopColor={BRAND_COLORS.core[1]} />
            <stop offset="1" stopColor={BRAND_COLORS.core[2]} />
          </linearGradient>
        </defs>
        {/* El contorno tapa la costura de los vértices (ver SEAM). */}
        <g fill={`url(#${id}-core)`} stroke={`url(#${id}-core)`} strokeWidth={SEAM}>
          {shapes.map((shape) => (
            <polygon key={shape.id} points={shape.points} />
          ))}
        </g>
      </svg>
    </span>
  );
}

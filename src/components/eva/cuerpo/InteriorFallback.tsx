import type { OrganId } from '@/content/ejes';
import { BODY_HEIGHT, BODY_WIDTH, GHOST, ORGANS, VESSELS, project, type GhostPart } from './interior-data';

/** Unidades del modelo → unidades del dibujo. */
const UNIT = 100;
const WIDTH = BODY_WIDTH * UNIT;
const HEIGHT = BODY_HEIGHT * UNIT;

const at = (point: readonly [number, number, number]) => {
  const { x, y } = project(point);
  return { x: x * WIDTH, y: y * HEIGHT };
};

/** Una pieza de la silueta, vista de frente. */
function GhostShape({ part }: { part: GhostPart }) {
  const { x, y } = at(part.position);
  const [sx = 1, sy = 1] = part.scale ?? [];
  const [a = 1, b = 1, c = 1] = part.size;

  if (part.shape === 'sphere') return <ellipse cx={x} cy={y} rx={a * sx * UNIT} ry={a * sy * UNIT} />;

  if (part.shape === 'cylinder') {
    const top = a * sx * UNIT;
    const bottom = b * sx * UNIT;
    const half = (c * sy * UNIT) / 2;
    return (
      <polygon
        points={`${x - top},${y - half} ${x + top},${y - half} ${x + bottom},${y + half} ${x - bottom},${y + half}`}
      />
    );
  }

  const radius = a * UNIT;
  const half = (b * UNIT) / 2 + radius;
  return (
    <rect
      x={x - radius}
      y={y - half}
      width={radius * 2}
      height={half * 2}
      rx={radius}
      transform={`rotate(${(-(part.tilt ?? 0) * 180) / Math.PI} ${x} ${y})`}
    />
  );
}

interface InteriorFallbackProps {
  title: string;
  selected: OrganId | null;
  hovered: OrganId | null;
  xray: boolean;
  isolate: boolean;
  onSelect: (id: OrganId) => void;
  onHover: (id: OrganId | null) => void;
}

/**
 * El modelo interior sin WebGL: el mismo cuerpo, los mismos vasos y los mismos
 * órganos de `interior-data`, proyectados de frente en un SVG. Se dibuja solo a
 * partir de los datos, así que no hay dos modelos que mantener.
 *
 * Es un refuerzo visual: los órganos se eligen —con teclado y lector de
 * pantalla— en su registro de botones, fuera de aquí.
 */
export function InteriorFallback({
  title,
  selected,
  hovered,
  xray,
  isolate,
  onSelect,
  onHover,
}: InteriorFallbackProps) {
  return (
    <svg
      className="body-flat"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      data-xray={xray || undefined}
      data-isolate={(isolate && selected !== null) || undefined}
    >
      <title>{title}</title>
      <g className="body-flat__ghost">
        {GHOST.map((part) => (
          <GhostShape key={part.id} part={part} />
        ))}
      </g>

      <g className="body-flat__vessels">
        {VESSELS.map((vessel) => (
          <polyline
            key={vessel.id}
            data-type={vessel.type}
            data-chosen={(vessel.id === 'aorta' && selected === 'aorta') || undefined}
            strokeWidth={Math.max(2, vessel.radius * UNIT * 1.6)}
            points={vessel.points.map((point) => `${at(point).x},${at(point).y}`).join(' ')}
          />
        ))}
      </g>

      <g className="body-flat__organs">
        {ORGANS.map((organ) => (
          <g
            key={organ.id}
            className="body-flat__organ"
            style={{ color: organ.color }}
            data-chosen={selected === organ.id || undefined}
            data-hover={hovered === organ.id || undefined}
            onClick={() => onSelect(organ.id)}
            onPointerEnter={() => onHover(organ.id)}
            onPointerLeave={() => onHover(null)}
          >
            {organ.lobes.map((lobe, index) => (
              <ellipse
                key={index}
                cx={at(lobe.position).x}
                cy={at(lobe.position).y}
                rx={lobe.radii[0] * UNIT}
                ry={lobe.radii[1] * UNIT}
              />
            ))}
            {/* La aorta no tiene lóbulos: su zona de clic es un aro sobre su foco. */}
            {organ.lobes.length === 0 && (
              <circle cx={at(organ.focus).x} cy={at(organ.focus).y} r={0.24 * UNIT} className="body-flat__spot" />
            )}
          </g>
        ))}
      </g>
    </svg>
  );
}

import type { LinkArt } from '@/content/links';

/*
 * Ilustraciones abstractas, una por entrada, con la gramática de la marca:
 * ejes, círculos, nodos. Sin balanzas ni mazos. Van en SVG dentro de la
 * tarjeta, sin imagen que descargar. El color principal es `currentColor` (el
 * acento de la tarjeta); el blanco, `--arcade-white`.
 *
 * Las del Arcade son apaisadas (tarjeta grande); las demás, cuadradas (tarjeta
 * compacta).
 */

/** Procesal: un procedimiento como una línea de etapas sobre una retícula; una se bifurca. */
function Procesal() {
  const stages = [34, 94, 154, 214, 274];
  return (
    <>
      <defs>
        <pattern id="art-grid" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.8" fill="currentColor" opacity="0.28" />
        </pattern>
      </defs>
      <rect width="320" height="120" fill="url(#art-grid)" />
      <g fill="none" stroke="currentColor" strokeWidth="1">
        <line x1="0" y1="64" x2="320" y2="64" opacity="0.35" />
        <path d="M154 64 V32 H320" opacity="0.55" />
        <path d="M214 64 V96 H320" opacity="0.4" strokeDasharray="3 5" />
        <rect x="40" y="80" width="46" height="28" rx="2" opacity="0.5" />
        <line x1="48" y1="90" x2="76" y2="90" opacity="0.5" />
        <line x1="48" y1="98" x2="68" y2="98" opacity="0.5" />
      </g>
      {stages.map((x, k) => (
        <g key={x} transform={`translate(${x} 64)`}>
          <circle r={k === 2 ? 9 : 6} fill="currentColor" opacity={k === 2 ? 0.2 : 0.1} />
          <circle
            r="3.2"
            fill={k <= 2 ? 'currentColor' : 'var(--arcade-ground)'}
            stroke="currentColor"
            strokeWidth="1"
          />
        </g>
      ))}
      <circle cx="154" cy="64" r="1.4" fill="var(--arcade-white)" />
    </>
  );
}

/** Familia: dos órbitas que se cruzan; un tramo de una se ha desprendido. */
function Familia() {
  return (
    <>
      <g fill="none" strokeWidth="1">
        <circle cx="160" cy="62" r="56" stroke="currentColor" opacity="0.22" strokeDasharray="2 6" />
        <circle cx="140" cy="62" r="38" stroke="var(--arcade-violet)" opacity="0.75" />
        {/* La segunda órbita, abierta: el tramo que falta está un poco más afuera. */}
        <path d="M180 24 A38 38 0 1 1 142.6 69.7" stroke="currentColor" opacity="0.75" />
        <path d="M142 62 A38 38 0 0 1 174.7 24.4" stroke="currentColor" opacity="0.6" transform="translate(-7 -6)" />
        <line x1="0" y1="62" x2="320" y2="62" stroke="currentColor" opacity="0.14" />
      </g>
      {[
        [160, 29.7],
        [160, 94.3],
      ].map(([x, y]) => (
        <g key={y} transform={`translate(${x} ${y})`}>
          <circle r="7" fill="currentColor" opacity="0.16" />
          <circle r="2.8" fill="currentColor" />
          <circle r="1.2" fill="var(--arcade-white)" />
        </g>
      ))}
      <circle cx="102" cy="62" r="2.4" fill="var(--arcade-violet)" />
      <circle cx="216" cy="62" r="2.4" fill="currentColor" />
    </>
  );
}

/** Curso: cinco etapas que suben en escalera; tres hechas, la meta dentro de su órbita. */
function Curso() {
  const stages = [
    [20, 98],
    [40, 80],
    [60, 62],
    [80, 44],
    [100, 26],
  ];
  const path = stages.map(([x, y], k) => (k === 0 ? `M${x} ${y}` : `H${x} V${y}`)).join(' ');
  return (
    <>
      <g fill="none" stroke="currentColor" strokeWidth="1.4">
        <line x1="8" y1="110" x2="112" y2="110" opacity="0.25" strokeDasharray="1.5 4" />
        <line x1="8" y1="10" x2="8" y2="110" opacity="0.25" strokeDasharray="1.5 4" />
        <path d={path} opacity="0.55" />
        <circle cx="100" cy="26" r="12" opacity="0.35" />
      </g>
      {stages.map(([x, y], k) => (
        <g key={x} transform={`translate(${x} ${y})`}>
          {k === 2 && <circle r="9" fill="currentColor" opacity="0.22" />}
          <circle
            r="4"
            fill={k <= 2 ? 'currentColor' : 'var(--arcade-ground)'}
            stroke="currentColor"
            strokeWidth="1.4"
          />
        </g>
      ))}
      <circle cx="60" cy="62" r="1.6" fill="var(--arcade-white)" />
    </>
  );
}

/** Generador: doce decisiones en una retícula de 4 × 3 que convergen en un solo prompt. */
function Generador() {
  const columns = [16, 34, 52, 70];
  const rows = [34, 60, 86];
  // Decididas: todas menos cuatro, repartidas.
  const open = new Set(['52-34', '70-60', '34-86', '70-86']);
  return (
    <>
      <g fill="none" stroke="currentColor" strokeWidth="1.2">
        {rows.map((y) => (
          <path key={y} d={`M${columns[0]} ${y} H${columns[3]} L94 60`} opacity="0.3" />
        ))}
        <line x1="94" y1="60" x2="104" y2="60" opacity="0.6" />
        <rect x="104" y="48" width="12" height="24" rx="1.5" opacity="0.7" />
      </g>
      {rows.flatMap((y) =>
        columns.map((x) => (
          <circle
            key={`${x}-${y}`}
            cx={x}
            cy={y}
            r="3.4"
            fill={open.has(`${x}-${y}`) ? 'var(--arcade-ground)' : 'currentColor'}
            stroke="currentColor"
            strokeWidth="1.2"
          />
        )),
      )}
      <circle cx="94" cy="60" r="6" fill="currentColor" opacity="0.22" />
      <circle cx="94" cy="60" r="2.2" fill="var(--arcade-white)" />
    </>
  );
}

const ART: Record<LinkArt, { view: string; draw: () => React.ReactElement }> = {
  procesal: { view: '0 0 320 120', draw: Procesal },
  familia: { view: '0 0 320 120', draw: Familia },
  curso: { view: '0 0 120 120', draw: Curso },
  generador: { view: '0 0 120 120', draw: Generador },
};

export function EntryArt({ art }: { art: LinkArt }) {
  const { view, draw: Draw } = ART[art];
  return (
    <svg viewBox={view} preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <Draw />
    </svg>
  );
}

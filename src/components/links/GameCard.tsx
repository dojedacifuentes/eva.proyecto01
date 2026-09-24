import type { LinkAccent, LinkEntry } from '@/content/links';

/*
 * Ilustraciones abstractas, una por campo de color, con la gramática de la
 * marca: ejes, círculos, nodos. Sin balanzas ni mazos. Van en SVG dentro de la
 * tarjeta, sin imagen que descargar.
 */

/** Procesal (azul): un procedimiento como una línea de etapas sobre una retícula; una se bifurca. */
function ProceduralArt() {
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

/** Familia (violeta / magenta): dos órbitas que se cruzan; un tramo de una se ha desprendido. */
function FamilyArt() {
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

const ART: Record<LinkAccent, () => React.ReactElement> = {
  blue: ProceduralArt,
  magenta: FamilyArt,
};

/**
 * Una experiencia de EVA, como pieza y no como botón: la tarjeta entera es el
 * enlace (cómodo con el pulgar) y se abre en la misma pestaña. Jerarquía:
 * categoría, título, descripción, llamada.
 */
export function GameCard({ entry }: { entry: LinkEntry }) {
  const Art = ART[entry.accent];
  return (
    <a className="arcade-card" data-accent={entry.accent} href={entry.href}>
      <div className="arcade-card__art">
        <svg viewBox="0 0 320 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
          <Art />
        </svg>
        <span className="arcade-card__node mono">NODE {entry.node}</span>
        {entry.status && <span className="arcade-card__status mono">{entry.status}</span>}
      </div>
      <div className="arcade-card__body">
        <p className="arcade-card__category mono">{entry.category}</p>
        <h3 className="arcade-card__title">{entry.title}</h3>
        <p className="arcade-card__text">{entry.description}</p>
        <span className="arcade-card__cta">
          {entry.cta}
          <span className="arcade-card__arrow" aria-hidden="true">
            ↗
          </span>
        </span>
      </div>
    </a>
  );
}

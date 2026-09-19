'use client';

import type { BrainZone } from '@/content/neuroscan';

interface NeuralFallbackProps {
  zones: readonly BrainZone[];
  title: string;
  selected: string | null;
  hovered: string | null;
  /**
   * Sin WebGL el mapa plano es la interfaz y recibe el puntero. Mientras el
   * núcleo 3D carga es sólo decorado: las regiones se eligen desde las fichas.
   */
  interactive: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}

/**
 * Mapa cerebral plano: el dibujo que había antes del núcleo 3D. Sigue vivo
 * como pantalla de carga —el cerebro real aparece encima y este se desvanece—
 * y como alternativa completa cuando el navegador no tiene WebGL.
 */
export function NeuralFallback({
  zones,
  title,
  selected,
  hovered,
  interactive,
  onSelect,
  onHover,
}: NeuralFallbackProps) {
  const active = hovered ?? selected;

  return (
    <>
      <svg viewBox="0 0 400 300" role="img" aria-label={title} aria-hidden={!interactive}>
        <defs>
          <radialGradient id="brainGlow" cx="50%" cy="45%">
            <stop offset="0%" stopColor="rgba(128,217,239,0.22)" />
            <stop offset="100%" stopColor="rgba(128,217,239,0)" />
          </radialGradient>
        </defs>
        <ellipse cx="200" cy="150" rx="170" ry="130" fill="url(#brainGlow)" />
        <path
          className="brain__shell"
          d="M62 150c-4-42 30-78 74-84 22-22 70-26 96-6 40-8 82 16 90 52 26 14 30 56 8 78 2 32-30 56-64 50-26 20-70 20-94 2-40 6-76-16-80-46-26-8-36-26-30-46Z"
        />
        <path
          className="brain__fold"
          d="M96 120c34-6 52 14 60 38s30 40 62 34M140 76c6 30-10 48-30 60M244 62c-10 28 4 50 26 60M330 190c-30 4-52-10-62-32M172 242c4-28-8-46-30-56"
        />
        <g className="brain__links">
          {zones.map((from, index) =>
            zones.slice(index + 1).map((to) => (
              <line
                key={`${from.id}-${to.id}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                data-active={active === from.id || active === to.id}
              />
            )),
          )}
        </g>
        <g className="brain__nodes">
          {zones.map((item) => (
            <g key={item.id} data-active={active === item.id}>
              <circle className="brain__halo" cx={item.x} cy={item.y} r="16" />
              <circle className="brain__node" cx={item.x} cy={item.y} r="5" />
              <text className="brain__code" x={item.x + 11} y={item.y + 4}>
                {item.code}
              </text>
            </g>
          ))}
        </g>
      </svg>

      {interactive && (
        /* Los botones van fuera del SVG: foco y teclado sin sorpresas. */
        <div className="brain__hits">
          {zones.map((item) => (
            <button
              key={item.id}
              type="button"
              className="brain__hit"
              style={{
                left: `${(item.x / 400) * 100}%`,
                top: `${(item.y / 300) * 100}%`,
              }}
              aria-pressed={selected === item.id}
              onClick={() => onSelect(item.id)}
              onPointerEnter={() => onHover(item.id)}
              onPointerLeave={() => onHover(null)}
              data-cursor-label={item.code}
            >
              <span className="sr-only">
                {item.code} — {item.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}

import { BRAND_COLORS } from './brand';

/**
 * El fondo de las fichas de la marca, en abstracto: un resplandor azul a la
 * izquierda y otro violeta a la derecha, la órbita con sus ocho nodos y la cruz
 * de ejes. Va como imagen porque `next/og` no pinta degradados radiales ni
 * líneas discontinuas.
 *
 * Lo usan las dos vistas previas para redes: la de la landing (el nombre) y la
 * de `/links` (el símbolo de EVA ARCADE).
 */
export function orbitUri(width: number, height: number, orbit: number) {
  const cx = width / 2;
  const cy = height / 2;
  const nodes = Array.from({ length: 8 }, (_, k) => {
    const angle = (k * Math.PI) / 4;
    const x = cx + Math.cos(angle) * orbit;
    const y = cy + Math.sin(angle) * orbit;
    const color = x < cx - 1 ? BRAND_COLORS.glow[0] : x > cx + 1 ? BRAND_COLORS.glow[2] : BRAND_COLORS.glow[1];
    return `<circle cx="${x}" cy="${y}" r="13" fill="${color}" opacity=".22"/><circle cx="${x}" cy="${y}" r="4.5" fill="${color}"/><circle cx="${x}" cy="${y}" r="2" fill="#f4f6ff"/>`;
  }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <radialGradient id="l" cx="0.08" cy="0.5" r="0.62"><stop stop-color="${BRAND_COLORS.glow[0]}" stop-opacity=".3"/><stop offset="1" stop-color="${BRAND_COLORS.glow[0]}" stop-opacity="0"/></radialGradient>
      <radialGradient id="r" cx="0.92" cy="0.5" r="0.62"><stop stop-color="${BRAND_COLORS.glow[2]}" stop-opacity=".3"/><stop offset="1" stop-color="${BRAND_COLORS.glow[2]}" stop-opacity="0"/></radialGradient>
      <linearGradient id="o" gradientUnits="userSpaceOnUse" x1="${cx - orbit}" x2="${cx + orbit}" y1="0" y2="0"><stop stop-color="${BRAND_COLORS.glow[0]}"/><stop offset=".5" stop-color="${BRAND_COLORS.glow[1]}"/><stop offset="1" stop-color="${BRAND_COLORS.glow[2]}"/></linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="${BRAND_COLORS.ground}"/>
    <rect width="${width}" height="${height}" fill="url(#l)"/>
    <rect width="${width}" height="${height}" fill="url(#r)"/>
    <g stroke="#a9b8ff" stroke-opacity=".18" stroke-width="1.2" stroke-dasharray="2 7">
      <line x1="0" y1="${cy}" x2="${width}" y2="${cy}"/><line x1="${cx}" y1="0" x2="${cx}" y2="${height}"/>
    </g>
    <circle cx="${cx}" cy="${cy}" r="${orbit * 0.72}" fill="none" stroke="#a9b8ff" stroke-opacity=".12" stroke-width="1.2" stroke-dasharray="2 6"/>
    <circle cx="${cx}" cy="${cy}" r="${orbit}" fill="none" stroke="url(#o)" stroke-opacity=".6" stroke-width="2"/>
    ${nodes}
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

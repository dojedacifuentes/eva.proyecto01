import { ImageResponse } from 'next/og';
import { BRAND_COLORS, brandDataUri, viewBoxOf } from '@/lib/brand';
import { site } from '@/content/site';

export const alt = `${site.name} — ${site.expansion}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const W = size.width;
const H = size.height;
/** Radio de la órbita: el nombre cabe dentro, como en las fichas de la marca. */
const ORBIT = 292;
const LOGO_WIDTH = 540;

/**
 * El fondo de las fichas de la marca, en abstracto: un resplandor azul a la
 * izquierda y otro violeta a la derecha, la órbita con sus ocho nodos y la cruz
 * de ejes. Va como imagen porque `next/og` no pinta degradados radiales ni
 * líneas discontinuas.
 */
function orbitUri() {
  const cx = W / 2;
  const cy = H / 2;
  const nodes = Array.from({ length: 8 }, (_, k) => {
    const angle = (k * Math.PI) / 4;
    const x = cx + Math.cos(angle) * ORBIT;
    const y = cy + Math.sin(angle) * ORBIT;
    const color = x < cx - 1 ? BRAND_COLORS.glow[0] : x > cx + 1 ? BRAND_COLORS.glow[2] : BRAND_COLORS.glow[1];
    return `<circle cx="${x}" cy="${y}" r="13" fill="${color}" opacity=".22"/><circle cx="${x}" cy="${y}" r="4.5" fill="${color}"/><circle cx="${x}" cy="${y}" r="2" fill="#f4f6ff"/>`;
  }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <radialGradient id="l" cx="0.08" cy="0.5" r="0.62"><stop stop-color="${BRAND_COLORS.glow[0]}" stop-opacity=".3"/><stop offset="1" stop-color="${BRAND_COLORS.glow[0]}" stop-opacity="0"/></radialGradient>
      <radialGradient id="r" cx="0.92" cy="0.5" r="0.62"><stop stop-color="${BRAND_COLORS.glow[2]}" stop-opacity=".3"/><stop offset="1" stop-color="${BRAND_COLORS.glow[2]}" stop-opacity="0"/></radialGradient>
      <linearGradient id="o" gradientUnits="userSpaceOnUse" x1="${cx - ORBIT}" x2="${cx + ORBIT}" y1="0" y2="0"><stop stop-color="${BRAND_COLORS.glow[0]}"/><stop offset=".5" stop-color="${BRAND_COLORS.glow[1]}"/><stop offset="1" stop-color="${BRAND_COLORS.glow[2]}"/></linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="${BRAND_COLORS.ground}"/>
    <rect width="${W}" height="${H}" fill="url(#l)"/>
    <rect width="${W}" height="${H}" fill="url(#r)"/>
    <g stroke="#a9b8ff" stroke-opacity=".18" stroke-width="1.2" stroke-dasharray="2 7">
      <line x1="0" y1="${cy}" x2="${W}" y2="${cy}"/><line x1="${cx}" y1="0" x2="${cx}" y2="${H}"/>
    </g>
    <circle cx="${cx}" cy="${cy}" r="${ORBIT * 0.72}" fill="none" stroke="#a9b8ff" stroke-opacity=".12" stroke-width="1.2" stroke-dasharray="2 6"/>
    <circle cx="${cx}" cy="${cy}" r="${ORBIT}" fill="none" stroke="url(#o)" stroke-opacity=".6" stroke-width="2"/>
    ${nodes}
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Vista previa al compartir el enlace: el nombre de EVA con la forma de su
 * marca (ƎVΛ) dentro de su órbita y, debajo, lo que significa. Los colores
 * salen de `lib/brand`: `next/og` no lee variables CSS.
 */
export default function OpengraphImage() {
  const box = viewBoxOf('logotype', 1.6);
  const logoHeight = Math.round((LOGO_WIDTH * box.height) / box.width);

  return new ImageResponse(
    (
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: BRAND_COLORS.ground,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- next/og sólo entiende <img> */}
        <img src={orbitUri()} alt="" width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }} />
        {/* eslint-disable-next-line @next/next/no-img-element -- next/og sólo entiende <img> */}
        <img src={brandDataUri('logotype', { pad: 1.6, blur: 0.8 })} alt="" width={LOGO_WIDTH} height={logoHeight} />
        <div
          style={{
            display: 'flex',
            marginTop: 26,
            fontSize: 22,
            letterSpacing: 9,
            color: '#b9c3e8',
          }}
        >
          {site.expansion.toUpperCase()}
        </div>
      </div>
    ),
    size,
  );
}

import { ImageResponse } from 'next/og';
import { hero, site } from '@/content/site';
import { axes } from '@/content/structure';

/** El acento de cada eje, en hexadecimal: `next/og` no resuelve variables CSS. */
const ACCENT: Record<string, string> = {
  cyan: '#3fd8ee',
  magenta: '#f07ab9',
  violet: '#9a8dff',
  yellow: '#d8f05b',
};

export const alt = `${site.name} — ${site.expansion}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Vista previa provisional al compartir el enlace: el acrónimo vertical sobre
 * negro. Se reemplaza por la imagen oficial cuando exista (ver roadmap).
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: 'linear-gradient(135deg, #020407 55%, #10142b)',
          color: '#eef3f6',
        }}
      >
        <div style={{ display: 'flex', fontSize: 24, letterSpacing: 6, color: '#3fd8ee' }}>
          {hero.label}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', borderLeft: '2px solid #3fd8ee', paddingLeft: 36 }}>
          {axes.map((axis) => (
            <div key={axis.letter} style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
              <span
                style={{
                  fontSize: 132,
                  fontWeight: 700,
                  lineHeight: 1,
                  width: 110,
                  color: ACCENT[axis.accent],
                }}
              >
                {axis.letter}
              </span>
              <span style={{ fontSize: 52, color: '#c3ccd2' }}>{axis.word}</span>
              <span style={{ fontSize: 30, letterSpacing: 4, color: ACCENT[axis.accent] }}>
                {axis.code}
              </span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', fontSize: 26, color: '#8e9ba3' }}>{site.expansion}</div>
      </div>
    ),
    size,
  );
}

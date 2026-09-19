import { ImageResponse } from 'next/og';
import { hero, site } from '@/content/site';
import { doors } from '@/content/structure';

/** Un color por letra, de arriba abajo: el degradado del acrónimo de la portada. */
const LETTER = ['#3fd8ee', '#9a8dff', '#f07ab9'];

export const alt = `${site.name} — ${site.expansion}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Vista previa provisional al compartir el enlace: el acrónimo vertical sobre
 * negro y, debajo, las tres puertas. Se reemplaza por la imagen oficial cuando
 * exista (ver roadmap). `next/og` no resuelve variables CSS: colores en hexadecimal.
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
          {hero.acronym.map((item, at) => (
            <div key={item.letter} style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
              <span
                style={{
                  fontSize: 124,
                  fontWeight: 700,
                  lineHeight: 1,
                  width: 110,
                  color: LETTER[at % LETTER.length],
                }}
              >
                {item.letter}
              </span>
              <span style={{ fontSize: 52, color: '#c3ccd2' }}>{item.word}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 40, fontSize: 26, color: '#8e9ba3' }}>
          {doors.map((door) => (
            <div key={door.id} style={{ display: 'flex', gap: 12 }}>
              <span style={{ color: '#3fd8ee', letterSpacing: 3 }}>{door.code}</span>
              <span>{door.name}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}

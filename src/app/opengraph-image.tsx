import { ImageResponse } from 'next/og';
import { hero, identity } from '@/data/eva';

export const alt = `${identity.name} — ${identity.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const TITLE = `${hero.title.before} ${hero.title.symbol} ${hero.title.after}`;
const FOOTER = 'EVA.PROYECTO01';

/** Todos los glifos que aparecen en la imagen, para pedir sólo ese subconjunto. */
const GLYPHS = `${identity.name}${identity.seal}${TITLE}${hero.title.second}${identity.eyebrow}${FOOTER}`;

/**
 * Descarga una fuente de Google en formato TTF.
 *
 * Satori no entiende woff2, que es lo que Google sirve a los navegadores
 * modernos; con un User-Agent antiguo devuelve TTF, que sí entiende. El
 * parámetro `text` recorta el subconjunto a los glifos que se usan, así que la
 * descarga es de unos pocos kilobytes.
 */
async function googleFont(family: string, weight: number, text: string) {
  const query = `family=${family.replace(/ /g, '+')}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await fetch(`https://fonts.googleapis.com/css2?${query}`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 6.1)' },
  }).then((response) => response.text());

  const source = css.match(
    /src: url\((.+?)\) format\('(?:truetype|opentype)'\)/,
  )?.[1];
  if (!source) throw new Error(`Sin TTF para ${family} ${weight}`);

  return fetch(source).then((response) => response.arrayBuffer());
}

/**
 * Imagen de vista previa al compartir el enlace.
 *
 * Es la misma composición del hero — retícula tenue, sello EVA_01 y el signo
 * «+» como única nota de color — porque quien llega desde Instagram tiene que
 * reconocer la página antes de abrirla.
 *
 * Si la descarga de tipografías falla, la imagen se genera igual con la fuente
 * por defecto: una vista previa en otra tipografía es un problema menor; un
 * despliegue roto por una petición de red, no.
 */
export default async function OpengraphImage() {
  let fonts;
  try {
    const [sans, mono] = await Promise.all([
      googleFont('Geist', 500, GLYPHS),
      googleFont('Geist Mono', 400, GLYPHS),
    ]);
    fonts = [
      { name: 'Geist', data: sans, weight: 500 as const, style: 'normal' as const },
      { name: 'Geist Mono', data: mono, weight: 400 as const, style: 'normal' as const },
    ];
  } catch {
    fonts = undefined;
  }

  const ink = '#eaeff3';
  const accent = '#00bfcb';
  const muted = '#919aa0';
  const line = 'rgba(0, 191, 203, 0.07)';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#04080e',
          color: ink,
          padding: '64px 72px',
          fontFamily: 'Geist',
          position: 'relative',
        }}
      >
        {/* Retícula técnica, tan tenue como en la página. */}
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((column) => (
          <div
            key={`v${column}`}
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: column * 120,
              width: 1,
              background: line,
            }}
          />
        ))}
        {[1, 2, 3, 4].map((row) => (
          <div
            key={`h${row}`}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: row * 126,
              height: 1,
              background: line,
            }}
          />
        ))}

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <svg width="34" height="34" viewBox="0 0 20 20">
            <rect
              x="0.75"
              y="0.75"
              width="18.5"
              height="18.5"
              rx="4"
              fill="none"
              stroke={accent}
              strokeWidth="1.5"
            />
            <path d="M8 6.4 14 10 8 13.6Z" fill={accent} />
          </svg>
          <span
            style={{
              marginLeft: 16,
              fontSize: 30,
              letterSpacing: 5,
              fontWeight: 500,
            }}
          >
            {identity.name}
          </span>
          <span
            style={{
              fontSize: 22,
              color: accent,
              fontFamily: 'Geist Mono',
              marginLeft: 2,
            }}
          >
            {identity.seal}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 104, letterSpacing: -3.5 }}>
            <span>{hero.title.before}</span>
            <span style={{ color: accent, margin: '0 24px' }}>
              {hero.title.symbol}
            </span>
            <span>{hero.title.after}</span>
          </div>
          <div style={{ display: 'flex', fontSize: 104, letterSpacing: -3.5 }}>
            {hero.title.second}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontFamily: 'Geist Mono',
            fontSize: 19,
            letterSpacing: 2.2,
            color: muted,
          }}
        >
          <span>{identity.eyebrow}</span>
          <span>{FOOTER}</span>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}

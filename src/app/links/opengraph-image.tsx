import { ImageResponse } from 'next/og';
import { links } from '@/content/links';
import { BRAND_COLORS, brandDataUri, viewBoxOf } from '@/lib/brand';
import { orbitUri } from '@/lib/brand-art';

export const alt = `${links.hero.title} — ${links.hero.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const W = size.width;
const H = size.height;
const ORBIT = 300;
const MARK_HEIGHT = 250;

/**
 * Vista previa de `/links` al compartir el enlace: el símbolo (□X) en la
 * órbita de la marca y, debajo, EVA ARCADE y su lema. El mismo fondo que la
 * de la landing, que lleva el nombre (ƎVΛ).
 */
export default function OpengraphImage() {
  const box = viewBoxOf('isotype', 1.6);
  const markWidth = Math.round((MARK_HEIGHT * box.width) / box.height);

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
        <img src={orbitUri(W, H, ORBIT)} alt="" width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }} />
        {/* eslint-disable-next-line @next/next/no-img-element -- next/og sólo entiende <img> */}
        <img src={brandDataUri('isotype', { pad: 1.6, blur: 0.8 })} alt="" width={markWidth} height={MARK_HEIGHT} />
        <div style={{ display: 'flex', marginTop: 18, fontSize: 58, fontWeight: 600, letterSpacing: 12, color: '#f3f5ff' }}>
          {links.hero.title}
        </div>
        <div style={{ display: 'flex', marginTop: 10, fontSize: 24, letterSpacing: 2, color: '#b9c3e8' }}>
          {links.hero.tagline}
        </div>
      </div>
    ),
    size,
  );
}

import Image from 'next/image';
import type { EvaImage } from '@/content/assets';

interface EvaPortraitFrameProps {
  image: EvaImage;
  caption?: { id: string; state: string };
  priority?: boolean;
  tall?: boolean;
  sizes: string;
}

/**
 * Marco técnico del retrato de EVA. Si la imagen no tiene `src`, muestra una
 * silueta de reserva con las mismas proporciones, sin saltos de layout.
 */
export function EvaPortraitFrame({
  image,
  caption,
  priority = false,
  tall = false,
  sizes,
}: EvaPortraitFrameProps) {
  return (
    <figure className={`portrait${tall ? ' portrait--tall' : ''}`}>
      {(['tl', 'tr', 'bl', 'br'] as const).map((corner) => (
        <span
          key={corner}
          aria-hidden="true"
          className={`portrait__corner portrait__corner--${corner}`}
        />
      ))}
      <div className="portrait__frame">
        {image.src ? (
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes={sizes}
            priority={priority}
            style={{ objectPosition: image.focus }}
          />
        ) : (
          <div className="portrait__fallback mono" role="img" aria-label={image.alt}>
            RETRATO PENDIENTE
          </div>
        )}
        {caption && (
          <figcaption className="portrait__caption mono">
            <span>{caption.id}</span>
            <span>{caption.state}</span>
          </figcaption>
        )}
      </div>
    </figure>
  );
}

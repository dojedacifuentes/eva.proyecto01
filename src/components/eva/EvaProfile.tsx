import { images } from '@/content/assets';
import { hero } from '@/content/site';
import { EvaPortraitFrame } from './EvaPortraitFrame';
import { EvaPortraitLoop } from './EvaPortraitLoop';

/**
 * Tarjeta de EVA en la portada: el retrato con su bucle de vídeo encima y su
 * ficha. Desde la v8 no abre nada —el neuroescáner salió del recorrido—, así
 * que es un componente de servidor: sólo el bucle de vídeo es cliente.
 */
export function EvaProfile() {
  return (
    <div className="profile">
      <EvaPortraitFrame
        image={images.heroPortrait}
        caption={hero.portraitCaption}
        sizes="(min-width: 64rem) 22rem, (min-width: 48rem) 30vw, 42vw"
        priority
        overlay={<EvaPortraitLoop />}
      />
    </div>
  );
}

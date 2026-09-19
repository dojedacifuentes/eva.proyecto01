import { NeuralRoom } from '@/components/eva/neural/NeuralRoom';
import { lab } from '@/content/lab';
import { LabSection } from './LabSection';

/**
 * Sala 01: el cerebro del núcleo neural con todos sus efectos y, a su lado,
 * la ventana que lee sus datos en vivo. Sin título ni texto corrido: la
 * pieza visual es la sección.
 */
export function CoreSection() {
  const copy = lab.core;

  return (
    <LabSection id="nucleo" eyebrow={copy.eyebrow} title={copy.title} lede={copy.lede} compact>
      <NeuralRoom />
    </LabSection>
  );
}

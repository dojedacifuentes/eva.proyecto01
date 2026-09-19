import { AutonomiaSection } from '@/components/sections/AutonomiaSection';
import { GenomaSection } from '@/components/sections/GenomaSection';
import { HeroEva } from '@/components/sections/HeroEva';
import { NucleoSection } from '@/components/sections/NucleoSection';
import { ReservaSection } from '@/components/sections/ReservaSection';
import { VigilanciaSection } from '@/components/sections/VigilanciaSection';

/**
 * El recorrido de EVA, en el orden de `content/structure.ts`: la portada (00)
 * y los tres ejes del acrónimo. Entidad (01) es un contenedor: sus lugares son
 * sus tres subsecciones. Vigilancia (10) y Autonomía (11) son un lugar cada una.
 */
export default function HomePage() {
  return (
    <>
      <HeroEva />
      <div id="entidad" className="axis-group" data-axis="entidad">
        <NucleoSection />
        <GenomaSection />
        <ReservaSection />
      </div>
      <VigilanciaSection />
      <AutonomiaSection />
    </>
  );
}

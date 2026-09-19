import { CuerpoSection } from '@/components/sections/CuerpoSection';
import { GenomaSection } from '@/components/sections/GenomaSection';
import { HeroEva } from '@/components/sections/HeroEva';
import { NucleoSection } from '@/components/sections/NucleoSection';

/**
 * El recorrido de EVA, en el orden de `content/structure.ts`: la portada (00)
 * y la Entidad (01), que es un contenedor: sus lugares son sus tres partes
 * —núcleo cerebral, genoma digital y cuerpo—.
 */
export default function HomePage() {
  return (
    <>
      <HeroEva />
      <div id="entidad" className="axis-group" data-axis="entidad">
        <NucleoSection />
        <GenomaSection />
        <CuerpoSection />
      </div>
    </>
  );
}

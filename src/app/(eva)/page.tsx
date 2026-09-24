import { CerebroSection } from '@/components/sections/CerebroSection';
import { ConscienciaSection } from '@/components/sections/ConscienciaSection';
import { CuerpoSection } from '@/components/sections/CuerpoSection';
import { GenomaSection } from '@/components/sections/GenomaSection';
import { HeroEva } from '@/components/sections/HeroEva';

/**
 * El recorrido de EVA, en el orden de `content/structure.ts`: la portada (000)
 * y cuatro lugares, cada uno un eje —consciencia (001), genoma (010), cerebro
 * (011) y cuerpo (100)—. Empieza por dentro: lo primero que se ve es EVA
 * mirándose organizarse, no el inventario de sus piezas; termina por fuera.
 *
 * El Cuerpo salió entero en la v9 (dos biolecturas y el interior 3D) y volvió
 * en la v9.2 reducido a una pantalla: el vídeo de perfil con su biolectura. La
 * cápsula y el interior siguen en el repositorio, sin montar.
 */
export default function HomePage() {
  return (
    <>
      <HeroEva />
      <ConscienciaSection />
      <GenomaSection />
      <CerebroSection />
      <CuerpoSection />
    </>
  );
}

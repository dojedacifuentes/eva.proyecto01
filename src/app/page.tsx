import { CerebroSection } from '@/components/sections/CerebroSection';
import { ConscienciaSection } from '@/components/sections/ConscienciaSection';
import { GenomaSection } from '@/components/sections/GenomaSection';
import { HeroEva } from '@/components/sections/HeroEva';

/**
 * El recorrido de EVA, en el orden de `content/structure.ts`: la portada (00)
 * y tres preguntas, cada una un lugar y un eje —consciencia (01), genoma (10)
 * y cerebro (11)—. Empieza por dentro: lo primero que se ve es EVA mirándose
 * organizarse, no el inventario de sus piezas.
 *
 * El Cuerpo de la v8 (01.11: las dos biolecturas y el interior) salió del
 * recorrido en la v9 para que la página sostenga una sola idea y pese menos.
 * Sus componentes y sus textos siguen en el repositorio, sin montar.
 */
export default function HomePage() {
  return (
    <>
      <HeroEva />
      <ConscienciaSection />
      <GenomaSection />
      <CerebroSection />
    </>
  );
}

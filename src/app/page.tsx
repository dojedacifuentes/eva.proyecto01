import { BrainSection } from '@/components/sections/BrainSection';
import { CausesSection } from '@/components/sections/CausesSection';
import { CoreSection } from '@/components/sections/CoreSection';
import { HeroEva } from '@/components/sections/HeroEva';
import { LogSection } from '@/components/sections/LogSection';
import { NetworksSection } from '@/components/sections/NetworksSection';

/**
 * El laboratorio de EVA: la portada y, detrás, las cinco salas en las que
 * ella se cuenta. El orden es el de `content/lab.ts` (`rooms`).
 */
export default function HomePage() {
  return (
    <>
      <HeroEva />
      <CoreSection />
      <BrainSection />
      <NetworksSection />
      <CausesSection />
      <LogSection />
    </>
  );
}

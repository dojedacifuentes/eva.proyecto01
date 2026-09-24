import '@/app/interface.css';
import '@/app/cerebro.css';
import '@/app/dna.css';
import '@/app/ejes.css';
import '@/app/consciencia.css';
import '@/app/cuerpo.css';
import '@/app/relato.css';
import '@/app/marca.css';
import { EvaField } from '@/components/eva/EvaField';
import { EvaSynapse } from '@/components/eva/EvaSynapse';
import { ScrollReveal } from '@/components/eva/ScrollReveal';
import { EvaSignalCursor } from '@/components/eva/EvaSignalCursor';
import { BitRail } from '@/components/layout/BitRail';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { flags, nav } from '@/content/site';

/**
 * Todo lo que rodea a la landing: el campo de fondo, el cursor de señal, la
 * cabecera, el carril de bits, el pie, el canal SINAPSIS y sus hojas de estilo.
 * Hasta la v9.4 vivía en el layout raíz y lo cargaba cualquier ruta; desde que
 * existe `/links` (que no lleva nada de esto) lo montan sólo la landing
 * (`app/(eva)/layout.tsx`) y la página 404, que se ven exactamente como antes.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#contenido" className="skip-link sr-only-focusable mono">
        {nav.skip}
      </a>

      {/* Capas decorativas: detrás del contenido y sin capturar eventos. */}
      <EvaField particles={flags.reactiveField} />
      {flags.signalCursor && <EvaSignalCursor />}

      <SiteHeader />
      <BitRail />
      <main id="contenido">{children}</main>
      <SiteFooter />
      {/* El canal de EVA acompaña toda la página, cerrado hasta que el visitante lo abre. */}
      <EvaSynapse />
      <ScrollReveal />
    </>
  );
}

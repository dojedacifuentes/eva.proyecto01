import type { Metadata } from 'next';
import Link from 'next/link';
import { PanelSectionBlock } from '@/components/panel/PanelSectionBlock';
import { STATE_LABEL } from '@/components/panel/StateTag';
import { ITEM_STATES, readPanel, tally } from '@/lib/panel';

export const metadata: Metadata = {
  title: 'Panel del caso',
  description:
    'Estado del proyecto EVA con la fuente de cada dato y lo que queda pendiente de verificación.',
  // Estado interno de trabajo: existe, pero no se indexa.
  robots: { index: false, follow: false },
};

/**
 * Panel de administración del caso.
 *
 * Aplica a EVA el método que EVA publicó — Post 05, «Expediente vivo» cap. 01:
 * muestra estado y no relato, los plazos van primero, cada dato lleva su fuente
 * y lo que no consta se marca en lugar de rellenarse.
 *
 * Todo el contenido sale de `caso/PANEL.md`. Esta página no sabe nada del caso:
 * es la vitrina, no la mesa de trabajo.
 */
export default async function PanelPage() {
  const panel = await readPanel();
  const counts = tally(panel);
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);

  return (
    <>
      <section className="eva-container pt-16 pb-12 md:pt-24 md:pb-16">
        <p className="eva-mono text-muted">
          <span aria-hidden="true" className="pr-2.5 text-accent">
            —
          </span>
          Panel del caso
        </p>

        <h1 className="mt-8 max-w-[24ch] text-[clamp(2.25rem,6vw,4.5rem)] leading-[0.98] font-medium tracking-[-0.03em] text-balance">
          {panel.title}
        </h1>

        {panel.lead ? (
          <p className="mt-8 max-w-[62ch] text-lg leading-relaxed text-pretty text-muted md:text-xl">
            {panel.lead}
          </p>
        ) : null}

        {/* Recuento por estado: la primera lectura del panel en cuatro cifras. */}
        <dl className="mt-14 grid grid-cols-2 border-t border-border md:mt-20 md:grid-cols-4">
          {ITEM_STATES.map((state) => (
            <div
              key={state}
              className="border-b border-border py-6 md:pr-6 md:[&:not(:last-child)]:border-r"
            >
              <dd
                data-numeric
                className="text-4xl tracking-[-0.03em] md:text-5xl"
              >
                {counts[state]}
              </dd>
              <dt className="eva-mono mt-3 text-muted">{STATE_LABEL[state]}</dt>
            </div>
          ))}
        </dl>

        {/*
          * La etiqueta del chip va abreviada para caber en su columna, así que
          * la frase completa —la del método— se dice aquí una vez.
          */}
        <p className="mt-6 max-w-[68ch] text-[0.9375rem] leading-relaxed text-pretty text-muted">
          <span className="text-foreground">Por verificar</span> significa
          pendiente de verificación: no consta en ningún archivo del proyecto y
          no se ha completado a ojo.{' '}
          <span className="text-foreground">Falta</span> es lo contrario —
          consta que no está.
        </p>

        <dl className="mt-12 grid gap-x-10 gap-y-4 sm:grid-cols-2">
          {panel.meta.map((entry) => (
            <div key={entry.label} className="flex flex-col gap-1.5">
              <dt className="eva-mono text-accent-ink">{entry.label}</dt>
              <dd className="text-[0.9375rem] leading-relaxed text-pretty text-muted">
                {entry.value}
              </dd>
            </div>
          ))}
          <div className="flex flex-col gap-1.5">
            <dt className="eva-mono text-accent-ink">Ítems</dt>
            <dd className="text-[0.9375rem] leading-relaxed text-muted">
              {total} en {panel.sections.length} secciones · fuente:{' '}
              <code className="font-mono">caso/PANEL.md</code>
            </dd>
          </div>
        </dl>
      </section>

      {panel.sections.map((section) => (
        <PanelSectionBlock key={section.number} section={section} />
      ))}

      <section className="eva-section bg-surface">
        <div className="eva-container">
          <p className="max-w-[52ch] text-lg leading-relaxed text-pretty md:text-xl">
            El Panel es la mesa de trabajo y esta página es la vitrina. Se genera
            desde <code className="font-mono">caso/PANEL.md</code>, nunca al
            revés.
          </p>
          <p className="mt-6 max-w-[52ch] text-[0.9375rem] leading-relaxed text-pretty text-muted">
            No reemplaza el criterio ni la revisión. Es un índice con
            trazabilidad: dice dónde mirar y qué todavía no está verificado.
          </p>
          <Link
            href="/"
            className="eva-link mt-10 inline-block py-1 text-[0.9375rem]"
          >
            <span aria-hidden="true">←</span> Volver a EVA
          </Link>
        </div>
      </section>
    </>
  );
}

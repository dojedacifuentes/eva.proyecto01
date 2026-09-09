import { SectionIntro } from '@/components/ui/SectionIntro';
import { closing, links, sections } from '@/data/eva';

const s = sections.legalTeams;

/**
 * Línea de asesoría. Tono sobrio: describe lo que EVA hace con equipos legales
 * y ofrece una conversación, nada más.
 *
 * Mientras no exista un canal de contacto propio, el CTA lleva al cierre, donde
 * está el enlace público de EVA.
 */
export function LegalTeamsSection() {
  const href = links.contact ?? `#${closing.id}`;

  return (
    <SectionIntro
      id={s.id}
      number={s.number}
      eyebrow={s.eyebrow}
      title={s.title}
      text={s.text}
    >
      <div className="mt-10 border-t border-border pt-6">
        <a href={href} className="eva-link py-1 text-[0.9375rem]">
          {s.cta} <span aria-hidden="true">→</span>
        </a>
      </div>
    </SectionIntro>
  );
}

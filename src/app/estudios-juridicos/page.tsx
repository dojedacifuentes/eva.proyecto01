import type { Metadata } from 'next';
import { ChapterHeader } from '@/components/ui/ChapterHeader';
import { chapterBySlug, legalTeamsCta, links } from '@/data/eva';

const chapter = chapterBySlug['estudios-juridicos'];

export const metadata: Metadata = {
  title: chapter.title,
  description: chapter.text,
};

/**
 * Línea de asesoría. Tono sobrio: describe lo que EVA hace con equipos legales
 * y ofrece una conversación, nada más.
 *
 * Mientras no exista canal de contacto propio, el CTA lleva a Instagram, que es
 * el único sitio donde hoy se puede escribir a EVA.
 */
export default function Page() {
  const href = links.contact ?? links.instagram;
  const external = links.contact === null;

  return (
    <ChapterHeader chapter={chapter}>
      <div className="mt-12 border-t border-border pt-6">
        <a
          href={href}
          target={external ? '_blank' : undefined}
          rel={external ? 'noreferrer noopener' : undefined}
          className="eva-link py-1 text-[0.9375rem]"
        >
          {legalTeamsCta} <span aria-hidden="true">{external ? '↗' : '→'}</span>
        </a>
      </div>
    </ChapterHeader>
  );
}

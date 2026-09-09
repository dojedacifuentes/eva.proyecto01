import { closing, links } from '@/data/eva';

/** Cierre. Una frase, una línea y un enlace. */
export function ClosingSection() {
  return (
    <section id={closing.id} className="eva-section bg-surface">
      <div className="eva-container eva-reveal">
        <h2 className="max-w-[16ch] text-[clamp(1.875rem,5vw,3.5rem)] leading-[1.06] font-medium tracking-[-0.02em] text-balance">
          {closing.title}
        </h2>

        <div className="mt-10 max-w-[58ch] md:mt-14 md:ml-[33.333%]">
          <p className="text-lg leading-relaxed text-muted md:text-xl">
            {closing.text}
          </p>
          <a
            href={links.instagram}
            target="_blank"
            rel="noreferrer noopener"
            className="eva-link mt-8 inline-block py-1 text-[0.9375rem]"
          >
            {closing.link} <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}

import { about } from '@/data/eva';

/**
 * Quién es EVA. Las cuatro líneas de trabajo se presentan como una composición
 * tipográfica numerada — sin cards, sin iconos.
 */
export function AboutEva() {
  return (
    <section id="eva" className="eva-section">
      <div className="eva-container">
        <div className="eva-grid eva-reveal">
          <div>
            <p className="eva-mono flex items-center gap-3">
              <span className="text-accent-ink">{about.number}</span>
              <span aria-hidden="true" className="h-px w-6 bg-border" />
              <span className="text-muted">{about.eyebrow}</span>
            </p>
            <h2 className="mt-6 text-3xl font-semibold tracking-[0.14em] md:text-4xl">
              {about.title}
            </h2>
          </div>

          <div className="max-w-[62ch]">
            {about.paragraphs.map((paragraph) => (
              <p
                key={paragraph}
                className="text-lg leading-relaxed text-pretty text-muted [&:not(:first-child)]:mt-6 md:text-xl"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <ul className="eva-reveal mt-16 grid grid-cols-1 border-t border-border md:mt-24 lg:grid-cols-4">
          {about.lines.map((line) => (
            <li
              key={line.index}
              className="border-b border-border py-6 lg:py-8 lg:pr-6 lg:[&:not(:last-child)]:border-r"
            >
              <p className="eva-mono text-accent-ink">{line.index}</p>
              <p className="mt-4 text-xl tracking-[-0.01em] md:text-2xl">
                {line.label}
              </p>
              <p className="eva-mono mt-2 text-muted">{line.note}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

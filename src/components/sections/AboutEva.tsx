import { about } from '@/data/eva';

/**
 * Quién es EVA. Las cuatro líneas de trabajo se presentan como una composición
 * tipográfica numerada — sin cards, sin iconos.
 */
export function AboutEva() {
  return (
    <section id="eva" className="eva-section">
      <div className="eva-container">
        <div className="eva-grid">
          <h2 className="text-3xl font-semibold tracking-[0.14em] md:text-4xl">
            {about.title}
          </h2>

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

        <ul className="mt-16 grid grid-cols-1 border-t border-border lg:grid-cols-4 md:mt-24">
          {about.lines.map((line) => (
            <li
              key={line.index}
              className="border-b border-border py-6 lg:py-8 lg:pr-6 lg:[&:not(:last-child)]:border-r"
            >
              <p className="eva-mono text-accent-ink">{line.index}</p>
              <p className="mt-4 text-xl tracking-tight md:text-2xl">
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

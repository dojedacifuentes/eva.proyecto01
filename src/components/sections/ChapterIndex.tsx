import { chapterIndex } from '@/data/eva';

/**
 * Índice de capítulos. Al no haber navegación en el header, esta fila numerada
 * es el único recorrido de la página: cada entrada apunta a una sección real.
 *
 * En escritorio es una sola línea con filetes verticales; en móvil se pliega a
 * dos columnas sin perder la numeración.
 */
export function ChapterIndex() {
  return (
    <nav aria-label="Índice" className="border-t border-border">
      <ul className="grid grid-cols-2 md:grid-cols-5">
        {chapterIndex.map((chapter) => (
          /*
           * En móvil, cinco entradas en dos columnas dejan una huérfana: la
           * última ocupa la fila entera. El rango tiene que ser `max-md`,
           * porque `[&:last-child]` pesa más que `md:col-span-1` y en
           * escritorio partiría la fila de cinco.
           */
          <li
            key={chapter.href}
            className="border-b border-border max-md:[&:last-child]:col-span-2 md:border-b-0 md:[&:not(:last-child)]:border-r"
          >
            <a
              href={chapter.href}
              className="group flex items-baseline gap-2.5 py-4 md:py-5"
            >
              <span className="eva-mono text-accent-ink">{chapter.number}</span>
              <span className="eva-mono text-muted transition-colors group-hover:text-foreground">
                {chapter.label}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

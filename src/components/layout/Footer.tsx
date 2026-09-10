import { identity } from '@/data/eva';

/**
 * Pie mínimo.
 *
 * La marca, la ciudad y el enlace a Instagram viven en el lateral, así que aquí
 * sólo queda lo que cierra la página. Repetirlo sería ruido.
 */
export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="eva-container flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-8">
        <p className="eva-mono text-muted">{identity.tagline}</p>
        <p className="eva-mono text-muted">
          {identity.year}
          <span aria-hidden="true" className="px-2 text-border-strong">
            /
          </span>
          {identity.city}
        </p>
      </div>
    </footer>
  );
}

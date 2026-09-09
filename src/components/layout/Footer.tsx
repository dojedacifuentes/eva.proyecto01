import { EvaMark } from '@/components/ui/EvaMark';
import { identity } from '@/data/eva';

/** Footer mínimo. Sin sitemap: la navegación ya está arriba. */
export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="eva-container flex flex-col gap-5 py-12 sm:flex-row sm:items-end sm:justify-between md:py-16">
        <div>
          <div className="flex items-center gap-2.5">
            <EvaMark className="size-4" />
            <span className="text-[0.9375rem] font-semibold tracking-[0.14em]">
              {identity.name}
              <span className="eva-seal font-mono text-xs tracking-normal">
                {identity.seal}
              </span>
            </span>
          </div>
          <p className="eva-mono mt-3 text-muted">{identity.tagline}</p>
        </div>

        <p className="eva-mono text-muted sm:text-right">
          {identity.year}
          <span aria-hidden="true" className="px-2 text-border">
            /
          </span>
          {identity.city}
        </p>
      </div>
    </footer>
  );
}

import type { ReactNode } from 'react';
import { ui } from '@/content/site';

interface ExternalLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
}

/** Enlace a otro sitio: pestaña nueva, rel seguro y aviso para lectores de pantalla. */
export function ExternalLink({ href, className, children }: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      data-cursor="external"
    >
      {children}
      <span aria-hidden="true" className="ext-mark">
        ↗
      </span>
      <span className="sr-only"> ({ui.external})</span>
    </a>
  );
}

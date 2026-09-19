'use client';

import { useEffect, useRef, useState } from 'react';
import { nav } from '@/content/site';
import type { Module } from '@/lib/types';

type NavModule = Pick<Module, 'id' | 'code' | 'name' | 'href' | 'accent'>;

/** Menú móvil: botón con aria-expanded, cierre con Escape y al elegir destino. */
export function MobileNavigation({ modules }: { modules: NavModule[] }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="chip-btn menu-btn"
        aria-expanded={open}
        aria-controls="menu-movil"
        aria-label={open ? nav.menuClose : nav.menuOpen}
        onClick={() => setOpen((value) => !value)}
      >
        <span aria-hidden="true" className="menu-btn__icon" />
      </button>

      <nav id="menu-movil" className="mobile-menu" aria-label="Menú principal" hidden={!open}>
        {modules.map((module) => (
          <a
            key={module.id}
            href={module.href}
            data-accent={module.accent}
            data-sound="open"
            onClick={() => setOpen(false)}
          >
            <span className="mono">{module.code}</span>
            {module.name}
          </a>
        ))}
        <a href={nav.contact.href} onClick={() => setOpen(false)}>
          <span className="mono">→</span>
          {nav.contact.label}
        </a>
      </nav>
    </>
  );
}

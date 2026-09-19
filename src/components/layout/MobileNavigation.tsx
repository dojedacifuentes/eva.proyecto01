'use client';

import { useEffect, useRef, useState } from 'react';
import { nav } from '@/content/site';
import type { Module } from '@/lib/types';

type NavModule = Pick<Module, 'id' | 'code' | 'name' | 'href' | 'accent'>;

/** Menú móvil: botón con aria-expanded, cierre con Escape y al elegir destino. */
export function MobileNavigation({ modules }: { modules: NavModule[] }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const destinationRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const button = buttonRef.current;
    const desktop = window.matchMedia('(min-width: 64rem)');
    const previousOverflow = document.body.style.overflow;
    const covered = Array.from(document.querySelectorAll<HTMLElement>(
      'main, footer, .header .wordmark, .header .status, .header .nav, .header__contact, .header [data-sound-toggle]',
    )).map((element) => ({ element, inert: element.inert }));
    for (const { element } of covered) element.inert = true;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
      }
      if (event.key === 'Tab') {
        const controls = [button, ...Array.from(menuRef.current?.querySelectorAll('a') ?? [])]
          .filter((element): element is HTMLButtonElement | HTMLAnchorElement => element !== null);
        const current = controls.indexOf(document.activeElement as HTMLButtonElement | HTMLAnchorElement);
        const next = (current + (event.shiftKey ? -1 : 1) + controls.length) % controls.length;
        event.preventDefault();
        controls[next]?.focus();
      }
    };
    const onDesktop = () => {
      if (desktop.matches) setOpen(false);
    };
    document.body.style.overflow = 'hidden';
    menuRef.current?.querySelector('a')?.focus();
    window.addEventListener('keydown', onKey);
    desktop.addEventListener('change', onDesktop);
    return () => {
      document.body.style.overflow = previousOverflow;
      for (const { element, inert } of covered) element.inert = inert;
      window.removeEventListener('keydown', onKey);
      desktop.removeEventListener('change', onDesktop);
      const destination = destinationRef.current;
      destinationRef.current = null;
      const target = destination ? document.getElementById(destination.slice(1)) : null;
      if (target) {
        target.tabIndex = -1;
        target.focus({ preventScroll: true });
      } else if (desktop.matches) {
        document.querySelector<HTMLElement>('.header .wordmark')?.focus({ preventScroll: true });
      } else {
        button?.focus({ preventScroll: true });
      }
    };
  }, [open]);

  const selectDestination = (href: string) => {
    destinationRef.current = href;
    setOpen(false);
  };

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

      <nav ref={menuRef} id="menu-movil" className="mobile-menu" aria-label="Menú principal" hidden={!open}>
        {modules.map((module) => (
          <a
            key={module.id}
            href={module.href}
            data-accent={module.accent}
            data-sound="open"
            onClick={() => selectDestination(module.href)}
          >
            <span className="mono">{module.code}</span>
            {module.name}
          </a>
        ))}
        <a
          href={nav.contact.href}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="external"
          onClick={() => setOpen(false)}
        >
          <span className="mono">↗</span>
          {nav.contact.label}
        </a>
      </nav>
    </>
  );
}

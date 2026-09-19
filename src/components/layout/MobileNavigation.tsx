'use client';

import { useEffect, useRef, useState } from 'react';
import { nav } from '@/content/site';
import { requestChannelClose } from '@/lib/channel-store';
import type { NavItem } from '@/lib/types';

/** Menú móvil: botón con aria-expanded, cierre con Escape y al elegir destino. */
export function MobileNavigation({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const destinationRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open) return;
    // El menú tapa la página entera: el canal de EVA se pliega antes de quedar inerte.
    requestChannelClose();
    const button = buttonRef.current;
    const desktop = window.matchMedia('(min-width: 64rem)');
    const previousOverflow = document.body.style.overflow;
    const covered = Array.from(document.querySelectorAll<HTMLElement>(
      'main, footer, .synapse, .rail, .header .wordmark, .header .status, .header .nav, .header__contact, .header [data-sound-toggle]',
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

      <nav ref={menuRef} id="menu-movil" className="mobile-menu" aria-label={nav.menuLabel} hidden={!open}>
        {items.map((item) => (
          <div key={item.id} className="mobile-menu__axis" data-accent={item.accent}>
            <a
              href={item.href}
              data-nav-target={item.id}
              data-state={item.state}
              data-sound="open"
              aria-label={`${item.name}, ${item.ordinal}${
                item.state === 'active' ? '' : `, ${item.stateLabel?.toLowerCase()}`
              }`}
              onClick={() => selectDestination(item.href)}
            >
              <span aria-hidden="true" className="mono" data-bin="">
                {item.code}
              </span>
              <span aria-hidden="true">{item.name}</span>
              {item.state !== 'active' && (
                <span aria-hidden="true" className="mobile-menu__state mono">
                  {item.stateLabel}
                </span>
              )}
            </a>
            {item.children.map((child) => (
              <a
                key={child.id}
                className="mobile-menu__sub"
                href={child.href}
                data-nav-target={child.id}
                data-state={child.state}
                data-sound="open"
                aria-label={`${child.name}, ${child.ordinal}`}
                onClick={() => selectDestination(child.href)}
              >
                <span aria-hidden="true" className="mono" data-bin="">
                  {child.code}
                </span>
                <span aria-hidden="true">{child.name}</span>
              </a>
            ))}
          </div>
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

'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { images } from '@/content/assets';
import { modules } from '@/content/modules';
import { flags, site } from '@/content/site';

/** Guía de navegación local; no simula una conversación ni requiere un servicio de IA. */
export function EvaAssistant() {
  const dialog = useRef<HTMLDialogElement>(null);
  const go = (href: string) => {
    dialog.current?.close();
    const target = document.getElementById(href.slice(1));
    if (target) {
      target.tabIndex = -1;
      target.focus({ preventScroll: true });
    }
  };
  return (
    <div className="eva-assistant">
      <button className="eva-assistant__trigger" aria-label="Abrir asistente EVA" aria-haspopup="dialog" aria-controls="eva-assistant-dialog" onClick={() => dialog.current?.showModal()}>
        <Image src={images.heroPortrait.src} alt="" width={44} height={44} />
        <span><strong>EVA</strong><span>Tu guía del proyecto</span></span>
        <span className="eva-assistant__spark" aria-hidden="true">✦</span>
      </button>
      <dialog ref={dialog} id="eva-assistant-dialog" className="eva-assistant__dialog" aria-labelledby="eva-assistant-title">
        <div className="eva-assistant__heading"><span className="mono">EVA / Guía del proyecto</span><button autoFocus onClick={() => dialog.current?.close()} aria-label="Cerrar asistente EVA">×</button></div>
        <h2 id="eva-assistant-title">¿Por dónde empezamos?</h2>
        <p>Te ayudo a encontrar tu próximo curso, lectura, juego o herramienta.</p>
        <nav aria-label="Destinos de la asistente EVA">
          {modules.filter((item) => item.id !== 'news' || flags.news).map((item) => <a href={item.href} onClick={() => go(item.href)} key={item.id}><span className="mono">{item.code}</span><span><strong>{item.name}</strong><small>{item.tagline}</small></span><span aria-hidden="true">↗</span></a>)}
        </nav>
        <a className="eva-assistant__contact" href={site.contact.href} target="_blank" rel="noopener noreferrer">Conversar por Instagram <span aria-hidden="true">↗</span></a>
      </dialog>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { heroLoop } from "@/content/assets";

/**
 * Bucle de vídeo de EVA sobre su retrato.
 *
 * Se descarga tarde y sólo cuando toca: sin movimiento reducido y con el marco
 * a la vista. Hasta entonces lo que se ve es la imagen, que hace de póster.
 * Desde la v8.1 también en móvil: el archivo pesa 0,56 MB, recomprimido. Mudo,
 * en bucle y sin controles: es un retrato que respira, no un reproductor.
 */
export function EvaPortraitLoop() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const [allowed, setAllowed] = useState(false);
  const [ready, setReady] = useState(false);

  /* ¿Toca cargarlo? Preferencia de movimiento y estar en pantalla. */
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let onScreen = false;

    const decide = () => {
      setAllowed(onScreen && !motion.matches);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        decide();
      },
      { rootMargin: "200px" },
    );
    observer.observe(host);
    motion.addEventListener("change", decide);

    return () => {
      observer.disconnect();
      motion.removeEventListener("change", decide);
    };
  }, []);

  return (
    // Fuera de pantalla el vídeo se desmonta entero: ni descarga ni decodifica.
    <div
      ref={hostRef}
      className="loop"
      data-ready={(allowed && ready) || undefined}
      aria-hidden="true"
    >
      {allowed && (
        /*
         * El arranque va en `canplay`, no en un efecto: pedir `play()` antes de
         * que haya datos deja la promesa colgando y el vídeo quieto en el
         * primer fotograma. El elemento sólo se monta cuando toca, así que
         * `preload="auto"` no descarga nada de más.
         */
        <video
          ref={videoRef}
          className="loop__video"
          src={heroLoop.src}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onLoadStart={() => setReady(false)}
          onCanPlay={(event) =>
            void event.currentTarget.play().catch(() => undefined)
          }
          onPlaying={() => setReady(true)}
        />
      )}
    </div>
  );
}

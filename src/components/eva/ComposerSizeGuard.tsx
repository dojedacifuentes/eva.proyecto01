'use client';

import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { Vector2 } from 'three';

/** Reutilizado entre lecturas: `getSize` escribe en el vector que recibe. */
const measured = new Vector2();

/**
 * Devuelve el renderer a la medida real de su lienzo después de que un
 * `EffectComposer` lo haya redimensionado con el tamaño de otra escena.
 *
 * `@react-three/postprocessing` (3.1.1) mide el lienzo en un `Vector2` que
 * comparten todos los composers de la página y lo lee más tarde, en un
 * `useEffect`. Entre medias, el `useFrame` de cualquier otra escena activa
 * vuelve a escribir en ese mismo vector: cuando el genoma monta (una pantalla
 * antes de verse, con la sala del cerebro aún animando) su composer arranca
 * con 688×612, el lienzo del cerebro, y la hélice sale recortada hasta el
 * siguiente `resize` de la ventana. La medida buena sigue en `state.size`,
 * que sólo escribe el observador de tamaño de R3F: si el renderer no coincide
 * con ella, se corrige. Va justo después del composer, en el mismo `<Canvas>`,
 * para que su efecto se ejecute detrás del suyo en cada commit.
 */
export function ComposerSizeGuard() {
  const gl = useThree((state) => state.gl);
  const size = useThree((state) => state.size);

  useEffect(() => {
    gl.getSize(measured);
    if (measured.width !== size.width || measured.height !== size.height) {
      gl.setSize(size.width, size.height);
    }
  });

  return null;
}

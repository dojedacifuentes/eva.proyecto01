import { useCallback, useSyncExternalStore } from 'react';

/**
 * Una consulta de medios como valor de React, para componentes que sí se
 * renderizan en el servidor. Igual que `useReducedMotion`: nada de `window` en
 * un inicializador de estado, que pasa el dev server y revienta el build. En
 * el servidor la consulta no se cumple; el valor real llega al hidratar.
 */
export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const media = window.matchMedia(query);
      media.addEventListener('change', onChange);
      return () => media.removeEventListener('change', onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

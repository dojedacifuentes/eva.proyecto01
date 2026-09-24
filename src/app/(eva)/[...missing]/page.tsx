import { notFound } from 'next/navigation';

/**
 * Cualquier ruta que no existe cae aquí y muestra la 404 de la landing
 * (`(eva)/not-found.tsx`), con su cabecera y su pie. Así la 404 vive dentro del
 * grupo `(eva)` y no en la raíz: una 404 en la raíz se empaqueta con todas las
 * rutas, y `/links` cargaba el campo, el canal y las hojas de la landing sin
 * usarlos.
 */
export default function Missing() {
  notFound();
}

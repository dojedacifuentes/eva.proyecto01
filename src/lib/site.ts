/**
 * URL pública del sitio, resuelta en tiempo de compilación.
 *
 * De aquí salen `metadataBase`, el sitemap y el robots.txt, de modo que las
 * rutas absolutas nunca se escriben a mano en dos sitios distintos.
 *
 * El orden es deliberado:
 *
 * 1. `NEXT_PUBLIC_SITE_URL` — el dominio propio, cuando exista. Definirlo en
 *    Vercel es lo único que hay que hacer el día que EVA tenga dominio.
 * 2. `VERCEL_PROJECT_PRODUCTION_URL` — la que Vercel inyecta sola, así que el
 *    despliegue es correcto desde el primer intento sin configurar nada.
 * 3. localhost, para desarrollo.
 */
const fromEnv =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined);

export const siteUrl = (fromEnv ?? 'http://localhost:3000').replace(/\/+$/, '');

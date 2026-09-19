/**
 * URL pública del sitio, resuelta en tiempo de compilación:
 * dominio propio → URL de producción de Vercel → localhost.
 */
const fromEnv =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined);

export const siteUrl = (fromEnv ?? 'http://localhost:3000').replace(/\/+$/, '');

import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';

/** Todo abierto: no hay nada privado que ocultar en una landing. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}

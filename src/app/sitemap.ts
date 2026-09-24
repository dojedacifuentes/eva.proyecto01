import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';

/** La landing y la puerta de las redes (`/links`); las rutas interiores se añaden aquí cuando existan. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: `${siteUrl}/links`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  ];
}

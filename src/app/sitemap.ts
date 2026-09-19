import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';

/** Una sola página por ahora; las rutas interiores se añaden aquí cuando existan. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: siteUrl, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 }];
}

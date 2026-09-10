import type { MetadataRoute } from 'next';
import { chapters } from '@/data/eva';
import { siteUrl } from '@/lib/site';

/**
 * Portada más un capítulo por ruta. Sale de `chapters`, de modo que abrir una
 * sección nueva la añade aquí sin tocar este archivo.
 *
 * /panel queda fuera a propósito: es estado interno y va con noindex.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: siteUrl, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    ...chapters.map((chapter) => ({
      url: `${siteUrl}${chapter.href}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}

import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';

/**
 * Una sola entrada, porque hoy sólo hay una página: los capítulos viven en
 * anclas y un sitemap no indexa anclas.
 *
 * Cuando alguna sección abra ruta propia (/cursos, /prototipos, /informes…),
 * se añade aquí junto con su `lastModified`.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}

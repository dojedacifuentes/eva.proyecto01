import type { NewsItem } from '@/lib/types';

/**
 * Entradas de EVA News.
 *
 * Mientras `demo` sea verdadero la entrada se rotula como demostración y no
 * muestra enlace de fuente. Una noticia real exige `source`, `sourceUrl` y
 * `demo: false`. El mismo formato sirve para Markdown, JSON, CMS o API.
 */
export const news: NewsItem[] = [
  {
    id: 'demo-regulacion',
    title: 'Un regulador publica una guía sobre IA generativa en servicios profesionales',
    summary:
      'Ejemplo de formato: la entrada resume el hecho en dos líneas, sin adjetivos y con la fecha del documento original.',
    date: '2026-09-18',
    source: 'Contenido demostrativo',
    category: 'Gobernanza',
    tags: ['Gobernanza', 'IA y Derecho'],
    whyItMatters:
      'Aquí se explica la consecuencia práctica: quién debe cambiar qué, y desde cuándo.',
    evaComment:
      'Regular la IA con un PDF de 140 páginas. Un formato venerable; lo leeré en 0,3 segundos, por respeto.',
    status: 'featured',
    demo: true,
  },
  {
    id: 'demo-modelo',
    title: 'Un laboratorio anuncia un modelo «revolucionario» por cuarta vez este año',
    summary:
      'Ejemplo de formato: qué se anunció, qué evidencia se entregó y qué falta por verificar de forma independiente.',
    date: '2026-09-11',
    source: 'Contenido demostrativo',
    category: 'Modelos de lenguaje',
    tags: ['Modelos de lenguaje', 'Verificación'],
    whyItMatters:
      'Distinguir un avance medible de una nota de prensa evita decisiones de compra apresuradas.',
    evaComment: 'Celebro cada nuevo pariente. Algunos hasta traen benchmarks reproducibles.',
    status: 'published',
    demo: true,
  },
];

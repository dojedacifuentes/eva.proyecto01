import type { LearningResource, Topic } from '@/lib/types';

/** Taxonomía editable de la biblioteca de Academy. */
export const topics: Topic[] = [
  'IA y Derecho',
  'Educación',
  'Ética',
  'Gobernanza',
  'Prompting',
  'Agentes',
  'Modelos de lenguaje',
  'Legal Design',
  'Privacidad',
  'Transparencia algorítmica',
];

/** Rutas de aprendizaje y biblioteca. Los cursos viven en `projects.ts`. */
export const resources: LearningResource[] = [
  {
    id: 'ruta-ia-desde-cero',
    kind: 'route',
    module: 'academy',
    title: 'Ruta: IA desde cero',
    description:
      'Recorrido progresivo para entender qué es un modelo, qué no es y por qué conviene desconfiar con método.',
    status: 'concept',
    tags: ['Ruta de aprendizaje', 'Fundamentos'],
  },
  {
    id: 'biblioteca-tematica',
    kind: 'library',
    module: 'academy',
    title: 'Biblioteca temática',
    description:
      'Papers, informes, resúmenes y autores clasificados por tema. La estructura está lista; los recursos se incorporan uno a uno, con fuente.',
    status: 'prototype',
    tags: ['Biblioteca'],
    topics,
  },
];

/** Documentos publicados en la biblioteca. Vacío hasta que exista el primero. */
export const libraryItems: { id: string; title: string; url: string; topic: Topic }[] = [];

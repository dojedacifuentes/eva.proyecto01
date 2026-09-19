import type { Module } from '@/lib/types';
import { NEWS_NAME } from './site';

/** Los cuatro universos. El orden de este arreglo es el orden en pantalla. */
export const modules: Module[] = [
  {
    id: 'academy',
    code: '01',
    name: 'EVA Academy',
    tagline: 'Cursos, rutas y biblioteca.',
    description:
      'Centro de aprendizaje y documentación: microlecciones, recorridos progresivos y una biblioteca clasificada por temas.',
    accent: 'cyan',
    href: '#academy',
    intent: 'Quiero aprender',
  },
  {
    id: 'news',
    code: '02',
    name: NEWS_NAME,
    tagline: 'Noticias de IA, con contexto.',
    description:
      'Actualidad de inteligencia artificial explicada con fuentes, contexto y perspectiva crítica.',
    accent: 'yellow',
    href: '#news',
    intent: 'Quiero enterarme',
  },
  {
    id: 'arcade',
    code: '03',
    name: 'EVA Arcade',
    tagline: 'Juegos, simuladores y experiencias.',
    description:
      'Juegos y simuladores para aprender Derecho a través de decisiones y experiencias.',
    accent: 'magenta',
    href: '#arcade',
    intent: 'Quiero jugar',
  },
  {
    id: 'lab',
    code: '04',
    name: 'EVA Lab',
    tagline: 'Herramientas, prototipos y experimentos.',
    description:
      'Herramientas de IA aplicada y prototipos, con su estado de desarrollo a la vista.',
    accent: 'violet',
    href: '#lab',
    intent: 'Quiero construir',
  },
];

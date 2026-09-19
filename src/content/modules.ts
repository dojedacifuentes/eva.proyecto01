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
    aside: 'Enseño despacio. Ustedes procesan en serie.',
  },
  {
    id: 'news',
    code: '02',
    name: NEWS_NAME,
    tagline: 'Noticias de IA, con contexto.',
    description:
      'EVA cuenta, contextualiza y explica lo que cambia en inteligencia artificial. Con fuente, fecha y una opinión que nadie pidió.',
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
      'Aprender Derecho tomando decisiones y asumiendo consecuencias. Aquí, al menos, son simuladas.',
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
      'Prototipos funcionales para usar hoy y experimentos con su estado a la vista. Lo que no funciona todavía, lo dice.',
    accent: 'violet',
    href: '#lab',
    intent: 'Quiero construir',
    aside: 'Todo prototipo aspira a dejar obsoleto a alguien.',
  },
];

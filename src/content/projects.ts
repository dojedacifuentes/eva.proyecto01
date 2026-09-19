import type { Project } from '@/lib/types';

/**
 * Proyectos de EVA. Cada proyecto existe una sola vez; `modules` y `contexts`
 * deciden en qué universos aparece y cómo se presenta en cada uno.
 *
 * El destacado de la portada es el primero con `featured: true`.
 */
export const projects: Project[] = [
  {
    id: 'eva-prompting',
    title: 'EVA Lab: prompting jurídico',
    description:
      'Una herramienta y un curso para construir, auditar y verificar prompts jurídicos.',
    status: 'available',
    kinds: ['course', 'prototype'],
    modules: ['academy', 'lab'],
    tags: ['Prompting', 'IA y Derecho', 'Verificación'],
    href: 'https://evaprompts.vercel.app/',
    updatedAt: '2026-09-18',
    contexts: {
      academy: {
        label: 'Construye tu prompt jurídico',
        description:
          'Cinco etapas para diseñar, auditar y verificar instrucciones jurídicas.',
        intent: 'Microcurso destacado',
        cta: 'Empezar el microcurso',
        href: 'https://evaprompts.vercel.app/curso',
      },
      lab: {
        label: 'Prompt Lab',
        description:
          'Constructor interactivo de prompts jurídicos mediante doce decisiones explícitas.',
        intent: 'Prototipo funcional',
        cta: 'Abrir el Prompt Lab',
        href: 'https://evaprompts.vercel.app/prompt-lab',
      },
    },
  },
  {
    id: 'foro-invisible',
    title: 'FORO [in]VISIBLE',
    descriptor: 'Simulador procesal chileno',
    description:
      'Una ciudad judicial convertida en experiencia narrativa. Aprende procedimiento, toma decisiones y construye tu trayectoria como litigante.',
    status: 'available',
    kinds: ['game'],
    modules: ['arcade'],
    tags: ['Derecho procesal', 'Simulación', 'Narrativa'],
    href: 'https://evagameproce.vercel.app/juego',
    updatedAt: '2026-09-18',
    featured: true,
    featuredPitch:
      'Practica decisiones procesales en un entorno narrativo, a tu propio ritmo.',
    contexts: {
      arcade: {
        label: 'FORO [in]VISIBLE',
        description:
          'Una ciudad judicial convertida en experiencia narrativa. Aprende procedimiento, toma decisiones y construye tu trayectoria como litigante.',
        intent: 'Experiencia insignia',
        cta: 'Entrar al juego',
        href: 'https://evagameproce.vercel.app/juego',
      },
    },
    repository: 'TODO_GAME_REPOSITORY_URL',
  },
  {
    id: 'arcade-next',
    title: 'Próxima experiencia',
    description:
      'Simuladores de audiencias, trivias jurídicas y nuevos desafíos interactivos. En fase de diseño.',
    status: 'concept',
    kinds: ['game'],
    modules: ['arcade'],
    tags: ['Simuladores', 'Trivias'],
  },
  {
    id: 'lab-next',
    title: 'Próximo experimento',
    description:
      'Una nueva herramienta de IA aplicada, actualmente en fase de exploración.',
    status: 'concept',
    kinds: ['prototype'],
    modules: ['lab'],
    tags: ['Experimento'],
  },
];

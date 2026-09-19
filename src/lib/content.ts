import { modules } from '@/content/modules';
import { news } from '@/content/news';
import { projects } from '@/content/projects';
import { libraryItems, resources } from '@/content/resources';
import type {
  ContentStatus,
  Module,
  ModuleEntry,
  ModuleId,
  NewsItem,
  Project,
  ProjectKind,
} from './types';

export const statusLabel: Record<ContentStatus, string> = {
  available: 'Disponible',
  prototype: 'Prototipo',
  'in-development': 'En desarrollo',
  concept: 'Concepto',
};

const statusOrder: ContentStatus[] = ['available', 'prototype', 'in-development', 'concept'];

export function getModule(id: ModuleId): Module {
  const found = modules.find((module) => module.id === id);
  if (!found) throw new Error(`Universo desconocido: ${id}`);
  return found;
}

/** Un enlace sólo es real si es http(s); los marcadores TODO_ no cuentan. */
export function isLive(href?: string): href is string {
  return !!href && /^https?:\/\//.test(href);
}

/** Proyecta un proyecto en un universo usando su contexto, si lo tiene. */
function projectEntry(project: Project, moduleId: ModuleId): ModuleEntry {
  const context = project.contexts?.[moduleId];
  return {
    id: `${project.id}:${moduleId}`,
    title: context?.label ?? project.title,
    description: context?.description ?? project.description,
    status: project.status,
    tags: project.tags,
    descriptor: project.descriptor,
    intent: context?.intent,
    cta: context?.cta,
    href: context?.href ?? project.href,
  };
}

export function getModuleEntries(moduleId: ModuleId): ModuleEntry[] {
  const fromProjects = projects
    .filter((project) => project.modules.includes(moduleId))
    .map((project) => projectEntry(project, moduleId));

  const fromResources = resources
    .filter((resource) => resource.module === moduleId)
    .map<ModuleEntry>((resource) => ({
      id: resource.id,
      title: resource.title,
      description: resource.description,
      status: resource.status,
      tags: resource.tags,
    }));

  return [...fromProjects, ...fromResources].sort(
    (a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status),
  );
}

export function getPublishedNews(limit = 3): NewsItem[] {
  return news
    .filter((item) => item.status !== 'draft')
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

export function getFeaturedProject(): Project | undefined {
  return projects.find((project) => project.featured && isLive(project.href));
}

/** Resumen por universo para las tarjetas del selector. */
export function getModuleSummary(moduleId: ModuleId): string {
  if (moduleId === 'news') {
    const items = getPublishedNews(Infinity);
    const real = items.filter((item) => !item.demo).length;
    return real > 0 ? `${real} publicadas` : `${items.length} de demostración`;
  }
  const entries = getModuleEntries(moduleId);
  const available = entries.filter((entry) => entry.status === 'available').length;
  return `${available} disponible${available === 1 ? '' : 's'} · ${entries.length} en total`;
}

export interface ArchiveStat {
  label: string;
  value: number;
  note?: string;
}

/** Contadores del archivo, siempre derivados de las colecciones. */
export function getArchiveStats(): ArchiveStat[] {
  const published = news.filter((item) => item.status !== 'draft');
  const realNews = published.filter((item) => !item.demo).length;
  const routes = resources.filter((resource) => resource.kind === 'route');
  const liveRoutes = routes.filter((route) => route.status !== 'concept').length;
  const countKind = (kind: ProjectKind) =>
    projects.filter((project) => project.kinds.includes(kind) && project.status !== 'concept')
      .length;

  return [
    { label: 'Cursos', value: countKind('course') },
    {
      label: 'Rutas',
      value: liveRoutes,
      note: routes.length > liveRoutes ? `${routes.length - liveRoutes} en concepto` : undefined,
    },
    {
      label: 'Recursos',
      value: libraryItems.length,
      note: libraryItems.length === 0 ? 'biblioteca en estructura' : undefined,
    },
    {
      label: 'Noticias',
      value: realNews,
      note: realNews === 0 ? `${published.length} de demostración` : undefined,
    },
    { label: 'Juegos', value: countKind('game') },
    { label: 'Prototipos', value: countKind('prototype') },
  ];
}

const dateFormat = new Intl.DateTimeFormat('es-CL', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

export function formatDate(iso: string): string {
  return dateFormat.format(new Date(`${iso}T00:00:00Z`));
}

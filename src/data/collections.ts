// ─────────────────────────────────────────────────────────────────────────────
// Colecciones de EVA — vacías en la v0.1.
//
// No se inventan cursos, prototipos ni informes. Cada sección muestra un estado
// editorial explícito mientras su colección esté vacía, y pasa a renderizar
// fichas en cuanto se añade el primer elemento real.
// ─────────────────────────────────────────────────────────────────────────────
import type { Course, Prototype, Report } from '@/lib/types';

export const courses: Course[] = [];

export const prototypes: Prototype[] = [];

export const reports: Report[] = [];

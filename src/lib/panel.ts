import { readFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * Lector de `caso/PANEL.md`.
 *
 * El Panel es la fuente y la vista es el artefacto — nunca al revés. Por eso
 * aquí no hay datos: se leen del archivo en tiempo de compilación, de modo que
 * no existe una segunda copia que se pueda desincronizar. Editar el panel es
 * editar el Markdown.
 *
 * La gramática es deliberadamente pobre: una línea por ítem, tres campos
 * separados por `|`. Nada de un motor de Markdown completo para leer listas.
 */

export const ITEM_STATES = ['ok', 'curso', 'falta', 'verificar'] as const;
export type ItemState = (typeof ITEM_STATES)[number];

export type PanelItem = {
  state: ItemState;
  text: string;
  /** Archivo que respalda el dato, o `null` si no consta. */
  source: string | null;
};

export type PanelSection = {
  number: string;
  title: string;
  /** Nota de la sección, escrita como cita en el Markdown. */
  note: string | null;
  items: PanelItem[];
};

export type Panel = {
  title: string;
  lead: string | null;
  meta: { label: string; value: string }[];
  sections: PanelSection[];
};

const STATE_SET = new Set<string>(ITEM_STATES);

function isState(value: string): value is ItemState {
  return STATE_SET.has(value);
}

export async function readPanel(): Promise<Panel> {
  const file = path.join(process.cwd(), 'caso', 'PANEL.md');
  const raw = await readFile(file, 'utf8');

  // Los comentarios HTML documentan el formato para quien edita; no se leen.
  const lines = raw.replace(/<!--[\s\S]*?-->/g, '').split(/\r?\n/);

  let title = 'Panel';
  const lead: string[] = [];
  const meta: Panel['meta'] = [];
  const sections: PanelSection[] = [];

  for (const line of lines) {
    const text = line.trim();
    if (text === '') continue;

    if (text.startsWith('## ')) {
      const heading = text.slice(3).trim();
      const [number, ...rest] = heading.split('·');
      sections.push({
        number: number.trim(),
        title: rest.join('·').trim() || heading,
        note: null,
        items: [],
      });
      continue;
    }

    if (text.startsWith('# ')) {
      title = text.slice(2).trim();
      continue;
    }

    const current = sections.at(-1);

    if (text.startsWith('> ')) {
      const note = text.slice(2).trim();
      if (current) current.note = [current.note, note].filter(Boolean).join(' ');
      else lead.push(note);
      continue;
    }

    if (text.startsWith('- ')) {
      if (!current) continue;
      const [state, body, source] = text
        .slice(2)
        .split('|')
        .map((part) => part.trim());

      if (!isState(state) || !body) continue;

      current.items.push({
        state,
        text: body,
        source: !source || source === 'no consta' ? null : source,
      });
      continue;
    }

    // Metadatos de cabecera: `Clave: valor`, sólo antes de la primera sección.
    if (!current) {
      const separator = text.indexOf(':');
      if (separator > 0) {
        meta.push({
          label: text.slice(0, separator).trim(),
          value: text.slice(separator + 1).trim(),
        });
      }
    }
  }

  return {
    title,
    lead: lead.length > 0 ? lead.join(' ') : null,
    meta,
    sections,
  };
}

/** Recuento por estado, para la cabecera del panel. */
export function tally(panel: Panel): Record<ItemState, number> {
  const counts: Record<ItemState, number> = {
    ok: 0,
    curso: 0,
    falta: 0,
    verificar: 0,
  };

  for (const section of panel.sections) {
    for (const item of section.items) counts[item.state] += 1;
  }

  return counts;
}

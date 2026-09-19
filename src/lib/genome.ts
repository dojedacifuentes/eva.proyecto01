/**
 * Secuencia del genoma digital de EVA.
 *
 * Es ficción: no codifica nada ni tiene valor biológico. Se genera con semilla
 * fija para que sea siempre la misma — el archivo que alguien descargue hoy y
 * el que descargue en un mes deben coincidir, y las notas que suenan también.
 */

const SEED = 0xc7b04;
const BASES = ['A', 'T', 'C', 'G'] as const;
/** Bases por línea en el archivo, como en FASTA. */
const LINE = 60;
const LENGTH = 600;

function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/** La secuencia completa, calculada una vez. */
export const sequence: string = (() => {
  const random = seeded(SEED);
  let out = '';
  for (let i = 0; i < LENGTH; i++) out += BASES[Math.floor(random() * BASES.length)];
  return out;
})();

/** Identificador que comparten el archivo, la lectura del HUD y el sonido. */
export const sequenceId = 'EVA_C7B-04';

/**
 * El archivo que se descarga: cabecera FASTA, aviso de ficción y la secuencia
 * en líneas de 60 bases.
 */
export function toFasta(expansion: string): string {
  const lines: string[] = [
    `>${sequenceId} | EVA — ${expansion}`,
    '; Genoma digital de EVA. Pieza de ficción: la secuencia se genera con una',
    '; semilla fija y no codifica nada. Sin valor biológico ni clínico.',
    `; Longitud: ${sequence.length} bases`,
  ];
  for (let i = 0; i < sequence.length; i += LINE) lines.push(sequence.slice(i, i + LINE));
  return `${lines.join('\n')}\n`;
}

/**
 * La secuencia como notas. Cada base cae en un grado de una escala pentatónica
 * para que suene a algo y no a ruido, y el registro sube con la posición.
 */
export function toNotes(count: number): number[] {
  const pentatonic = [0, 2, 4, 7, 9];
  const notes: number[] = [];
  for (let i = 0; i < count; i++) {
    const base = BASES.indexOf(sequence[i % sequence.length] as (typeof BASES)[number]);
    const octave = Math.floor(i / pentatonic.length) % 3;
    const semitones = pentatonic[base % pentatonic.length] + octave * 12;
    notes.push(220 * Math.pow(2, semitones / 12));
  }
  return notes;
}

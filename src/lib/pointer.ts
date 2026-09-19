/**
 * Estado compartido del puntero. Lo escribe quien lo detecta (EvaField y el
 * cursor de señal) y lo lee el campo de partículas en cada fotograma.
 *
 * Es un objeto mutable a propósito: nada de estado de React ni de eventos por
 * fotograma en una capa que se dibuja 60 veces por segundo.
 */

export interface Pulse {
  x: number;
  y: number;
  /** Marca de tiempo de nacimiento (performance.now). */
  born: number;
}

export interface PointerSignal {
  x: number;
  y: number;
  /** Hay un puntero fino sobre la ventana. */
  active: boolean;
  /** El puntero está sobre algo interactivo: el campo se engancha. */
  locked: boolean;
  /** Color del acento del elemento apuntado, si lo declara. */
  accent: string;
  /** Ondas de clic pendientes de dibujar. */
  pulses: Pulse[];
}

export const pointerSignal: PointerSignal = {
  x: -9999,
  y: -9999,
  active: false,
  locked: false,
  accent: '',
  pulses: [],
};

const MAX_PULSES = 4;

/** Registra una onda de clic. El campo la consume y la descarta al apagarse. */
export function emitPulse(x: number, y: number) {
  pointerSignal.pulses.push({ x, y, born: performance.now() });
  if (pointerSignal.pulses.length > MAX_PULSES) pointerSignal.pulses.shift();
}

/** Convierte `#rrggbb` o `rgb(...)` en `r, g, b`; cian de EVA si no se entiende. */
export function toRgb(color: string): string {
  const value = color.trim();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value);
  if (hex) {
    const raw = hex[1].length === 3 ? hex[1].replace(/./g, (c) => c + c) : hex[1];
    const n = parseInt(raw, 16);
    return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
  }
  const rgb = /rgba?\(([^)]+)\)/i.exec(value);
  if (rgb) {
    const [r, g, b] = rgb[1].split(/[,\s/]+/).filter(Boolean);
    if (r && g && b) return `${r}, ${g}, ${b}`;
  }
  return '63, 216, 238';
}

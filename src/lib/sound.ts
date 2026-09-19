/**
 * Microsonidos de EVA, sintetizados con Web Audio: no hay archivos de audio
 * que descargar ni licenciar. El contexto se crea recién con el primer clic en
 * el control de sonido, que es la interacción que los navegadores exigen.
 */

export type SoundName = 'boot' | 'confirm' | 'open';

interface Tone {
  frequency: number;
  to?: number;
  at: number;
  duration: number;
  type: OscillatorType;
}

const sounds: Record<SoundName, Tone[]> = {
  boot: [
    { frequency: 220, to: 440, at: 0, duration: 0.22, type: 'sine' },
    { frequency: 660, at: 0.16, duration: 0.18, type: 'triangle' },
  ],
  confirm: [{ frequency: 880, to: 660, at: 0, duration: 0.07, type: 'triangle' }],
  open: [
    { frequency: 392, at: 0, duration: 0.09, type: 'sine' },
    { frequency: 587, at: 0.07, duration: 0.12, type: 'sine' },
  ],
};

const MASTER_VOLUME = 0.05;

let context: AudioContext | null = null;
let enabled = false;

export function isSoundEnabled() {
  return enabled;
}

export function setSoundEnabled(next: boolean) {
  enabled = next;
  if (next) {
    context ??= new AudioContext();
    void context.resume();
    play('boot');
  } else {
    void context?.suspend();
  }
}

export function play(name: SoundName) {
  if (!enabled || !context) return;
  const now = context.currentTime;

  for (const tone of sounds[name]) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = now + tone.at;
    const end = start + tone.duration;

    oscillator.type = tone.type;
    oscillator.frequency.setValueAtTime(tone.frequency, start);
    if (tone.to) oscillator.frequency.exponentialRampToValueAtTime(tone.to, end);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(MASTER_VOLUME, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);

    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start);
    oscillator.stop(end + 0.02);
  }
}

/**
 * Reproduce una secuencia de notas, una tras otra. La usa el genoma para
 * sonificarse: sólo suena si alguien ya encendió el sonido en la cabecera.
 */
export function playSequence(frequencies: number[], step = 0.14) {
  if (!enabled || !context) return;
  const now = context.currentTime;

  frequencies.forEach((frequency, index) => {
    const oscillator = context!.createOscillator();
    const gain = context!.createGain();
    const start = now + index * step;
    const end = start + step * 0.9;

    oscillator.type = index % 2 === 0 ? 'sine' : 'triangle';
    oscillator.frequency.setValueAtTime(frequency, start);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(MASTER_VOLUME * 0.8, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);

    oscillator.connect(gain).connect(context!.destination);
    oscillator.start(start);
    oscillator.stop(end + 0.02);
  });
}

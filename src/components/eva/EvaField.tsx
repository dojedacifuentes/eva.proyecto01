'use client';

import { useEffect, useRef } from 'react';
import { fieldSignal } from '@/lib/field';
import { emitPulse, pointerSignal, toRgb } from '@/lib/pointer';
import { getQuality, reportFrame, subscribeQuality, type QualityLevel } from '@/lib/quality';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  /** 0 = punto redondo, 1 = cuadrado. Sigue al estado del cursor. */
  morph: number;
}

const LINK_DISTANCE = 132;
const POINTER_DISTANCE = 200;
const PULSE_LIFE = 900;
const PULSE_SPEED = 0.42;
const IDLE_RGB = '63, 216, 238';
/** Los hilos se pintan en tandas por opacidad: tantas tandas, tantos trazos por fotograma. */
const LINK_BUCKETS = 5;

/** Cuántas partículas y a qué distancia se enlazan, según la calidad medida. */
const DENSITY: Record<QualityLevel, { max: number; perPixel: number; link: number }> = {
  high: { max: 78, perPixel: 24000, link: LINK_DISTANCE },
  mid: { max: 56, perPixel: 32000, link: 116 },
  low: { max: 36, perPixel: 48000, link: 100 },
};

/**
 * Fondo reactivo: una luz que sigue al puntero y un campo de partículas
 * escaso en un único canvas. Capa decorativa: no captura eventos y la
 * página se lee igual sin ella.
 *
 * Las partículas se enganchan al puntero, se vuelven cuadradas cuando el cursor
 * se posa sobre algo interactivo y se apartan con la onda de cada clic.
 *
 * El recorrido también le habla (`lib/field`): cada lugar tiñe los hilos con su
 * acento, un lugar clausurado lo frena hasta casi detenerlo (la v6 lo usaba en
 * Vigilancia; hoy no hay ninguno), y las acciones del genoma y del cuerpo lo
 * sacuden un instante. La quietud es una frenada que se ve ocurrir, no un
 * interruptor.
 *
 * Lo que cuesta, y por qué se hace así (v8.3):
 * - La luz del puntero era un degradado del fondo posicionado con variables
 *   CSS en `<html>`: cada movimiento del ratón recalculaba el estilo del
 *   documento entero y repintaba la pantalla completa. Ahora es un elemento
 *   propio que se mueve con `transform` desde el bucle: sólo el compositor.
 * - El paralaje del retrato (`--nx`/`--ny`) se escribe en la portada, no en
 *   la raíz, y una vez por fotograma, no por evento.
 * - Los hilos entre partículas se agrupan por opacidad y se trazan en cinco
 *   tandas, no uno a uno; la distancia se compara al cuadrado.
 * - Este bucle es el sensor de la calidad adaptativa (`lib/quality`): corre en
 *   toda la página y sabe cuánto dura cada fotograma. Con calidad baja hay
 *   menos partículas y los hilos son más cortos.
 * - Un solo requestAnimationFrame, posiciones en refs, sin estado de React.
 *   Se pausa con la pestaña oculta. Con movimiento reducido dibuja un único
 *   fotograma estático y la luz no sigue al puntero.
 */
export function EvaField({ particles = true }: { particles?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lightRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const light = lightRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !light || !context) return;

    const root = document.documentElement;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let dots: Particle[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let lastTime = 0;
    /** Quietud vigente, 0–1: persigue despacio a `fieldSignal.calm`. */
    let calm = 0;
    let link = LINK_DISTANCE;
    /** El puntero, tal como llegó del último evento: se aplica en el fotograma, no en el evento. */
    let pointerDirty = false;
    let lightX = 0;
    let lightY = 0;
    let lightHalf = 0;
    /** La portada, para el paralaje del retrato: sólo ella lee `--nx`/`--ny`. */
    const hero = document.getElementById('inicio');

    const populate = () => {
      const density = DENSITY[getQuality()];
      link = density.link;
      const count = particles ? Math.min(density.max, Math.round((width * height) / density.perPixel)) : 0;
      if (count < dots.length) {
        dots.length = count;
        return;
      }
      while (dots.length < count) {
        dots.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.16,
          vy: (Math.random() - 0.5) * 0.16,
          r: Math.random() * 1.1 + 0.4,
          morph: 0,
        });
      }
    };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      dots = [];
      populate();
      // Hasta que llegue el puntero, la luz descansa donde la ponían los tokens: centro, un tercio.
      lightHalf = light.offsetWidth / 2;
      if (!pointerSignal.active) {
        lightX = width * 0.5;
        lightY = height * 0.3;
      }
      pointerDirty = true;
      placeLight();
      if (reduced.matches) draw();
    };

    /** Punto o cuadrado según cuánto se haya enganchado al cursor. */
    const drawDot = (dot: Particle, rgb: string) => {
      const size = dot.r * (1 + dot.morph * 0.55);
      context.fillStyle =
        dot.morph > 0.04 ? `rgba(${rgb}, ${0.42 + dot.morph * 0.5})` : 'rgba(190, 225, 235, 0.42)';
      if (dot.morph > 0.5) {
        context.fillRect(dot.x - size, dot.y - size, size * 2, size * 2);
        return;
      }
      context.beginPath();
      context.arc(dot.x, dot.y, size, 0, Math.PI * 2);
      context.fill();
    };

    /** Cinco trazados, uno por tanda de opacidad: los hilos de cada tanda van en un solo `stroke`. */
    const buckets: Path2D[] = [];
    const draw = () => {
      context.clearRect(0, 0, width, height);

      const { x: px, y: py, active, locked } = pointerSignal;
      const rgb = locked && pointerSignal.accent ? toRgb(pointerSignal.accent) : IDLE_RGB;

      for (const dot of dots) drawDot(dot, rgb);

      const linkSquared = link * link;
      for (let at = 0; at < LINK_BUCKETS; at++) buckets[at] = new Path2D();
      for (let i = 0; i < dots.length; i++) {
        const a = dots[i];
        for (let j = i + 1; j < dots.length; j++) {
          const b = dots[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const squared = dx * dx + dy * dy;
          if (squared >= linkSquared) continue;
          // Cuanto más cerca, más opaco: la tanda 0 es la más tenue.
          const near = 1 - Math.sqrt(squared) / link;
          const bucket = Math.min(LINK_BUCKETS - 1, Math.floor(near * LINK_BUCKETS));
          buckets[bucket].moveTo(a.x, a.y);
          buckets[bucket].lineTo(b.x, b.y);
        }
      }
      context.lineWidth = 1;
      for (let at = 0; at < LINK_BUCKETS; at++) {
        context.strokeStyle = `rgba(${fieldSignal.rgb}, ${(0.1 * (at + 0.5)) / LINK_BUCKETS})`;
        context.stroke(buckets[at]);
      }

      // Los hilos al puntero: pocos, y cada uno con su opacidad.
      if (active) {
        for (const a of dots) {
          const distance = Math.hypot(a.x - px, a.y - py);
          if (distance >= POINTER_DISTANCE) continue;
          const near = 1 - distance / POINTER_DISTANCE;
          context.strokeStyle = locked
            ? `rgba(${rgb}, ${0.62 * near})`
            : `rgba(154, 141, 255, ${0.38 * near})`;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(px, py);
          context.stroke();
        }
      }

      // Onda de clic: un anillo que se abre y se apaga.
      const now = performance.now();
      for (const pulse of pointerSignal.pulses) {
        const age = now - pulse.born;
        if (age > PULSE_LIFE) continue;
        const progress = age / PULSE_LIFE;
        context.strokeStyle = `rgba(${rgb}, ${0.5 * (1 - progress)})`;
        context.lineWidth = 1.5 * (1 - progress) + 0.3;
        context.beginPath();
        context.arc(pulse.x, pulse.y, age * PULSE_SPEED, 0, Math.PI * 2);
        context.stroke();
      }
      context.lineWidth = 1;
    };

    /** La luz y el paralaje se escriben aquí, una vez por fotograma. */
    const placeLight = () => {
      if (!pointerDirty) return;
      pointerDirty = false;
      light.style.transform = `translate3d(${lightX - lightHalf}px, ${lightY - lightHalf}px, 0)`;
      if (hero && !reduced.matches) {
        hero.style.setProperty('--nx', ((lightX / width) * 2 - 1).toFixed(3));
        hero.style.setProperty('--ny', ((lightY / height) * 2 - 1).toFixed(3));
      }
    };

    const tick = (time: number) => {
      const { x: px, y: py, active, locked } = pointerSignal;
      const now = performance.now();
      if (lastTime) reportFrame((time - lastTime) / 1000);
      lastTime = time;

      placeLight();

      // La quietud llega y se va despacio: unos dos segundos de frenada visible.
      calm += (fieldSignal.calm - calm) * 0.02;
      const drift = 1 - calm * 0.94;
      const surge = fieldSignal.surge;
      fieldSignal.surge = surge < 0.01 ? 0 : surge * 0.93;

      for (const dot of dots) {
        // Una sacudida del genoma: un empujón al azar que se disipa solo.
        if (surge > 0.01) {
          dot.vx += (Math.random() - 0.5) * surge * 0.7;
          dot.vy += (Math.random() - 0.5) * surge * 0.7;
        }

        if (active) {
          const dx = px - dot.x;
          const dy = py - dot.y;
          const distance = Math.hypot(dx, dy) || 1;
          if (distance < POINTER_DISTANCE) {
            // Enganche suave hacia el puntero; más firme cuando hay objetivo.
            const pull = (locked ? 0.021 : 0.008) * (1 - distance / POINTER_DISTANCE);
            dot.vx += (dx / distance) * pull;
            dot.vy += (dy / distance) * pull;
            dot.morph += ((locked ? 1 : 0) - dot.morph) * 0.08;
          } else {
            dot.morph += (0 - dot.morph) * 0.06;
          }
        } else if (dot.morph > 0.001) {
          dot.morph += (0 - dot.morph) * 0.06;
        }

        // Empuje del frente de cada onda de clic.
        for (const pulse of pointerSignal.pulses) {
          const age = now - pulse.born;
          if (age > PULSE_LIFE) continue;
          const dx = dot.x - pulse.x;
          const dy = dot.y - pulse.y;
          const distance = Math.hypot(dx, dy) || 1;
          if (Math.abs(distance - age * PULSE_SPEED) < 26) {
            const push = 0.36 * (1 - age / PULSE_LIFE);
            dot.vx += (dx / distance) * push;
            dot.vy += (dy / distance) * push;
          }
        }

        dot.vx *= 0.965;
        dot.vy *= 0.965;
        const speed = Math.hypot(dot.vx, dot.vy);
        if (speed < 0.05) {
          // Nunca se queda quieto: recupera su deriva de fondo.
          dot.vx += (Math.random() - 0.5) * 0.03;
          dot.vy += (Math.random() - 0.5) * 0.03;
        } else if (speed > 1.6) {
          dot.vx = (dot.vx / speed) * 1.6;
          dot.vy = (dot.vy / speed) * 1.6;
        }

        // En quietud conserva su velocidad pero apenas avanza: al salir, retoma donde iba.
        dot.x += dot.vx * drift;
        dot.y += dot.vy * drift;
        if (dot.x < -10) dot.x = width + 10;
        if (dot.x > width + 10) dot.x = -10;
        if (dot.y < -10) dot.y = height + 10;
        if (dot.y > height + 10) dot.y = -10;
      }

      if (pointerSignal.pulses.length) {
        pointerSignal.pulses = pointerSignal.pulses.filter((pulse) => now - pulse.born <= PULSE_LIFE);
      }

      draw();
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      cancelAnimationFrame(frame);
      lastTime = 0;
      if (reduced.matches || document.hidden) {
        draw();
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    const onPointer = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      pointerSignal.x = event.clientX;
      pointerSignal.y = event.clientY;
      pointerSignal.active = true;
      lightX = event.clientX;
      lightY = event.clientY;
      pointerDirty = true;
      // Quieto no hay bucle: la luz se coloca al momento.
      if (reduced.matches) placeLight();
    };

    const onLeave = () => {
      pointerSignal.active = false;
      pointerSignal.locked = false;
    };

    /** Con el cursor propio apagado, el clic igual deja su onda. */
    const onDown = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      if (!root.classList.contains('eva-cursor')) emitPulse(event.clientX, event.clientY);
    };

    resize();
    start();
    const unsubscribe = subscribeQuality(populate);
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    root.addEventListener('pointerleave', onLeave);
    document.addEventListener('visibilitychange', start);
    reduced.addEventListener('change', start);

    return () => {
      cancelAnimationFrame(frame);
      unsubscribe();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('pointerdown', onDown);
      root.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', start);
      reduced.removeEventListener('change', start);
    };
  }, [particles]);

  return (
    <div aria-hidden="true" className="field">
      {/* La luz que sigue al puntero: un elemento que se mueve por el compositor, no un fondo que se repinta. */}
      <span ref={lightRef} className="field__light" />
      <canvas ref={canvasRef} />
    </div>
  );
}

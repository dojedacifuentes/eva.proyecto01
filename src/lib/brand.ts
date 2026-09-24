/**
 * La marca de EVA como geometría.
 *
 * El símbolo (un cuadrado sobre una X) y el nombre (ƎVΛ) son **las mismas ocho
 * piezas** en otro orden: los cuatro lados del cuadrado (`q1`–`q4`) y los
 * cuatro brazos de la X (`x1`–`x4`). Del cuadrado salen las tres barras de la
 * E; el lado derecho se retira. La mitad de arriba de la X ya es una V, y la de
 * abajo, una Λ.
 *
 * Reglas de la ficha de marca que esto cumple por construcción, no por
 * cuidado: mismas piezas, mismo grosor, geometría rígida, **sólo traslación y
 * rotación**. Una pieza nunca se estira ni se deforma: cada una es un polígono
 * fijo y una pose sólo dice dónde está y cuánto gira.
 *
 * Lo único que cambia de escala es el encuadre (`fit`), igual que en el vídeo
 * de referencia: el símbolo es alto y el nombre es ancho, y los dos tienen que
 * caber en la misma caja.
 *
 * Unidades: el lado del cuadrado mide 10. Todo lo demás se deriva de ahí.
 */

export type Point = readonly [number, number];

export type SegmentId = 'q1' | 'q2' | 'q3' | 'q4' | 'x1' | 'x2' | 'x3' | 'x4';

export const SEGMENTS: readonly SegmentId[] = ['q1', 'q2', 'q3', 'q4', 'x1', 'x2', 'x3', 'x4'];

/** Dónde está una pieza: centro, giro en grados y visibilidad (0–1). */
export interface Place {
  x: number;
  y: number;
  angle: number;
  alpha: number;
}

export type Pose = Record<SegmentId, Place>;

/* ───────────── Medidas ───────────── */

/** Grosor de todo trazo. El mismo en las ocho piezas y en todas las poses. */
export const STROKE = 0.75;
/** Lado del cuadrado, que es también el largo de cada barra de la E. */
const SIDE = 10;
/** Alto del nombre: la E, la V y la Λ miden lo mismo. */
const CAP = 6;
/** Media anchura de la V (y de la Λ, y de la X). */
const HALF = 4.8;
/** Aire entre el cuadrado y la X, en el símbolo. */
const STACK_GAP = 2.7;
/** Aire entre la E y la V, y entre la V y la Λ, en el nombre. */
const GAP_EV = 2.1;
const GAP_VA = 0.35;
/** Cuánto se separan la V y la Λ al abrirse la X. */
const SPLIT_UP = 0.9;
const SPLIT_DOWN = 1.5;
/** Cuánto se apartan los lados del cuadrado al desacoplarse. */
const DETACH = 1.1;

/* Un brazo de la V: tapa horizontal arriba, corte vertical en el vértice. Así
   dos brazos juntos dan un vértice en punta, y cuatro juntos, una X limpia. */
const SLOPE = Math.atan2(CAP, HALF);
/** Ancho horizontal de la tapa de un brazo. */
const CUT = STROKE / Math.sin(SLOPE);
/** Alto del corte vertical en el vértice. */
const DROP = STROKE / Math.cos(SLOPE);
/** Del borde exterior del brazo a su punto de giro (el centro del corte). */
const REACH = CAP - DROP / 2;

/* ───────────── Las piezas ───────────── */

const bar: readonly Point[] = [
  [-SIDE / 2, -STROKE / 2],
  [SIDE / 2, -STROKE / 2],
  [SIDE / 2, STROKE / 2],
  [-SIDE / 2, STROKE / 2],
];

/** Brazo superior izquierdo de la X (brazo izquierdo de la V), con origen en el vértice. */
const arm: readonly Point[] = [
  [-HALF, -REACH],
  [CUT - HALF, -REACH],
  [0, -DROP / 2],
  [0, DROP / 2],
];

const mirror = (shape: readonly Point[], sx: number, sy: number): readonly Point[] =>
  shape.map(([x, y]) => [x * sx, y * sy] as const);

/** El polígono de cada pieza en sus propias coordenadas. Nunca cambia. */
export const SHAPES: Record<SegmentId, readonly Point[]> = {
  q1: bar,
  q2: bar,
  q3: bar,
  q4: bar,
  x1: arm,
  x2: mirror(arm, -1, 1),
  x3: mirror(arm, 1, -1),
  x4: mirror(arm, -1, -1),
};

/* ───────────── Las cuatro poses del storyboard ───────────── */

const at = (x: number, y: number, angle = 0, alpha = 1): Place => ({ x, y, angle, alpha });

/** Las cuatro piezas de la X comparten punto de giro: el centro de la X. */
const cross = (cx: number, cy: number) => ({
  x1: at(cx, cy),
  x2: at(cx, cy),
  x3: at(cx, cy),
  x4: at(cx, cy),
});

/** El centro de la X en el símbolo, bajo el cuadrado. */
const X_CENTER = SIDE + STACK_GAP + REACH;

/** La E de tres barras, centrada donde estaba el cuadrado. */
const stackedE = {
  q1: at(SIDE / 2, SIDE / 2 - CAP / 2 + STROKE / 2),
  q4: at(SIDE / 2, SIDE / 2),
  q3: at(SIDE / 2, SIDE / 2 + CAP / 2 - STROKE / 2),
  // El cuarto lado se retira hacia la órbita: se aparta y se apaga.
  q2: at(SIDE + 4, SIDE / 2, 90, 0),
};

const RAW: Record<PoseId, Pose> = {
  /* 01 · El símbolo: el cuadrado sobre la X. */
  isotype: {
    q1: at(SIDE / 2, STROKE / 2),
    q2: at(SIDE - STROKE / 2, SIDE / 2, 90),
    q3: at(SIDE / 2, SIDE - STROKE / 2),
    q4: at(STROKE / 2, SIDE / 2, 90),
    ...cross(SIDE / 2, X_CENTER),
  },
  /* 02 · El cuadrado se desacopla: cada lado se aparta y las esquinas se abren. */
  detach: {
    q1: at(SIDE / 2, STROKE / 2 - DETACH),
    q2: at(SIDE - STROKE / 2 + DETACH, SIDE / 2, 90),
    q3: at(SIDE / 2, SIDE - STROKE / 2 + DETACH),
    q4: at(STROKE / 2 - DETACH, SIDE / 2, 90),
    ...cross(SIDE / 2, X_CENTER),
  },
  /* 03 · El cuadrado se abre en una E; la X sigue entera. */
  unlock: {
    ...stackedE,
    ...cross(SIDE / 2, X_CENTER),
  },
  /* 04 · La X se parte: arriba una V, abajo una Λ. */
  split: {
    ...stackedE,
    x1: at(SIDE / 2, X_CENTER - SPLIT_UP),
    x2: at(SIDE / 2, X_CENTER - SPLIT_UP),
    x3: at(SIDE / 2, X_CENTER + SPLIT_DOWN),
    x4: at(SIDE / 2, X_CENTER + SPLIT_DOWN),
  },
  /* 06 · El nombre: ƎVΛ en fila, las tres letras del mismo alto. */
  logotype: (() => {
    const v = SIDE + GAP_EV + HALF;
    const a = v + HALF + GAP_VA + HALF;
    return {
      q1: at(SIDE / 2, STROKE / 2),
      q4: at(SIDE / 2, CAP / 2),
      q3: at(SIDE / 2, CAP - STROKE / 2),
      q2: at(a + HALF + 4, CAP / 2, 90, 0),
      x1: at(v, REACH),
      x2: at(v, REACH),
      x3: at(a, DROP / 2),
      x4: at(a, DROP / 2),
    };
  })(),
};

export type PoseId = 'isotype' | 'detach' | 'unlock' | 'split' | 'logotype';

/* ───────────── Operaciones ───────────── */

/** El polígono de una pieza colocada: girada y trasladada, nunca escalada. */
export function placeShape(id: SegmentId, place: Place): Point[] {
  const turn = (place.angle * Math.PI) / 180;
  const cos = Math.cos(turn);
  const sin = Math.sin(turn);
  return SHAPES[id].map(([x, y]) => [place.x + x * cos - y * sin, place.y + x * sin + y * cos] as const);
}

export interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** Caja de lo que se ve de una pose (las piezas apagadas no cuentan). */
export function boundsOf(pose: Pose, only: readonly SegmentId[] = SEGMENTS): Box {
  const box = { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity };
  for (const id of only) {
    if (pose[id].alpha < 0.5) continue;
    for (const [x, y] of placeShape(id, pose[id])) {
      box.left = Math.min(box.left, x);
      box.right = Math.max(box.right, x);
      box.top = Math.min(box.top, y);
      box.bottom = Math.max(box.bottom, y);
    }
  }
  return box;
}

/** Cada pose, centrada en el origen: así todas comparten centro, como en el vídeo. */
export const POSES: Record<PoseId, Pose> = Object.fromEntries(
  (Object.keys(RAW) as PoseId[]).map((id) => {
    const box = boundsOf(RAW[id]);
    const cx = (box.left + box.right) / 2;
    const cy = (box.top + box.bottom) / 2;
    const pose = Object.fromEntries(
      SEGMENTS.map((segment) => {
        const place = RAW[id][segment];
        return [segment, { ...place, x: place.x - cx, y: place.y - cy }];
      }),
    ) as Pose;
    return [id, pose];
  }),
) as Record<PoseId, Pose>;

/**
 * Las piezas que están en todas las poses: todas menos el lado del cuadrado que
 * se retira. Para encuadrar a medio camino sirven éstas: su caja cambia sin
 * saltos, mientras que la de todas salta cuando el lado apagado deja de contar.
 */
export const STEADY: readonly SegmentId[] = SEGMENTS.filter((id) =>
  (Object.keys(RAW) as PoseId[]).every((pose) => RAW[pose][id].alpha >= 0.5),
);

/** Ancho y alto de una pose centrada. */
export function sizeOf(pose: Pose) {
  const box = boundsOf(pose);
  return { width: box.right - box.left, height: box.bottom - box.top };
}

/** Curva de la ficha: entrada y salida suaves, sin rebote ni sobrepaso. */
export function ease(t: number) {
  const c = Math.min(1, Math.max(0, t));
  return c < 0.5 ? 4 * c * c * c : 1 - (-2 * c + 2) ** 3 / 2;
}

/**
 * Una pose a medio camino entre otras dos. `t` ya viene suavizado; puede ser
 * un número o uno por pieza (para escalonar).
 */
export function blendPose(
  from: Pose,
  to: Pose,
  t: number | ((id: SegmentId) => number),
  axis?: { x: number; y: number },
): Pose {
  return Object.fromEntries(
    SEGMENTS.map((id) => {
      const a = from[id];
      const b = to[id];
      const k = typeof t === 'number' ? t : t(id);
      return [
        id,
        {
          x: a.x + (b.x - a.x) * (axis ? axis.x : k),
          y: a.y + (b.y - a.y) * (axis ? axis.y : k),
          angle: a.angle + (b.angle - a.angle) * k,
          alpha: a.alpha + (b.alpha - a.alpha) * k,
        },
      ];
    }),
  ) as Pose;
}

/* ───────────── Línea de tiempo ───────────── */

export interface Step {
  pose: PoseId;
  /** Lo que tarda en llegar a esta pose desde la anterior, en milisegundos. */
  move: number;
  /** Lo que se queda quieta al llegar. */
  hold: number;
  /**
   * Retraso de cada pieza dentro del movimiento, como fracción de su duración.
   * Escalonar evita que dos letras se crucen: en la alineación sale primero la
   * Λ, después la V y al final la E, y ninguna pasa por encima de otra.
   */
  lag?: Partial<Record<SegmentId, number>>;
  /**
   * Trayectoria en L: un eje antes que el otro. Al alinear, las letras se
   * abren primero en horizontal y después suben o bajan a su fila; en línea
   * recta, la Λ atravesaba el brazo de la V.
   */
  axes?: 'x-first' | 'y-first';
}

/** Cuánto se solapan los dos tramos de una trayectoria en L (0: nada; 1: en recta). */
const AXIS_OVERLAP = 0.3;

/**
 * La revelación: del símbolo al nombre (la mitad de ida del bucle de la
 * ficha, 0–5 s, acelerada: en la página es una entrada, no un vídeo).
 */
export const REVEAL: readonly Step[] = [
  { pose: 'isotype', move: 0, hold: 600 },
  { pose: 'detach', move: 450, hold: 150 },
  { pose: 'unlock', move: 800, hold: 200 },
  { pose: 'split', move: 600, hold: 150 },
  { pose: 'logotype', move: 1100, hold: 0, axes: 'x-first' },
];

/** El regreso: del nombre al símbolo, en espejo (la mitad de vuelta del bucle). */
export const RETURN: readonly Step[] = [
  { pose: 'logotype', move: 0, hold: 0 },
  { pose: 'split', move: 1100, hold: 150, axes: 'y-first' },
  { pose: 'unlock', move: 600, hold: 200 },
  { pose: 'detach', move: 800, hold: 150 },
  { pose: 'isotype', move: 450, hold: 600 },
];

/**
 * El bucle entero de la ficha: del nombre al símbolo y de vuelta. Es lo que
 * se ve al pulsar el nombre en la portada.
 */
export const LOOP: readonly Step[] = [...RETURN, ...REVEAL.slice(1)];

/** Duración total de una línea de tiempo. */
export function durationOf(steps: readonly Step[]) {
  return steps.reduce((total, step) => total + step.move + step.hold, 0);
}

/**
 * Dónde está todo a los `ms` milisegundos de una línea de tiempo: la pose y,
 * aparte, entre qué dos poses va y cuánto le falta (para que el encuadre se
 * mueva con la misma curva que las piezas).
 */
export function sample(steps: readonly Step[], ms: number) {
  let clock = 0;
  let previous = steps[0];
  for (const step of steps) {
    if (step.move > 0 && ms < clock + step.move) {
      const raw = (ms - clock) / step.move;
      const lag = step.lag;
      const spread = lag ? Math.max(...Object.values(lag)) : 0;
      const each = lag ? (id: SegmentId) => ease((raw - (lag[id] ?? 0)) / (1 - spread)) : ease(raw);
      const span = (1 + AXIS_OVERLAP) / 2;
      const lead = ease(raw / span);
      const follow = ease((raw - (1 - span)) / span);
      const axis =
        step.axes === 'x-first' ? { x: lead, y: follow } : step.axes === 'y-first' ? { x: follow, y: lead } : undefined;
      return {
        pose: blendPose(POSES[previous.pose], POSES[step.pose], each, axis),
        from: previous.pose,
        to: step.pose,
        t: ease(raw),
      };
    }
    clock += step.move;
    if (ms < clock + step.hold) return { pose: POSES[step.pose], from: step.pose, to: step.pose, t: 1 };
    clock += step.hold;
    previous = step;
  }
  const last = steps[steps.length - 1].pose;
  return { pose: POSES[last], from: last, to: last, t: 1 };
}

/**
 * Escala para que una pose quepa en una caja, con margen. El encuadre del
 * símbolo y el del nombre son distintos (uno alto, otro ancho); entre medias
 * se interpola con la misma curva, como un zum de cámara lento.
 */
export function fit(pose: PoseId | Pose, width: number, height: number, margin = 0.08) {
  const size = sizeOf(typeof pose === 'string' ? POSES[pose] : pose);
  return Math.min((width * (1 - margin * 2)) / size.width, (height * (1 - margin * 2)) / size.height);
}

/**
 * Centro de lo que se ve, para encuadrar a medio camino: entre dos poses la
 * figura puede quedar descentrada (la E ya salió por la izquierda y la Λ aún
 * no ha llegado a la derecha).
 */
export function centerOf(pose: Pose) {
  const box = boundsOf(pose);
  return { x: (box.left + box.right) / 2, y: (box.top + box.bottom) / 2 };
}

/* ───────────── Color ───────────── */

/**
 * Los colores de la marca, medidos en los fotogramas del vídeo de referencia:
 * el trazo es casi blanco (con un tinte frío a la izquierda y cálido a la
 * derecha) y el halo va de azul eléctrico a violeta, siempre de izquierda a
 * derecha, sea cual sea la pose.
 */
export const BRAND_COLORS = {
  /** Núcleo del trazo: izquierda, centro, derecha. */
  core: ['#dcf2ff', '#f4f6ff', '#f5e6ff'],
  /** Halo: azul eléctrico, índigo, violeta. */
  glow: ['#2a8cff', '#5a60ff', '#a24dff'],
  /** Fondo de las piezas de marca que lo necesitan (icono, imagen para redes). */
  ground: '#03050d',
} as const;

/* ───────────── SVG ───────────── */

/**
 * Contorno del mismo color que el relleno, en unidades de la marca. Dos brazos
 * se tocan justo en el corte vertical del vértice, y el suavizado de bordes
 * deja ver ahí una raya fina; este contorno la tapa. En la cabecera equivale a
 * una décima de píxel: no cambia la figura.
 */
export const SEAM = 0.05;

const round = (value: number) => Math.round(value * 1000) / 1000;

/** Los `points` de un `<polygon>`. */
export function pointsOf(shape: readonly Point[]) {
  return shape.map(([x, y]) => `${round(x)},${round(y)}`).join(' ');
}

/** Caja de vista SVG que encierra una pose, con aire alrededor (para el halo). */
export function viewBoxOf(pose: PoseId, pad = 0) {
  const box = boundsOf(POSES[pose]);
  return {
    x: round(box.left - pad),
    y: round(box.top - pad),
    width: round(box.right - box.left + pad * 2),
    height: round(box.bottom - box.top + pad * 2),
  };
}

/** Los polígonos visibles de una pose, listos para pintar. */
export function polygonsOf(pose: PoseId) {
  return SEGMENTS.filter((id) => POSES[pose][id].alpha > 0.5).map((id) => ({
    id,
    points: pointsOf(placeShape(id, POSES[pose][id])),
  }));
}

/**
 * La marca como documento SVG suelto, para lo que no pasa por React: la imagen
 * de vista previa al compartir el enlace y el icono de la pantalla de inicio.
 * Las mismas dos capas que `EvaLogo`: halo desenfocado y trazo casi blanco.
 */
export function brandSvg(pose: PoseId, { pad = 1.6, blur = 0.8 }: { pad?: number; blur?: number } = {}) {
  const box = viewBoxOf(pose, pad);
  const shapes = polygonsOf(pose)
    .map((shape) => `<polygon points="${shape.points}"/>`)
    .join('');
  const across = `gradientUnits="userSpaceOnUse" x1="${box.x + pad}" x2="${round(box.x + box.width - pad)}" y1="0" y2="0"`;
  const stops = (colors: readonly string[]) =>
    colors.map((color, k) => `<stop offset="${k / (colors.length - 1)}" stop-color="${color}"/>`).join('');
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box.x} ${box.y} ${box.width} ${box.height}">`,
    '<defs>',
    `<linearGradient id="g" ${across}>${stops(BRAND_COLORS.glow)}</linearGradient>`,
    `<linearGradient id="c" ${across}>${stops(BRAND_COLORS.core)}</linearGradient>`,
    '<filter id="b" x="-25%" y="-80%" width="150%" height="260%">',
    `<feGaussianBlur in="SourceGraphic" stdDeviation="${blur}" result="w"/>`,
    `<feGaussianBlur in="SourceGraphic" stdDeviation="${round(blur * 0.32)}" result="t"/>`,
    // Un solo halo ancho: dos rellenaban los huecos de la E y dejaban una caja detrás.
    '<feMerge><feMergeNode in="w"/><feMergeNode in="t"/><feMergeNode in="t"/></feMerge>',
    '</filter>',
    '</defs>',
    `<g fill="url(#g)" filter="url(#b)">${shapes}</g>`,
    `<g fill="url(#c)" stroke="url(#c)" stroke-width="${SEAM}">${shapes}</g>`,
    '</svg>',
  ].join('');
}

/** El mismo SVG como `data:` URI, para una etiqueta `<img>`. */
export function brandDataUri(pose: PoseId, options?: Parameters<typeof brandSvg>[1]) {
  return `data:image/svg+xml;base64,${btoa(brandSvg(pose, options))}`;
}

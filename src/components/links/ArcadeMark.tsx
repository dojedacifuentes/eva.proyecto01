import { markStyles } from '@/lib/arcade-mark';
import { BRAND_COLORS, POSES, SEAM, SEGMENTS, SHAPES, pointsOf } from '@/lib/brand';

/*
 * Caja común a todas las capas, en unidades de la marca, centrada en el origen
 * (donde `brand.ts` centra cada pose). Cabe el nombre a lo ancho (31,7) y el
 * símbolo a lo alto (23,5), sin zum: el nombre sale más bajo que el símbolo,
 * dentro de la misma órbita, como en las fichas.
 */
const W = 60;
const H = 44;
const VIEW = `${-W / 2} ${-H / 2} ${W} ${H}`;
/** Radio de la órbita: el nombre entero cabe dentro. */
const ORBIT = 18.5;
/** Donde empieza y termina el degradado de la marca: de azul (izquierda) a violeta (derecha). */
const ACROSS = { x1: -16, x2: 16, y1: 0, y2: 0 };

const REST = POSES.isotype;

/**
 * Las ocho piezas, cada una en dos grupos: el de fuera se mueve en horizontal,
 * el de dentro en vertical, gira y se apaga (la trayectoria en L necesita los
 * dos ejes por separado). Los atributos `transform` dejan el símbolo armado
 * aunque la hoja no llegue; el CSS los sustituye.
 */
function Pieces() {
  return SEGMENTS.map((id) => (
    <g key={id} className={`mark-x mark-${id}`} transform={`translate(${REST[id].x} 0)`}>
      <g className="mark-y" transform={`translate(0 ${REST[id].y}) rotate(${REST[id].angle})`} opacity={REST[id].alpha}>
        <polygon points={pointsOf(SHAPES[id])} />
      </g>
    </g>
  ));
}

/** Los nodos de la órbita, en los ejes: azul a la izquierda, violeta a la derecha. */
const NODES = [
  { x: -ORBIT, y: 0, color: BRAND_COLORS.glow[0] },
  { x: 0, y: -ORBIT, color: BRAND_COLORS.glow[1] },
  { x: ORBIT, y: 0, color: BRAND_COLORS.glow[2] },
  { x: 0, y: ORBIT, color: BRAND_COLORS.glow[1] },
];

/** Punto de la órbita a `deg` grados (0 a la derecha, en sentido horario). */
const onOrbit = (deg: number, r: number) => {
  const turn = (deg * Math.PI) / 180;
  return `${Math.round(Math.cos(turn) * r * 100) / 100} ${Math.round(Math.sin(turn) * r * 100) / 100}`;
};
const arc = (from: number, to: number, r: number) => `M ${onOrbit(from, r)} A ${r} ${r} 0 0 1 ${onOrbit(to, r)}`;

/**
 * El símbolo de EVA ARCADE: □X dentro de su órbita. Al cargar hace una sola
 * vez el recorrido de la marca (□X → ≡X → ƎVΛ → □X, `lib/arcade-mark.ts`) y
 * se queda quieto; después sólo respira el halo y dos puntos dan la vuelta a
 * la órbita, muy despacio. Todo es CSS: cuatro SVG apilados para que lo que se
 * mueve (el halo, los puntos) sea una capa propia y lo mueva el compositor.
 *
 * Decorativo: el nombre lo dice el `h1` que va debajo.
 */
export function ArcadeMark() {
  return (
    <div className="arcade-mark" aria-hidden="true">
      <style dangerouslySetInnerHTML={{ __html: markStyles() }} />

      <svg className="arcade-mark__orbit" viewBox={VIEW} focusable="false">
        <defs>
          <linearGradient id="arcade-axis" gradientUnits="userSpaceOnUse" x1={-W / 2} x2={W / 2} y1="0" y2="0">
            <stop offset="0" stopColor="#a9b8ff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#a9b8ff" stopOpacity="1" />
            <stop offset="1" stopColor="#a9b8ff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="arcade-axis-v" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1={-H / 2} y2={H / 2}>
            <stop offset="0" stopColor="#a9b8ff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#a9b8ff" stopOpacity="1" />
            <stop offset="1" stopColor="#a9b8ff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="arcade-ring" gradientUnits="userSpaceOnUse" x1={-ORBIT} x2={ORBIT} y1="0" y2="0">
            <stop offset="0" stopColor={BRAND_COLORS.glow[0]} />
            <stop offset="0.5" stopColor={BRAND_COLORS.glow[1]} />
            <stop offset="1" stopColor={BRAND_COLORS.glow[2]} />
          </linearGradient>
        </defs>
        <g fill="none" strokeWidth="0.1" strokeDasharray="0.2 0.8">
          <line x1={-W / 2} y1="0" x2={W / 2} y2="0" stroke="url(#arcade-axis)" opacity="0.35" />
          <line x1="0" y1={-H / 2} x2="0" y2={H / 2} stroke="url(#arcade-axis-v)" opacity="0.3" />
          <circle r={ORBIT * 0.72} stroke="#a9b8ff" opacity="0.16" />
        </g>
        <circle r={ORBIT} fill="none" stroke="url(#arcade-ring)" strokeWidth="0.12" opacity="0.55" />
        <g fill="none" stroke="url(#arcade-ring)" strokeWidth="0.09" opacity="0.28">
          <path d={arc(200, 290, ORBIT + 1.6)} />
          <path d={arc(20, 110, ORBIT + 1.6)} />
        </g>
        {NODES.map((node) => (
          <g key={`${node.x} ${node.y}`} transform={`translate(${node.x} ${node.y})`}>
            <circle r="1.1" fill={node.color} opacity="0.22" />
            <circle r="0.42" fill={node.color} />
            <circle r="0.2" fill={BRAND_COLORS.core[1]} />
          </g>
        ))}
      </svg>

      {/* Dos puntos que recorren la órbita: la única señal de que el sistema sigue encendido. */}
      <svg className="arcade-mark__drift" viewBox={VIEW} focusable="false">
        <circle cx={ORBIT} cy="0" r="0.3" fill={BRAND_COLORS.core[1]} transform="rotate(-55)" />
        <circle cx={ORBIT + 1.6} cy="0" r="0.24" fill={BRAND_COLORS.glow[2]} transform="rotate(125)" />
      </svg>

      <svg className="arcade-mark__halo" viewBox={VIEW} focusable="false">
        <defs>
          <linearGradient id="arcade-glow" gradientUnits="userSpaceOnUse" {...ACROSS}>
            <stop offset="0" stopColor={BRAND_COLORS.glow[0]} />
            <stop offset="0.5" stopColor={BRAND_COLORS.glow[1]} />
            <stop offset="1" stopColor={BRAND_COLORS.glow[2]} />
          </linearGradient>
          {/* El mismo halo que `EvaLogo`: uno ancho y otro pegado al trazo. */}
          <filter id="arcade-blur" filterUnits="userSpaceOnUse" x={-W / 2} y={-H / 2} width={W} height={H}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.1" result="wide" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.35" result="tight" />
            <feMerge>
              <feMergeNode in="wide" />
              <feMergeNode in="wide" />
              <feMergeNode in="tight" />
            </feMerge>
          </filter>
        </defs>
        <g fill="url(#arcade-glow)" filter="url(#arcade-blur)">
          <Pieces />
        </g>
      </svg>

      <svg className="arcade-mark__core" viewBox={VIEW} focusable="false">
        <defs>
          <linearGradient id="arcade-core" gradientUnits="userSpaceOnUse" {...ACROSS}>
            <stop offset="0" stopColor={BRAND_COLORS.core[0]} />
            <stop offset="0.5" stopColor={BRAND_COLORS.core[1]} />
            <stop offset="1" stopColor={BRAND_COLORS.core[2]} />
          </linearGradient>
        </defs>
        {/* El contorno tapa la costura de los vértices (ver SEAM en brand.ts). */}
        <g fill="url(#arcade-core)" stroke="url(#arcade-core)" strokeWidth={SEAM}>
          <Pieces />
        </g>
      </svg>
    </div>
  );
}

/**
 * Genera los iconos de la marca a partir de su geometría (`src/lib/brand.ts`):
 *
 *   src/app/icon.svg        favicon: el símbolo con trazo grueso
 *   src/app/apple-icon.png  pantalla de inicio (180 px): el símbolo en su órbita
 *
 *   node scripts/brand-assets.mjs
 *
 * Y para un sitio hermano que lleva la marca (EVA LAB y los dos juegos del
 * Arcade):
 *
 *   node scripts/brand-assets.mjs --kit ../eva.prompts
 *   node scripts/brand-assets.mjs --kit ../eva.game.proce-main
 *   node scripts/brand-assets.mjs --kit ../famialiarpg
 *
 * escribe en ese repositorio los mismos dos iconos (`app/icon.svg`,
 * `app/apple-icon.png`) y `lib/marca-eva.ts` —dentro de `src/` si el
 * repositorio la usa—: el símbolo y el nombre ya colocados (las piezas de cada
 * pose, su caja, los colores y un SVG suelto con halo), para que allí no haga
 * falta la geometría. La marca se sigue dibujando sólo aquí.
 *
 * Se vuelve a ejecutar sólo si cambia la marca. `sharp` llega con Next; no es
 * una dependencia del proyecto.
 *
 * Por qué el favicon no usa las piezas tal cual: a 16 y 32 px, el trazo de la
 * marca (0,75 unidades sobre un cuadrado de 10) mide menos de un píxel y
 * desaparece. Toda marca tiene su versión para tamaños pequeños: aquí es la
 * misma figura —cuadrado sobre X, mismas proporciones, tapas horizontales—
 * con el trazo engrosado.
 */
import { existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { BRAND_COLORS, POSES, SEAM, SEGMENTS, STROKE, boundsOf, brandSvg, placeShape } from '../src/lib/brand.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const round = (value) => Math.round(value * 100) / 100;

/** Caja de un grupo de piezas en el símbolo. */
function boxOf(ids) {
  const points = ids.flatMap((id) => placeShape(id, POSES.isotype[id]));
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  return { left: Math.min(...xs), right: Math.max(...xs), top: Math.min(...ys), bottom: Math.max(...ys) };
}

const square = boxOf(['q1', 'q2', 'q3', 'q4']);
const cross = boxOf(['x1', 'x2', 'x3', 'x4']);

/* ───────────── Favicon ───────────── */

function favicon({ size = 32, height = 26, stroke = 2.2 }) {
  const unit = height / (cross.bottom - square.top);
  const cx = size / 2;
  const top = (size - height) / 2;
  const map = (x, y) => [cx + x * unit, top + (y - square.top) * unit];

  const [sl, st] = map(square.left, square.top);
  const [sr, sb] = map(square.right, square.bottom);
  const [xl, xt] = map(cross.left, cross.top);
  const [xr, xb] = map(cross.right, cross.bottom);

  // Diagonales con tapa horizontal: el corte horizontal mide stroke / sen(pendiente).
  let cut = stroke;
  for (let i = 0; i < 6; i++) cut = stroke / Math.sin(Math.atan2(xb - xt, xr - xl - cut));

  const t = stroke;
  const ring = `M${round(sl)} ${round(st)}H${round(sr)}V${round(sb)}H${round(sl)}Z M${round(sl + t)} ${round(st + t)}V${round(sb - t)}H${round(sr - t)}V${round(st + t)}Z`;
  const down = [[xl, xt], [xl + cut, xt], [xr, xb], [xr - cut, xb]];
  const up = [[xr, xt], [xr - cut, xt], [xl, xb], [xl + cut, xb]];
  const points = (list) => list.map(([x, y]) => `${round(x)},${round(y)}`).join(' ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="eva" gradientUnits="userSpaceOnUse" x1="${round(sl)}" x2="${round(sr)}" y1="0" y2="0">
      <stop stop-color="#3d9dff"/>
      <stop offset=".5" stop-color="#7a70ff"/>
      <stop offset="1" stop-color="#b863ff"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="7" fill="${BRAND_COLORS.ground}"/>
  <g fill="url(#eva)">
    <path fill-rule="evenodd" d="${ring}"/>
    <polygon points="${points(down)}"/>
    <polygon points="${points(up)}"/>
  </g>
</svg>
`;
}

/* ───────────── Icono de pantalla de inicio ───────────── */

/**
 * El símbolo dentro de su órbita, como en las fichas de la marca: un anillo
 * con ocho nodos (azules a la izquierda, violetas a la derecha) y la cruz de
 * ejes, muy tenue. iOS redondea las esquinas: el fondo va a sangre.
 */
function appleIcon(size = 180) {
  const c = size / 2;
  const radius = size * 0.4;
  const nodes = Array.from({ length: 8 }, (_, k) => {
    const angle = (k * Math.PI) / 4;
    const x = c + Math.cos(angle) * radius;
    const y = c + Math.sin(angle) * radius;
    const color = x < c - 1 ? BRAND_COLORS.glow[0] : x > c + 1 ? BRAND_COLORS.glow[2] : BRAND_COLORS.glow[1];
    return `<circle cx="${round(x)}" cy="${round(y)}" r="${size * 0.012}" fill="${color}"/><circle cx="${round(x)}" cy="${round(y)}" r="${size * 0.03}" fill="${color}" opacity=".25"/>`;
  }).join('');

  const logo = brandSvg('isotype', { pad: 1.6, blur: 0.9 });
  const logoHeight = size * 0.56;
  const [, , vw, vh] = logo.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number);
  const logoWidth = (logoHeight * vw) / vh;
  const nested = logo
    .replace('<svg ', `<svg x="${round(c - logoWidth / 2)}" y="${round(c - logoHeight / 2)}" width="${round(logoWidth)}" height="${round(logoHeight)}" `)
    .replace(' xmlns="http://www.w3.org/2000/svg"', '');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <radialGradient id="left" cx="0" cy=".5" r=".75"><stop stop-color="${BRAND_COLORS.glow[0]}" stop-opacity=".22"/><stop offset="1" stop-color="${BRAND_COLORS.glow[0]}" stop-opacity="0"/></radialGradient>
    <radialGradient id="right" cx="1" cy=".5" r=".75"><stop stop-color="${BRAND_COLORS.glow[2]}" stop-opacity=".22"/><stop offset="1" stop-color="${BRAND_COLORS.glow[2]}" stop-opacity="0"/></radialGradient>
    <linearGradient id="orbit" x1="0" x2="1"><stop stop-color="${BRAND_COLORS.glow[0]}"/><stop offset="1" stop-color="${BRAND_COLORS.glow[2]}"/></linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="${BRAND_COLORS.ground}"/>
  <rect width="${size}" height="${size}" fill="url(#left)"/>
  <rect width="${size}" height="${size}" fill="url(#right)"/>
  <g stroke="#9fb4ff" stroke-opacity=".16" stroke-width="1" stroke-dasharray="1 3">
    <line x1="0" y1="${c}" x2="${size}" y2="${c}"/><line x1="${c}" y1="0" x2="${c}" y2="${size}"/>
  </g>
  <circle cx="${c}" cy="${c}" r="${radius}" fill="none" stroke="url(#orbit)" stroke-opacity=".55" stroke-width="1.2"/>
  ${nodes}
  ${nested}
</svg>`;
}

/* ───────────── Kit para un sitio hermano ───────────── */

const round3 = (value) => Math.round(value * 1000) / 1000;
const list = (colors) => `[${colors.map((color) => `'${color}'`).join(', ')}]`;

/** Una pose ya colocada: su caja, sus piezas visibles y un SVG suelto con halo. */
function kitPose(pose) {
  const box = boundsOf(POSES[pose]);
  const pieces = SEGMENTS.filter((id) => POSES[pose][id].alpha > 0.5).map((id) =>
    placeShape(id, POSES[pose][id]).map(([x, y]) => [round3(x), round3(y)]),
  );
  const width = round3(box.right - box.left);
  const height = round3(box.bottom - box.top);
  return [
    '{',
    `      caja: { x: ${round3(box.left)}, y: ${round3(box.top)}, ancho: ${width}, alto: ${height} },`,
    '      piezas: [',
    ...pieces.map((points) => `        ${JSON.stringify(points)},`),
    '      ],',
    `      svg: ${JSON.stringify(brandSvg(pose, { pad: 1.6, blur: 0.8 }))},`,
    '    }',
  ].join('\n');
}

function kitModule() {
  return [
    '/**',
    ' * La marca de EVA —el símbolo □X y el nombre ƎVΛ—, ya colocada.',
    ' *',
    ' * GENERADO: no se edita a mano. Sale del repositorio de la landing',
    ' * (eva.proyecto01) con `node scripts/brand-assets.mjs --kit <este repositorio>`,',
    ' * a partir de su `src/lib/brand.ts`, donde vive y se prueba la geometría: ocho',
    ' * piezas rígidas (los cuatro lados del cuadrado y los cuatro brazos de la X)',
    ' * que sólo se trasladan y giran. Aquí llegan en sus dos poses.',
    ' *',
    ' * Unidades de la marca: el lado del cuadrado mide 10.',
    ' */',
    '',
    "export type PoseMarca = 'simbolo' | 'nombre';",
    '',
    'export const MARCA = {',
    '  /** Trazo casi blanco; halo de azul eléctrico a violeta, siempre de izquierda a derecha. */',
    '  colores: {',
    `    trazo: ${list(BRAND_COLORS.core)},`,
    `    halo: ${list(BRAND_COLORS.glow)},`,
    `    fondo: '${BRAND_COLORS.ground}',`,
    '  },',
    '  /** Grosor de todo trazo. */',
    `  grosor: ${STROKE},`,
    '  /** Contorno del color del relleno que tapa la costura de los vértices. */',
    `  costura: ${SEAM},`,
    '  poses: {',
    '    /** El símbolo: el cuadrado sobre la X. */',
    `    simbolo: ${kitPose('isotype')},`,
    '    /** El nombre: ƎVΛ, las tres letras del mismo alto. */',
    `    nombre: ${kitPose('logotype')},`,
    '  },',
    '} as const;',
    '',
  ].join('\n');
}

const args = process.argv.slice(2);
const kitAt = args.indexOf('--kit');
const kit = kitAt >= 0 ? args[kitAt + 1] : undefined;
if (kitAt >= 0 && !kit) throw new Error('--kit necesita la carpeta del repositorio de destino');

const icon = favicon({});
const apple = await sharp(Buffer.from(appleIcon())).png().toBuffer();
writeFileSync(path.join(root, 'src/app/icon.svg'), icon);
writeFileSync(path.join(root, 'src/app/apple-icon.png'), apple);

if (kit) {
  // Con carpeta `src/` (EVA LAB) o sin ella (los juegos del Arcade: `app/` y `lib/` en la raíz).
  const target = path.resolve(kit);
  const base = existsSync(path.join(target, 'src/app')) ? path.join(target, 'src') : target;
  if (!existsSync(path.join(base, 'app'))) throw new Error(`${target} no tiene carpeta app/ ni src/app/`);
  writeFileSync(path.join(base, 'app/icon.svg'), icon);
  writeFileSync(path.join(base, 'app/apple-icon.png'), apple);
  writeFileSync(path.join(base, 'lib/marca-eva.ts'), kitModule());
  console.log(`kit de la marca escrito en ${base}`);
}

// Vistas previas para revisar a ojo, fuera del proyecto si se pide.
const preview = args.find((arg, k) => !arg.startsWith('--') && args[k - 1] !== '--kit');
if (preview) {
  const cells = [16, 32, 64, 128]
    .map((px) => sharp(Buffer.from(icon)).resize(px, px).png().toBuffer())
    .concat(sharp(Buffer.from(appleIcon())).png().toBuffer());
  const images = await Promise.all(cells);
  const sizes = [16, 32, 64, 128, 180];
  let x = 10;
  const composite = images.map((input, k) => {
    const tile = { input, left: x, top: 10 };
    x += sizes[k] + 20;
    return tile;
  });
  await sharp({ create: { width: x, height: 200, channels: 4, background: '#1c2230' } })
    .composite(composite)
    .png()
    .toFile(preview);
}
console.log('iconos de la marca escritos');

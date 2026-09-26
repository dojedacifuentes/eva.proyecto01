/**
 * EVA LAB · studio-build — empaqueta el EVA Social Studio en un solo archivo HTML.
 *
 *   node scripts/studio-build.mjs                      → tools/social-studio/index.html
 *   node scripts/studio-build.mjs --render <spec.json> <salida>/   → SVG por pieza, desde un guion
 *
 * El Studio es una herramienta interna, NO pública: vive en `tools/`, fuera de `public/` y de
 * `src/app/`, así que Next no la sirve ni la empaqueta. Se abre con doble clic (funciona desde
 * `file://`: todo va incrustado, fuentes incluidas).
 *
 * Fuente única de la marca: `src/lib/brand.ts` y `src/lib/brand-art.ts` se convierten a JS con
 * `module.stripTypeScriptTypes` (Node ≥ 22.13) en `tools/social-studio/lib/`. No se copian a mano:
 * si cambia la geometría, se vuelve a ejecutar este script. Las fuentes (Space Grotesk y JetBrains
 * Mono, OFL 1.1) se incrustan desde `tools/social-studio/fonts/` para que la exportación a PNG no
 * dependa de la red ni del sistema.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const studio = path.join(root, 'tools/social-studio');
const libOut = path.join(studio, 'lib');
mkdirSync(libOut, { recursive: true });

/* 1 · La marca, de TypeScript a JavaScript, sin tocar el original. */
for (const name of ['brand', 'brand-art', 'binary']) {
  const source = readFileSync(path.join(root, 'src/lib', `${name}.ts`), 'utf8');
  const js = stripTypeScriptTypes(source, { mode: 'strip' })
    // Los imports relativos sin extensión no cargan en el navegador ni en Node sin el gancho.
    .replace(/from '\.\/([\w-]+)'/g, "from './$1.js'");
  writeFileSync(path.join(libOut, `${name}.js`), `// Generado por scripts/studio-build.mjs desde src/lib/${name}.ts. No editar.\n${js}`);
}

/* 2 · Las fuentes, como @font-face con data: URI. */
const fontsDir = path.join(studio, 'fonts');
const FONTS = [
  ['Space Grotesk', 400, 'SpaceGrotesk-Regular.woff2'],
  ['Space Grotesk', 500, 'SpaceGrotesk-Medium.woff2'],
  ['Space Grotesk', 700, 'SpaceGrotesk-Bold.woff2'],
  ['JetBrains Mono', 400, 'JetBrainsMono-Regular.woff2'],
  ['JetBrains Mono', 600, 'JetBrainsMono-SemiBold.woff2'],
];
export function fontFaces() {
  return FONTS.filter(([, , file]) => existsSync(path.join(fontsDir, file)))
    .map(([family, weight, file]) => {
      const data = readFileSync(path.join(fontsDir, file)).toString('base64');
      return `@font-face{font-family:'${family}';font-weight:${weight};font-style:normal;font-display:block;src:url(data:font/woff2;base64,${data}) format('woff2')}`;
    })
    .join('\n');
}

/* 3 · Modo guion: renderiza piezas a SVG sin abrir el Studio (para lotes y para las pruebas). */
const args = process.argv.slice(2);
if (args[0] === '--render') {
  const [, specPath, outDir] = args;
  const { compose } = await import(pathToFileURL(path.join(studio, 'src/templates.js')).href);
  const spec = JSON.parse(readFileSync(specPath, 'utf8'));
  mkdirSync(outDir, { recursive: true });
  const faces = fontFaces();
  let n = 0;
  for (const piece of spec.pieces) {
    const svg = compose(piece, { fontCss: faces });
    writeFileSync(path.join(outDir, `${piece.file}.svg`), svg);
    n++;
  }
  console.log(`studio-build --render → ${outDir}: ${n} SVG`);
  process.exit(0);
}

/* 4 · Un solo HTML: CSS, fuentes, lib y la interfaz, incrustados. */
const src = (name) => readFileSync(path.join(studio, 'src', name), 'utf8');
const inlineModule = (file) =>
  readFileSync(path.join(libOut, file), 'utf8')
    .replace(/^import .*$/gm, '')
    .replace(/^export (const|function|let|class) /gm, '$1 ')
    .replace(/^export \{[^}]*\};?$/gm, '');

const bundle = [
  '// ── lib/brand.js ──',
  inlineModule('brand.js'),
  '// ── lib/brand-art.js ──',
  inlineModule('brand-art.js'),
  '// ── lib/binary.js ──',
  inlineModule('binary.js'),
  '// ── src/templates.js ──',
  src('templates.js').replace(/^import .*$/gm, '').replace(/^export (const|function|let) /gm, '$1 '),
  '// ── src/studio.js ──',
  src('studio.js').replace(/^import .*$/gm, ''),
].join('\n');

const html = src('studio.html')
  .replace('/*__FONTS__*/', fontFaces())
  .replace('/*__CSS__*/', src('studio.css'))
  .replace('/*__JS__*/', bundle)
  .replace('__BUILT__', new Date().toISOString().slice(0, 10));
const outFile = path.join(studio, 'index.html');
writeFileSync(outFile, html);
console.log(`studio-build → ${path.relative(root, outFile)} (${(Buffer.byteLength(html) / 1024).toFixed(0)} KB)`);
if (!existsSync(fontsDir) || readdirSync(fontsDir).length === 0) {
  console.warn('Aviso: tools/social-studio/fonts/ está vacío; el Studio usará las fuentes del sistema.');
}

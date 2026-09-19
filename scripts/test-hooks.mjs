/**
 * Resolución de módulos para `node --test`.
 *
 * Node ejecuta TypeScript quitando los tipos, pero no conoce el alias `@/` ni
 * completa extensiones. Este gancho hace las dos cosas y nada más: así la
 * lógica pura de `src/lib` y `src/content` se prueba sin añadir dependencias.
 */
import { existsSync } from 'node:fs';
import { registerHooks } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const source = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');
const HAS_EXTENSION = /\.[cm]?[jt]sx?$|\.json$/;

registerHooks({
  resolve(specifier, context, nextResolve) {
    let file = null;
    if (specifier.startsWith('@/')) {
      file = path.join(source, specifier.slice(2));
    } else if (
      specifier.startsWith('.') &&
      !HAS_EXTENSION.test(specifier) &&
      context.parentURL?.startsWith('file:')
    ) {
      // Sólo lo que llega sin extensión: lo demás ya sabe resolverlo Node.
      file = path.resolve(path.dirname(fileURLToPath(context.parentURL)), specifier);
    }
    if (file && !HAS_EXTENSION.test(file)) {
      const found = ['.ts', '.tsx', '/index.ts']
        .map((extension) => file + extension)
        .find((name) => existsSync(name));
      if (found) file = found;
    }
    return nextResolve(file ? pathToFileURL(file).href : specifier, context);
  },
});

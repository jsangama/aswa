import { mkdir, rm, readdir, stat, copyFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'dist');
const INCLUDED_ROOT_FILES = ['index.html', 'ugc.html', 'manifest.json', 'sw.js'];
const INCLUDED_ROOT_DIRS = ['assets', 'css', 'js', 'src'];
const JS_EXCLUDED_FILES = new Set(['local-config.js', 'local-config.example.js']);

async function pathExists(target) {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

async function copyRecursive(src, dest) {
  const info = await stat(src);
  if (info.isDirectory()) {
    await mkdir(dest, { recursive: true });
    const entries = await readdir(src, { withFileTypes: true });
    for (const entry of entries) {
      if (path.basename(src) === 'js' && entry.isFile() && JS_EXCLUDED_FILES.has(entry.name)) {
        continue;
      }
      await copyRecursive(path.join(src, entry.name), path.join(dest, entry.name));
    }
    return;
  }

  await mkdir(path.dirname(dest), { recursive: true });
  await copyFile(src, dest);
}

async function main() {
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });

  for (const fileName of INCLUDED_ROOT_FILES) {
    const src = path.join(ROOT, fileName);
    if (!(await pathExists(src))) {
      throw new Error(`No se encontro archivo requerido: ${fileName}`);
    }
    await copyRecursive(src, path.join(OUT, fileName));
  }

  for (const dirName of INCLUDED_ROOT_DIRS) {
    const src = path.join(ROOT, dirName);
    if (!(await pathExists(src))) {
      throw new Error(`No se encontro directorio requerido: ${dirName}`);
    }
    await copyRecursive(src, path.join(OUT, dirName));
  }

  console.log(`Hosting bundle listo en ${path.relative(ROOT, OUT)}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exitCode = 1;
});

import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function loadJson(relPath) {
  const raw = await readFile(path.join(ROOT, relPath), 'utf8');
  return JSON.parse(raw);
}

async function loadText(relPath) {
  return readFile(path.join(ROOT, relPath), 'utf8');
}

function ok(message) {
  console.log(`[OK] ${message}`);
}

function check(condition, message, detail = '') {
  if (!condition) {
    throw new Error(detail ? `${message}: ${detail}` : message);
  }
  ok(message);
}

async function main() {
  check(await exists(path.join(ROOT, '.github', 'workflows', 'firebase-deploy.yml')), 'Existe workflow de despliegue Firebase');
  check(await exists(path.join(ROOT, 'scripts', 'build-hosting.mjs')), 'Existe build de hosting');
  check(await exists(path.join(ROOT, 'scripts', 'sync-school-prices.mjs')), 'Existe sincronizador de precios escolares');
  check(await exists(path.join(ROOT, 'docs', 'DEPLOYMENT.md')), 'Existe documentacion de despliegue');
  check(await exists(path.join(ROOT, 'docs', 'GITHUB_SETUP.md')), 'Existe guia de GitHub');

  const pkg = await loadJson('package.json');
  const firebase = await loadJson('firebase.json');
  const firebaserc = await loadJson('.firebaserc');
  const workflow = await loadText(path.join('.github', 'workflows', 'firebase-deploy.yml'));
  const deployDoc = await loadText(path.join('docs', 'DEPLOYMENT.md'));
  const githubDoc = await loadText(path.join('docs', 'GITHUB_SETUP.md'));

  check(pkg.scripts?.['build:hosting'] === 'node scripts/build-hosting.mjs', 'Package define build:hosting');
  check(pkg.scripts?.['deployment:preflight'] === 'node scripts/deployment-preflight.mjs', 'Package define deployment:preflight');
  check(pkg.scripts?.['catalogo:sync-school-prices'] === 'node scripts/sync-school-prices.mjs', 'Package define catalogo:sync-school-prices');

  check(firebase.hosting?.public === 'dist', 'Firebase Hosting publica dist');
  check(Array.isArray(firebase.hosting?.predeploy) && firebase.hosting.predeploy.includes('npm run build:hosting'), 'Firebase Hosting ejecuta build antes del deploy');

  const projects = firebaserc.projects || {};
  check(projects.default === 'pedidos-aswa-peru', 'firebaserc default apunta a produccion');
  check(projects.production === 'pedidos-aswa-peru', 'firebaserc production apunta al proyecto real');
  check(projects.staging === 'pedidos-aswa-peru-staging', 'firebaserc staging apunta al proyecto de prueba');

  check(workflow.includes('workflow_run'), 'Workflow de despliegue usa workflow_run');
  check(workflow.includes('workflow_dispatch'), 'Workflow de despliegue permite ejecucion manual');
  check(workflow.includes('deploy-staging'), 'Workflow incluye despliegue staging');
  check(workflow.includes('deploy-production'), 'Workflow incluye despliegue production');
  check(workflow.includes('FIREBASE_SERVICE_ACCOUNT'), 'Workflow usa secret de service account');
  check(workflow.includes('Check Firebase credentials'), 'Workflow valida credenciales Firebase antes de desplegar');
  check(workflow.includes('skipping Firebase deploy'), 'Workflow omite deploy si falta secret Firebase');
  check(workflow.includes('FIREBASE_PROJECT_STAGING'), 'Workflow usa variable del proyecto staging');
  check(workflow.includes('FIREBASE_PROJECT_PRODUCTION'), 'Workflow usa variable del proyecto production');
  check(workflow.includes('deploy --only hosting,firestore:rules,firestore:indexes'), 'Workflow despliega hosting y Firestore');
  check(!workflow.includes('firestore:indexes,storage'), 'Workflow no despliega Storage antes de inicializar bucket');

  check(deployDoc.includes('FIREBASE_SERVICE_ACCOUNT'), 'Doc de despliegue documenta el secret requerido');
  check(deployDoc.includes('staging') && deployDoc.includes('production'), 'Doc de despliegue documenta staging y production');
  check(deployDoc.includes('Firebase Storage se despliega aparte'), 'Doc de despliegue separa Storage hasta inicializar bucket');
  check(githubDoc.includes('FIREBASE_SERVICE_ACCOUNT'), 'Guia de GitHub documenta el secret requerido');
  check(githubDoc.includes('FIREBASE_PROJECT_STAGING') && githubDoc.includes('FIREBASE_PROJECT_PRODUCTION'), 'Guia de GitHub documenta las variables del proyecto');

  const distRoot = path.join(ROOT, 'dist');
  if (await exists(distRoot)) {
    const distJsExample = path.join(distRoot, 'js', 'local-config.example.js');
    const distJsLocal = path.join(distRoot, 'js', 'local-config.js');
    check(!(await exists(distJsExample)), 'dist no publica local-config.example.js');
    check(!(await exists(distJsLocal)), 'dist no publica local-config.js');
  } else {
    ok('dist aun no existe - se omite verificacion de bundle');
  }

  console.log('Deployment preflight OK.');
}

main().catch((err) => {
  console.error(err.message || err);
  process.exitCode = 1;
});

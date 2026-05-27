#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import process from 'node:process';

const REQUIRED_FILES = [
  'firestore.rules',
  'firebase.json',
  'scripts/set-firebase-claims.mjs',
  'scripts/upsert-operator-user.mjs',
  'docs/FIREBASE_CLAIMS.md',
  'docs/FIRESTORE_SECURITY.md',
];

function parseArgs(argv) {
  const values = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help' || arg === '-h') {
      values.help = true;
      continue;
    }

    if (!arg.startsWith('--')) {
      throw new Error(`Argumento inesperado: ${arg}`);
    }

    const key = arg.slice(2);
    const value = argv[index + 1];

    if (!value || value.startsWith('--')) {
      throw new Error(`Falta valor para --${key}`);
    }

    values[key] = value;
    index += 1;
  }

  return values;
}

function printHelp() {
  console.log(`
Check ASWA Firestore security readiness.

Usage:
  npm run security:preflight
  npm run security:preflight -- --business aswa001

Optional live Firebase Auth check:
  Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT before running.
`);
}

function check(condition, message, details = '') {
  return { ok: Boolean(condition), message, details };
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function localChecks(businessId) {
  const packageJson = readJson('package.json');
  const firebaseJson = readJson('firebase.json');
  const rules = readFileSync('firestore.rules', 'utf8');
  const index = readFileSync('index.html', 'utf8');

  return [
    ...REQUIRED_FILES.map((file) => check(existsSync(file), `Existe ${file}`)),
    check(packageJson.scripts?.['claims:set'], 'Existe script claims:set'),
    check(packageJson.scripts?.['operators:upsert'], 'Existe script operators:upsert'),
    check(firebaseJson.firestore?.rules === 'firestore.rules', 'firebase.json apunta a firestore.rules'),
    check(rules.includes('claimRole()'), 'Reglas validan role por custom claims'),
    check(rules.includes('claimBusinessId()'), 'Reglas validan businessId por custom claims'),
    check(rules.includes('cliente_uid'), 'Reglas protegen pedidos por cliente_uid'),
    check(index.includes('aswaSignInOperativo'), 'La app tiene login operativo con Firebase Auth'),
    check(index.includes('OPERATOR_AUTH_EMAILS'), 'La app soporta mapeo OPERATOR_AUTH_EMAILS'),
    check(index.includes('cliente_uid:    window.currentUser?.uid'), 'Pedidos nuevos guardan cliente_uid'),
    check(Boolean(businessId), 'Business ID definido', businessId || 'No definido'),
  ];
}

async function loadAdmin() {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.FIREBASE_SERVICE_ACCOUNT) {
    return null;
  }

  const admin = await import('firebase-admin');

  function loadCredential() {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const rawValue = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
      const serviceAccount = rawValue.startsWith('{')
        ? JSON.parse(rawValue)
        : JSON.parse(readFileSync(rawValue, 'utf8'));

      return admin.default.credential.cert(serviceAccount);
    }

    return admin.default.credential.applicationDefault();
  }

  if (!admin.default.apps.length) {
    admin.default.initializeApp({ credential: loadCredential() });
  }

  return admin.default;
}

async function authChecks(businessId) {
  const admin = await loadAdmin();

  if (!admin) {
    return [
      check(true, 'Revision Firebase Auth omitida', 'Configura GOOGLE_APPLICATION_CREDENTIALS para validar usuarios reales.'),
    ];
  }

  const users = [];
  let nextPageToken;

  do {
    const page = await admin.auth().listUsers(1000, nextPageToken);
    users.push(...page.users);
    nextPageToken = page.pageToken;
  } while (nextPageToken);

  const usersForBusiness = users.filter((user) => user.customClaims?.businessId === businessId);
  const roles = new Set(usersForBusiness.map((user) => user.customClaims?.role).filter(Boolean));

  return [
    check(roles.has('owner'), 'Existe usuario owner con claims', usersForBusiness.find((u) => u.customClaims?.role === 'owner')?.email || ''),
    check(roles.has('admin'), 'Existe usuario admin con claims', usersForBusiness.find((u) => u.customClaims?.role === 'admin')?.email || ''),
    check(roles.has('delivery'), 'Existe usuario delivery con claims', usersForBusiness.find((u) => u.customClaims?.role === 'delivery')?.email || ''),
  ];
}

function printResults(results) {
  let failed = 0;

  for (const result of results) {
    const icon = result.ok ? 'OK' : 'FAIL';
    const detail = result.details ? ` - ${result.details}` : '';
    console.log(`[${icon}] ${result.message}${detail}`);
    if (!result.ok) failed += 1;
  }

  return failed;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  const businessId = args.business || args.businessId || 'aswa001';
  const results = [
    ...localChecks(businessId),
    ...(await authChecks(businessId)),
  ];

  const failed = printResults(results);

  if (failed > 0) {
    throw new Error(`Preflight fallo con ${failed} problema(s). No despliegues reglas todavia.`);
  }

  console.log('Preflight OK. Puedes desplegar reglas cuando estes listo.');
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});

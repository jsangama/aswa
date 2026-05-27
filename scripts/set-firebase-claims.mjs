#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import process from 'node:process';
import admin from 'firebase-admin';

const VALID_ROLES = new Set(['owner', 'admin', 'delivery']);

function printHelp() {
  console.log(`
Set ASWA Firebase Auth custom claims.

Usage:
  npm run claims:set -- --uid <firebase_uid> --role <owner|admin|delivery> --business <business_id>

Credentials:
  Set GOOGLE_APPLICATION_CREDENTIALS to the service account JSON path, or
  set FIREBASE_SERVICE_ACCOUNT to a JSON string or JSON file path.

Examples:
  npm run claims:set -- --uid abc123 --role owner --business aswa001
  npm run claims:set -- --uid abc123 --role admin --business aswa001
  npm run claims:set -- --uid abc123 --role delivery --business aswa001
`);
}

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

function loadCredential() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const rawValue = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
    const serviceAccount = rawValue.startsWith('{')
      ? JSON.parse(rawValue)
      : JSON.parse(readFileSync(rawValue, 'utf8'));

    return admin.credential.cert(serviceAccount);
  }

  return admin.credential.applicationDefault();
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  const uid = args.uid;
  const role = args.role;
  const businessId = args.business || args.businessId;

  if (!uid || !role || !businessId) {
    printHelp();
    throw new Error('Debes indicar --uid, --role y --business.');
  }

  if (!VALID_ROLES.has(role)) {
    throw new Error(`Role invalido "${role}". Usa: ${Array.from(VALID_ROLES).join(', ')}.`);
  }

  if (!admin.apps.length) {
    admin.initializeApp({ credential: loadCredential() });
  }

  await admin.auth().setCustomUserClaims(uid, { role, businessId });
  const user = await admin.auth().getUser(uid);

  console.log('Claims asignados correctamente:');
  console.log(JSON.stringify({
    uid: user.uid,
    email: user.email || null,
    claims: user.customClaims || {},
  }, null, 2));
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});

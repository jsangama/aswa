#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import process from 'node:process';
import admin from 'firebase-admin';

const VALID_ROLES = new Set(['owner', 'admin', 'delivery']);

function printHelp() {
  console.log(`
Create or update an ASWA operator in Firebase Auth and assign claims.

Usage:
  npm run operators:upsert -- --email <email> --role <owner|admin|delivery> --business <business_id> [--password <password>] [--name <display_name>] [--username <short_user>]

Credentials:
  Set GOOGLE_APPLICATION_CREDENTIALS to the service account JSON path, or
  set FIREBASE_SERVICE_ACCOUNT to a JSON string or JSON file path.

Examples:
  npm run operators:upsert -- --email dueno@aswa.pe --password "ChangeMe123!" --role owner --business aswa001 --name "Dueno ASWA" --username owner
  npm run operators:upsert -- --email admin@aswa.pe --password "ChangeMe123!" --role admin --business aswa001 --name "Admin ASWA" --username admin
  npm run operators:upsert -- --email delivery1@aswa.pe --password "ChangeMe123!" --role delivery --business aswa001 --name "Delivery 1" --username delivery
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

async function getUserByEmail(email) {
  try {
    return await admin.auth().getUserByEmail(email);
  } catch (error) {
    if (error.code === 'auth/user-not-found') return null;
    throw error;
  }
}

function buildUserPayload({ email, password, name }) {
  const payload = {
    email,
    disabled: false,
  };

  if (password) payload.password = password;
  if (name) payload.displayName = name;

  return payload;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  const email = args.email;
  const password = args.password;
  const role = args.role;
  const businessId = args.business || args.businessId;
  const name = args.name || '';
  const username = args.username || role;

  if (!email || !role || !businessId) {
    printHelp();
    throw new Error('Debes indicar --email, --role y --business.');
  }

  if (!VALID_ROLES.has(role)) {
    throw new Error(`Role invalido "${role}". Usa: ${Array.from(VALID_ROLES).join(', ')}.`);
  }

  if (!admin.apps.length) {
    admin.initializeApp({ credential: loadCredential() });
  }

  let user = await getUserByEmail(email);
  let action = 'updated';

  if (!user) {
    if (!password) {
      throw new Error('El usuario no existe. Indica --password para crearlo.');
    }

    user = await admin.auth().createUser({
      ...buildUserPayload({ email, password, name }),
      emailVerified: false,
    });
    action = 'created';
  } else {
    user = await admin.auth().updateUser(user.uid, buildUserPayload({ email, password, name }));
  }

  const claims = {
    role,
    businessId,
    username,
    ...(name ? { name } : {}),
  };

  await admin.auth().setCustomUserClaims(user.uid, claims);
  const updated = await admin.auth().getUser(user.uid);

  console.log(`Usuario operativo ${action}:`);
  console.log(JSON.stringify({
    uid: updated.uid,
    email: updated.email,
    displayName: updated.displayName || null,
    claims: updated.customClaims || {},
  }, null, 2));
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});

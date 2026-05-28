#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import process from 'node:process';
import admin from 'firebase-admin';

function printHelp() {
  console.log(`
Sync ASWA referral codes from clientes into referral_codes.

Usage:
  npm run referrals:sync -- --business aswa001
  npm run referrals:sync -- --business aswa001 --dry-run yes

Credentials:
  Set GOOGLE_APPLICATION_CREDENTIALS to the service account JSON path, or
  set FIREBASE_SERVICE_ACCOUNT to a JSON string or JSON file path.
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

function normalizeCode(value) {
  return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  const businessId = args.business || args.businessId;
  const dryRun = ['1', 'true', 'yes', 'si'].includes(String(args['dry-run'] || '').toLowerCase());

  if (!businessId) {
    printHelp();
    throw new Error('Debes indicar --business.');
  }

  if (!admin.apps.length) {
    admin.initializeApp({ credential: loadCredential() });
  }

  const db = admin.firestore();
  const snap = await db.collection('clientes')
    .where('businessId', '==', businessId)
    .get();

  let scanned = 0;
  let synced = 0;
  let skipped = 0;
  const batch = db.batch();

  for (const doc of snap.docs) {
    scanned += 1;
    const data = doc.data();
    const code = normalizeCode(data.codigo_referido);

    if (!code || !data.cliente_uid) {
      skipped += 1;
      continue;
    }

    synced += 1;
    const ref = db.collection('referral_codes').doc(code);
    batch.set(ref, {
      businessId,
      codigo: code,
      cliente_uid: data.cliente_uid,
      activo: true,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  }

  if (!dryRun && synced > 0) {
    await batch.commit();
  }

  console.log(JSON.stringify({
    businessId,
    dryRun,
    scanned,
    synced,
    skipped,
  }, null, 2));
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});

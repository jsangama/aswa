#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import process from 'node:process';
import admin from 'firebase-admin';

const BUSINESS_DEFAULT = 'aswa001';
const TARGET_PRODUCTS = {
  sjChicha04: {
    nombre: 'ASWA escolar sanjuanera 0.4L',
    desc: 'Presentacion escolar de 400 ml por seccion.',
    precio: 2.5,
    stock: 99,
    activo: true,
    foto: 'assets/images/products/optimized/san-juan-chicha-400ml.jpg',
    orden: 6,
  },
  sjCombo: {
    nombre: 'Combo escolar sanjuanero',
    desc: 'Juane + chicha 400 ml para la seccion.',
    precio: 4,
    stock: 99,
    activo: true,
    foto: 'assets/images/products/optimized/san-juan-combo-escolar.jpg',
    orden: 7,
  },
  sjJuane: {
    nombre: 'Solo juane escolar',
    desc: 'Juane para la seccion.',
    precio: 2.5,
    stock: 99,
    activo: true,
    foto: 'assets/images/products/optimized/san-juan-juane-escolar.jpg',
    orden: 8,
  },
};

function printHelp() {
  console.log(`
Sync ASWA school prices in Firestore catalogo.

Usage:
  npm run catalogo:sync-school-prices -- --business aswa001
  npm run catalogo:sync-school-prices -- --business aswa001 --dry-run yes

Credentials:
  Set GOOGLE_APPLICATION_CREDENTIALS to the service account JSON path, or
  set FIREBASE_SERVICE_ACCOUNT to a JSON string or JSON file path.

This updates:
  - sjChicha04 => S/ 2.50
  - sjJuane    => S/ 2.50
  - sjCombo    => S/ 4.00
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

function normalizeBusinessId(value) {
  return String(value || BUSINESS_DEFAULT).trim();
}

function buildPayload(id, businessId) {
  const base = TARGET_PRODUCTS[id];
  return {
    ...base,
    businessId,
    business_id: businessId.toLowerCase(),
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  const businessId = normalizeBusinessId(args.business || args.businessId || BUSINESS_DEFAULT);
  const dryRun = ['1', 'true', 'yes', 'si'].includes(String(args['dry-run'] || '').toLowerCase());

  const updates = Object.entries(TARGET_PRODUCTS).map(([id, data]) => ({
    id,
    nombre: data.nombre,
    precio: data.precio,
  }));

  if (dryRun) {
    console.log(JSON.stringify({
      businessId,
      dryRun: true,
      updates,
    }, null, 2));
    return;
  }

  if (!admin.apps.length) {
    admin.initializeApp({ credential: loadCredential() });
  }

  const db = admin.firestore();
  const batch = db.batch();
  const report = {
    businessId,
    dryRun: false,
    updated: [],
    skipped: [],
    missing: [],
  };

  for (const [id] of Object.entries(TARGET_PRODUCTS)) {
    const ref = db.collection('catalogo').doc(id);
    const snap = await ref.get();

    if (snap.exists) {
      const data = snap.data() || {};
      const docBusinessId = String(data.businessId || data.business_id || '').trim();
      if (docBusinessId && docBusinessId.toLowerCase() !== businessId.toLowerCase()) {
        report.skipped.push({ id, reason: `belongs to ${docBusinessId}` });
        continue;
      }
    } else {
      report.missing.push(id);
    }

    batch.set(ref, buildPayload(id, businessId), { merge: true });
    report.updated.push({ id, precio: TARGET_PRODUCTS[id].precio });
  }

  if (report.updated.length) {
    await batch.commit();
  }

  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});

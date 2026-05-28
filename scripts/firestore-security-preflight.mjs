#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import process from 'node:process';

const REQUIRED_FILES = [
  'firestore.rules',
  'firestore.indexes.json',
  'firebase.json',
  'scripts/set-firebase-claims.mjs',
  'scripts/upsert-operator-user.mjs',
  'scripts/sync-referral-codes.mjs',
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
  const firestoreIndexes = readJson('firestore.indexes.json');
  const rules = readFileSync('firestore.rules', 'utf8');
  const index = readFileSync('index.html', 'utf8');

  return [
    ...REQUIRED_FILES.map((file) => check(existsSync(file), `Existe ${file}`)),
    check(packageJson.scripts?.['claims:set'], 'Existe script claims:set'),
    check(packageJson.scripts?.['operators:upsert'], 'Existe script operators:upsert'),
    check(packageJson.scripts?.['referrals:sync'], 'Existe script referrals:sync'),
    check(firebaseJson.firestore?.rules === 'firestore.rules', 'firebase.json apunta a firestore.rules'),
    check(firebaseJson.firestore?.indexes === 'firestore.indexes.json', 'firebase.json despliega indices Firestore'),
    check(Array.isArray(firestoreIndexes.indexes) && firestoreIndexes.indexes.some((idx) => idx.collectionGroup === 'chats'), 'Indices Firestore incluyen chats'),
    check(Array.isArray(firestoreIndexes.indexes) && firestoreIndexes.indexes.some((idx) => idx.collectionGroup === 'pedidos'), 'Indices Firestore incluyen pedidos'),
    check(rules.includes('claimRole()'), 'Reglas validan role por custom claims'),
    check(rules.includes('claimBusinessId()'), 'Reglas validan businessId por custom claims'),
    check(rules.includes('cliente_uid'), 'Reglas protegen pedidos por cliente_uid'),
    check(rules.includes('match /referral_codes/{codigo}'), 'Reglas permiten validar codigos referidos sin leer clientes'),
    check(rules.includes('match /referral_events/{eventId}'), 'Reglas registran eventos de referido para revision admin'),
    check(rules.includes('match /catalogo/{productoId}') && rules.includes('allow read: if true;'), 'Reglas permiten leer catalogo publico'),
    check(rules.includes('match /fcm_tokens/{tokenId}') && rules.includes('allow create, update: if isClientOwnedCreate();'), 'Reglas protegen tokens FCM por cliente'),
    check(rules.includes('match /sugerencias/{sugerenciaId}') && rules.includes('allow create: if isClientOwnedCreate();'), 'Reglas protegen creacion de sugerencias por cliente'),
    check(index.includes('aswaSignInOperativo'), 'La app tiene login operativo con Firebase Auth'),
    check(index.includes('OPERATOR_AUTH_EMAILS'), 'La app soporta mapeo OPERATOR_AUTH_EMAILS'),
    check(index.includes('function _aswaAuthErrorMessage(error)') && index.includes('Authorized domains'), 'Errores Firebase Auth explican dominios autorizados'),
    check(index.includes('function legacyLocalAccessAllowed()') && index.includes('ALLOW_LEGACY_LOCAL_ACCESS'), 'Accesos legacy requieren flag local explicito'),
    check(index.includes('const fallback = legacyLocalAccessAllowed() ? window.CREDENTIALS?.[username] : null;'), 'Fallback owner por CREDENTIALS queda bloqueado en produccion'),
    check(index.includes("if (!legacyLocalAccessAllowed()) return '';") && index.includes('ADMIN_PIN && pin === ADMIN_PIN') && index.includes('DELIVERY_PIN && dlvPinIngresado === DELIVERY_PIN'), 'PIN legacy admin/delivery queda bloqueado en produccion'),
    check(index.includes("col(db, 'usuarios')") && index.includes('legacyAccessBlockedMessage()'), 'Coleccion usuarios legacy queda bloqueada fuera de localhost'),
    check(index.includes('cliente_uid:    window.currentUser?.uid'), 'Pedidos nuevos guardan cliente_uid'),
    check(index.includes("window.db.collection('fcm_tokens')") && index.includes('cliente_uid: window.currentUser?.uid || null'), 'Tokens FCM guardan cliente_uid'),
    check(index.includes("window.db.collection('push_queue').add") && index.includes('businessId: BUSINESS_ID'), 'Push manual guarda businessId'),
    check(index.includes("db.collection('sugerencias').add") && index.includes('businessId: BUSINESS_ID') && index.includes('cliente_uid: window.currentUser?.uid || null'), 'Sugerencias guardan businessId y cliente_uid'),
    check(index.includes("window.db.collection('pagos_culqi').add") && index.includes('businessId: BUSINESS_ID') && index.includes('cliente_uid: window.currentUser?.uid || null'), 'Pagos Culqi legacy guardan businessId y cliente_uid'),
    check(index.includes("window.db.collection('calificaciones').add") && index.includes('businessId: BUSINESS_ID') && index.includes('cliente_uid: window.currentUser?.uid || null'), 'Calificaciones legacy guardan businessId y cliente_uid'),
    check(index.includes("col(db, 'chats'),") && index.includes("wh('businessId', '==', BUSINESS_ID)") && index.includes("orderBy:ob"), 'Panel admin consulta chats filtrados por negocio'),
    check(index.includes("referral_codes"), 'La app usa referral_codes para validar referidos'),
    check(!index.includes("wh('codigo_referido','==',codigoUsado)") && !index.includes("wh('codigo_referido','==',cod)"), 'La app no consulta clientes por codigo_referido'),
    check(index.includes('function abrirDashboardTVSeguro()'), 'Modo TV usa entrada segura'),
    check(index.includes('function abrirDashboardTV()') && index.includes('const sesion = tvSesionOperativa();'), 'Modo TV valida sesion operativa antes de abrir'),
    check(index.includes('TV real es privado') && index.includes('Acceso privado:'), 'Modo TV comunica acceso privado'),
    check(index.includes('function tvPedidoVisibleHoy(p)') && index.includes('pedidos.filter(tvPedidoVisibleHoy)'), 'Modo TV filtra pedidos activos de hoy'),
    check(index.includes('function tvTelefonoSeguro(tel)') && index.includes('tvTelefonoSeguro(p.telefono)'), 'Modo TV oculta telefono completo del cliente'),
    check(index.includes('function obtenerReservaPedido') && index.includes('if (ST.pago === \'Efectivo\') return fail(\'Las reservas solo se aceptan'), 'Reservas bloquean pago en efectivo'),
    check(index.includes('function obtenerPedidoRegalo') && index.includes('if (ST.pago === \'Efectivo\') return fail(\'Los regalos solo se aceptan'), 'Regalos bloquean pago en efectivo'),
    check(index.includes('Pareja') && index.includes('Esposo(a)') && index.includes('Enamorado(a)'), 'Regalos incluyen pareja, esposo(a) y enamorado(a)'),
    check(index.includes('reserva_alertas_cliente') && index.includes('crearAlertasReservaPush') && index.includes("col(db, 'push_queue')"), 'Reservas registran alertas para cliente'),
    check(index.includes('distanciaPlantaCliente()') && index.includes('distancia_planta_m') && index.includes('delivery_carga'), 'Pedidos guardan distancia y carga para delivery'),
    check(rules.includes('match /push_queue/{pushId}') && rules.includes('allow create: if isClientOwnedCreate() || isAdmin(request.resource.data);'), 'Reglas permiten cola de alertas de reserva controlada'),
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

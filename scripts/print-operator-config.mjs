#!/usr/bin/env node

import process from 'node:process';

function printHelp() {
  console.log(`
Print the OPERATOR_AUTH_EMAILS block for js/local-config.js.

Usage:
  npm run operators:config -- --owner <email> --admin <email> --delivery <email>
  npm run operators:config -- --owner <email> --admin <email> --delivery1 <email> --delivery2 <email>

Example:
  npm run operators:config -- --owner dueno@aswa.pe --admin admin@aswa.pe --delivery1 delivery1@aswa.pe --delivery2 delivery2@aswa.pe
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

function escapeJsString(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function sortEntries(entries) {
  const weight = (key) => {
    if (key === 'owner') return 0;
    if (key === 'admin') return 1;
    if (key === 'delivery') return 2;
    if (key.startsWith('delivery')) return 3;
    return 4;
  };

  return entries.sort(([a], [b]) => weight(a) - weight(b) || a.localeCompare(b));
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  const entries = Object.entries(args)
    .filter(([key]) => key !== 'help')
    .filter(([, value]) => String(value || '').trim());

  if (entries.length === 0) {
    printHelp();
    throw new Error('Indica al menos un usuario operativo.');
  }

  console.log('window.ASWA_CONFIG = {');
  console.log('  ...(window.ASWA_CONFIG || {}),');
  console.log('  OPERATOR_AUTH_EMAILS: {');

  for (const [username, email] of sortEntries(entries)) {
    console.log(`    ${username}: '${escapeJsString(email)}',`);
  }

  console.log('  },');
  console.log('};');
}

try {
  main();
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}

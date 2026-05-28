# ASWA Tests

Unit tests for the login helpers and basic order behavior.

## Structure

```text
js/
  login.js
tests/
  helpers/
    setup-dom.js
  login.test.js
  orders.test.js
```

## Commands

```bash
npm test
npm run test:watch
npm run test:coverage
```

## Current Coverage

- `tests/login.test.js`: admin login, delivery login, PIN flow, form transitions, keyboard behavior.
- `tests/orders.test.js`: total calculation behavior.

The Jest coverage gate is configured in `package.json` for `js/login.js`.
# Seguridad operativa

Antes de desplegar reglas Firestore en produccion, revisa `docs/SECURITY_ROLLOUT_CHECKLIST.md`.

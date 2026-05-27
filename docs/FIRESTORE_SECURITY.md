# Firestore Security Rules

Este repositorio ya incluye `firestore.rules` como base de seguridad para producción.

## Importante antes de desplegar

Estas reglas requieren que los usuarios operativos tengan custom claims en Firebase Auth:

- `role`: `owner`, `admin` o `delivery`
- `businessId`: por ejemplo `aswa001`

Los clientes usan sesión anónima y cada pedido nuevo guarda `cliente_uid` para que el cliente solo pueda leer/confirmar sus propios pedidos.

## Flujo esperado

1. El cliente crea un pedido desde la app.
2. La app guarda `cliente_uid` con `window.currentUser.uid`.
3. Dueño/admin/delivery leen pedidos solo si su token tiene el mismo `businessId`.
4. El cliente no puede leer pedidos de otros clientes.

## Despliegue recomendado

No despliegues estas reglas hasta configurar custom claims para usuarios operativos. Si se despliegan sin claims, el panel admin/delivery no podrá leer pedidos.

Cuando los claims estén listos:

```bash
npm run security:preflight -- --business aswa001
firebase deploy --only firestore:rules
```

Si `security:preflight` falla, no despliegues las reglas todavia. Primero crea o corrige los usuarios operativos con `npm run operators:upsert`.

## Próximo paso recomendado

Crear una Cloud Function o script administrativo para asignar claims a usuarios:

```js
await admin.auth().setCustomUserClaims(uid, {
  role: 'owner',
  businessId: 'aswa001'
});
```

Tambien puedes usar la herramienta incluida en este repositorio:

```bash
npm run claims:set -- --uid UID_DEL_USUARIO --role owner --business aswa001
```

Ver guia completa: `docs/FIREBASE_CLAIMS.md`.

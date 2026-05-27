# Firebase Claims para ASWA

Las reglas de Firestore usan custom claims para saber quien puede entrar al panel operativo.

## Claims usados

- `role`: `owner`, `admin` o `delivery`
- `businessId`: normalmente `aswa001`

Con esto:

- El dueno puede ver todo el negocio.
- El admin puede gestionar pedidos del negocio.
- El delivery puede ver pedidos operativos del negocio.
- Los clientes solo ven sus propios pedidos con `cliente_uid`.

## Antes de usar

1. En Firebase Console, abre Authentication > Users.
2. Copia el `uid` del usuario operativo.
3. Descarga una service account desde Project settings > Service accounts.
4. Guarda el JSON fuera del repositorio o con un nombre ignorado por Git, por ejemplo `service-account-aswa.json`.

Nunca subas ese JSON a GitHub.

## Configurar credencial en PowerShell

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\ruta\segura\service-account-aswa.json"
```

Tambien puedes usar:

```powershell
$env:FIREBASE_SERVICE_ACCOUNT="C:\ruta\segura\service-account-aswa.json"
```

## Asignar roles

Dueno:

```bash
npm run claims:set -- --uid UID_DEL_USUARIO --role owner --business aswa001
```

Admin:

```bash
npm run claims:set -- --uid UID_DEL_USUARIO --role admin --business aswa001
```

Delivery:

```bash
npm run claims:set -- --uid UID_DEL_USUARIO --role delivery --business aswa001
```

## Conectar esos usuarios con la app

En `js/local-config.js`, configura el usuario visible del panel con el email real de Firebase Auth:

```js
window.ASWA_CONFIG = {
  ...(window.ASWA_CONFIG || {}),
  OPERATOR_AUTH_EMAILS: {
    owner: 'dueno@tudominio.com',
    admin: 'admin@tudominio.com',
    delivery: 'delivery1@tudominio.com',
  },
};
```

Luego entra al panel usando el usuario corto (`owner`, `admin` o `delivery`) y la contrasena del usuario Firebase Auth.

## Importante despues de asignar claims

El usuario debe cerrar sesion y volver a entrar para que Firebase emita un token nuevo con los claims.

Cuando los usuarios operativos tengan claims, ya puedes desplegar reglas:

```bash
firebase deploy --only firestore:rules --project pedidos-aswa-peru
```

# Checklist de seguridad para activar Firestore

Usa esta guia antes de desplegar `firestore.rules` en produccion. El objetivo es no bloquear el panel de dueno/admin/delivery.

## 1. Preparar credencial privada

Descarga una service account desde Firebase Console > Project settings > Service accounts.

Guardala fuera del repositorio o con un nombre ignorado por Git, por ejemplo:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\ruta\segura\service-account-aswa.json"
```

Nunca subas ese archivo a GitHub.

## 2. Crear usuarios operativos

Dueno:

```bash
npm run operators:upsert -- --email dueno@aswa.pe --password "CambiaEstaClave123!" --role owner --business aswa001 --name "Dueno ASWA" --username owner
```

Admin:

```bash
npm run operators:upsert -- --email admin@aswa.pe --password "CambiaEstaClave123!" --role admin --business aswa001 --name "Admin ASWA" --username admin
```

Delivery:

```bash
npm run operators:upsert -- --email delivery1@aswa.pe --password "CambiaEstaClave123!" --role delivery --business aswa001 --name "Delivery 1" --username delivery1
```

Puedes repetir el comando para `delivery2`, `delivery3`, etc.

## 3. Generar config local de la app

```bash
npm run operators:config -- --owner dueno@aswa.pe --admin admin@aswa.pe --delivery1 delivery1@aswa.pe
```

Copia el bloque generado en `js/local-config.js`. Ese archivo es local y no debe subirse.

## 4. Probar login operativo

Entra a la app y prueba:

- Panel Dueno con usuario `owner`
- Panel Admin con usuario `admin`
- Panel Delivery con usuario `delivery1`

Cada usuario debe cerrar sesion y volver a entrar si acabas de asignar claims.

## 5. Ejecutar preflight

```bash
npm run security:preflight -- --business aswa001
```

Si tienes `GOOGLE_APPLICATION_CREDENTIALS` configurado, tambien validara que existan usuarios reales con claims `owner`, `admin` y `delivery`.

No despliegues reglas si este comando falla.

## 6. Desplegar reglas Firestore

Solo cuando todo lo anterior este OK:

```bash
firebase deploy --only firestore:rules --project pedidos-aswa-peru
```

## 7. Verificacion final

Despues del deploy:

- Cliente puede crear pedido.
- Cliente solo ve su propio pedido.
- Dueno ve todo el negocio.
- Admin ve pedidos del negocio.
- Delivery ve pedidos operativos.
- Modo TV sigue privado y no muestra historial abierto al publico.

Si algo falla, vuelve temporalmente a revisar claims/config antes de cambiar reglas.

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

## Referidos seguros

La app no debe buscar codigos de referido leyendo la coleccion privada `clientes`.
Para eso existen dos colecciones separadas:

- `referral_codes`: permite validar si un codigo existe sin exponer telefono, nombre ni historial del cliente.
- `referral_events`: guarda el uso del codigo como evento pendiente para revision admin/backend.

Esto mantiene `clientes` privado y evita que un cliente modifique bonos o referidos de otra persona.

## Modo TV privado

El Modo TV debe ser una vista operativa, no publica:

- Solo debe abrir con sesion de `owner`, `admin` o `delivery`.
- Debe mostrar pedidos reales de Firebase, no datos inventados.
- Debe filtrar pedidos activos de hoy para evitar exponer historial completo.
- Debe ocultar el telefono completo del cliente en pantalla grande.

`npm run security:preflight` revisa estas protecciones en `index.html` antes de desplegar cambios.

## Accesos legacy bloqueados

Los accesos antiguos por PIN o `window.CREDENTIALS` solo pueden usarse para pruebas locales si `ALLOW_LEGACY_LOCAL_ACCESS` esta activado y la app corre en `localhost`, `127.0.0.1` o `::1`.

En Firebase Hosting y produccion el acceso operativo debe pasar por Firebase Auth/custom claims o por el flujo operativo autorizado. Esto evita que Admin, Delivery, Owner o Modo TV se abran con credenciales estaticas publicadas en el frontend.

La funcion historica `crearUsuariosDefault()` ya no crea usuarios con contrasenas demo desde el navegador. Para crear o actualizar usuarios operativos usa scripts privados con Firebase Admin:

```bash
npm run operators:upsert
npm run claims:set -- --uid UID_DEL_USUARIO --role owner --business aswa001
```

## Reservas y regalos

Las reservas y regalos son pedidos especiales y deben mantenerse con estas reglas de producto:

- No aceptan efectivo; requieren pago anticipado con billetera digital o transferencia.
- La app guarda `es_reserva`, fecha, hora, texto de reserva y metadatos de alerta.
- La app guarda `es_regalo` y `regalo_para` para amigo(a), familiar, pareja, esposo(a) o enamorado(a).
- Las reservas escriben en `push_queue` para que un backend/Cloud Function pueda enviar alertas al cliente.
- Cada pedido guarda distancia desde planta y carga esperada para delivery.

`security:preflight` valida que estas piezas sigan presentes antes de desplegar.

## Colecciones operativas

Ademas de pedidos/clientes, la app usa estas colecciones con reglas explicitas:

- `catalogo`: lectura publica para mostrar productos; escritura solo owner/admin del mismo negocio; cada doc debe llevar `businessId` o `business_id`.
- `negocios`: ficha publica del negocio. Guarda nombre, contacto, horario, ubicacion y enlaces visibles; escritura solo owner/admin del mismo negocio. No guardar secretos aqui.
- `fcm_tokens`: escritura solo del cliente autenticado que registra su token; lectura solo owner/admin.
- `push_queue`: escritura de clientes para alertas propias o de owner/admin para campañas operativas.
- `sugerencias`: lectura publica, creacion ligada al cliente autenticado y moderacion por owner/admin.
- `calificaciones` y `pagos_culqi`: creacion ligada al cliente autenticado, lectura privada o administrativa.

Estas colecciones son necesarias para que el catalogo, las notificaciones y las alertas de reserva funcionen con reglas estrictas.

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

Checklist completo de activacion: `docs/SECURITY_ROLLOUT_CHECKLIST.md`.

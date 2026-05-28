# Firebase Storage para ASWA

## Modo gratis actual

El proyecto esta configurado por defecto con:

```js
STORAGE_MODE: 'whatsapp_manual'
```

Esto permite trabajar sin pagar Firebase Storage:

- El cliente selecciona la captura del comprobante para marcar el pedido.
- La app guarda el pedido en Firestore con `yape_verificacion: "whatsapp_manual"`.
- No se guarda la imagen en Firestore para evitar errores por limite de tamano.
- La app abre WhatsApp para que el cliente adjunte la captura manualmente.
- El panel admin muestra que el pago requiere verificacion manual por WhatsApp.

Cuando el proyecto tenga Firebase Storage activo, se puede cambiar a:

```js
STORAGE_MODE: 'firebase_storage'
```

en `js/app-config.js` o en `js/local-config.js`, y luego desplegar reglas.

La app usa Firebase Storage para:

- Comprobantes de pago: `comprobantes/{businessId}/...`
- Fotos o videos UGC: `ugc/{businessId}/...`
- Evidencias de misiones: `misiones/{businessId}/...`

## Estado requerido en Firebase

Antes de desplegar `storage.rules`, Firebase Storage debe estar inicializado en el proyecto:

1. Abre Firebase Console.
2. Selecciona el proyecto `pedidos-aswa-peru`.
3. Entra a `Storage`.
4. Haz clic en `Get Started`.
5. Elige la ubicacion del bucket y termina la configuracion.

Luego ya se puede ejecutar:

```bash
firebase deploy --only storage --project pedidos-aswa-peru
```

## Seguridad aplicada

`storage.rules` protege las subidas asi:

- El cliente debe estar autenticado, aunque sea con sesion anonima.
- Cada archivo debe incluir metadata `businessId` y `clienteUid`.
- Los comprobantes solo los pueden leer operadores del mismo negocio.
- UGC permite lectura a usuarios autenticados y escritura controlada por cliente.
- Misiones solo las puede leer el cliente dueno u operadores del negocio.
- Se bloquea cualquier ruta no declarada.

## Nota

Si el deploy muestra `Firebase Storage has not been set up`, no es error del codigo. Falta inicializar Storage desde Firebase Console.

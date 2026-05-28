# Firebase Storage para ASWA

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

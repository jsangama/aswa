# Facturacion automatica ASWA

ASWA puede preparar y disparar la emision de Boleta o Factura real desde Firebase Functions, sin guardar Clave SOL en la app.

## Emisor

- RUC: `20600386531`
- Razon social: `SANGAMA INVERSIONES SAC`
- Nombre comercial: `ASWA La Rica Chicha`
- Domicilio fiscal: `Jr. Sargento Lores 425, Morales, San Martin, Peru`

## Cuando se intenta emitir

La Function `emitirComprobanteReal` escucha cambios en `pedidos/{pedidoId}` y solo intenta emitir cuando:

- `comprobante_real_solicitado` es `true`
- `comprobante_real_tipo` es `boleta` o `factura`
- No es pedido de prueba
- El pedido esta listo por una de estas condiciones:
  - `confirmacion_cliente === true`
  - `estado` es `entregado` o `cerrado`
  - `yape_estado` es `aprobado`

Si no hay proveedor configurado, el pedido queda en:

`comprobante_real_estado = pendiente_proveedor`

## Configuracion requerida

Configurar en Firebase Functions:

```bash
firebase functions:secrets:set FACTURACION_API_KEY
```

Variables de entorno del despliegue:

```bash
FACTURACION_API_URL=https://api-del-proveedor/emitir
FACTURACION_SERIE_BOLETA=B001
FACTURACION_SERIE_FACTURA=F001
```

## Payload enviado al proveedor

La Function envia un JSON con:

- `external_id`: id del pedido Firebase
- `tipo_comprobante`: `boleta` o `factura`
- `serie`: `B001` o `F001`
- `emisor`: datos de SANGAMA INVERSIONES SAC
- `cliente`: datos capturados en ASWA
- `pedido`: total, subtotal, delivery, descuento, pago, direccion
- `items`: productos del pedido

## Respuesta esperada

El proveedor puede responder:

```json
{
  "estado": "emitido",
  "serie": "B001",
  "numero": "00000001",
  "pdf_url": "https://...",
  "xml_url": "https://...",
  "cdr_url": "https://...",
  "hash": "..."
}
```

ASWA guarda esos campos en el pedido para que el admin pueda enviarlos al cliente.

## Importante

No guardar Clave SOL en la app web ni en Firebase. La emision automatica debe hacerse con proveedor/API autorizado o infraestructura segura de facturacion electronica.

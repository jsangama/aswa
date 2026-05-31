# Asistente IA para soporte ASWA

El chat de soporte sigue en la app. La IA responde desde Firebase Functions, no desde el HTML publico.

## Donde va cada archivo

- GitHub: `index.html`, `firebase.json`, `functions/package.json`, `functions/index.js` y este documento.
- Firebase: se despliega la funcion `responderChatConIa`.
- OpenAI: la clave API se guarda como secreto de Firebase, nunca en GitHub.

## Respuesta automatica sin Blaze

Mientras Firebase Functions no este activo, `index.html` incluye un asistente basico de preguntas frecuentes. Responde temas comunes desde la app:

- como hacer un pedido
- productos y precios visibles
- pagos y comprobantes
- delivery y direccion
- reservas y regalos
- referidos y descuentos
- nota de venta
- modo prueba

No usa OpenAI ni secretos. Cuando actives Functions, configura:

```js
window.ASWA_CONFIG = {
  AI_SUPPORT_BACKEND_ENABLED: true
};
```

Asi el chat deja de usar el asistente basico y espera la respuesta de Firebase Functions.

## Como funciona

1. El cliente escribe en el chat de soporte.
2. La app guarda el mensaje en Firestore: `chats/{chatId}/mensajes`.
3. Firebase Functions detecta el mensaje nuevo.
4. La funcion llama a OpenAI con instrucciones de soporte ASWA.
5. La respuesta vuelve al mismo chat como `Asistente ASWA`.

## Que sabe responder

La IA tiene una base de conocimiento ASWA dentro de GitHub, en `functions/index.js`, y una version basica dentro de `index.html`.

Puede orientar sobre:

- pasos para hacer un pedido
- productos y precios visibles en la app
- zonas de delivery: Morales, Tarapoto, Banda de Shilcayo y recojo en local
- pagos digitales, efectivo y comprobantes
- reservas, regalos y pedidos programados
- nota de venta despues de entrega/confirmacion
- seguimiento del pedido cuando el delivery lo marque en camino
- referidos, cupones y descuentos visibles
- modo prueba separado de pedidos reales

Tambien tiene limites para proteger el negocio:

- no inventa estados reales de pedidos
- no aprueba pagos por su cuenta
- no promete descuentos, reembolsos ni cambios definitivos
- no revela accesos, claves ni informacion privada de admin/delivery
- cuando hace falta revision humana, pide telefono y detalle del caso

## Activar en Firebase

Primero guarda la clave de OpenAI como secreto:

```bash
firebase functions:secrets:set OPENAI_API_KEY --project pedidos-aswa-peru
```

Luego despliega solo Functions:

```bash
firebase deploy --only functions --project pedidos-aswa-peru
```

## Cambiar modelo

Por defecto usa `gpt-4.1-mini`. Si quieres cambiarlo, configura la variable `OPENAI_MODEL` en el entorno de Functions.

## Seguridad

- No pongas `OPENAI_API_KEY` en `index.html`, `js/app-config.js` ni archivos de GitHub.
- Si quieres pausar la IA en un chat especifico, marca el documento `chats/{chatId}` con:

```json
{
  "ai_responder_disabled": true
}
```

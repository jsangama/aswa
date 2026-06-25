# Asistente IA para soporte ASWA

El chat de soporte sigue en la app. La IA responde desde Firebase Functions, no desde el HTML publico.

## Donde va cada archivo

- GitHub: `index.html`, `firebase.json`, `functions/package.json`, `functions/index.js` y este documento.
- Firebase: se despliega la funcion `responderChatConIa`.
- OpenAI: la clave API se guarda como secreto de Firebase, nunca en GitHub.

## Respuesta automatica sin Blaze

Mientras Firebase Functions no este activo, `index.html` incluye un asistente basico inteligente. No usa OpenAI ni secretos, pero combina respuestas especificas con fichas de conocimiento del app y busqueda en el texto visible de la pagina.

Responde temas comunes desde la app:

- como hacer un pedido
- productos y precios visibles
- pagos y comprobantes
- delivery y direccion
- reservas y regalos
- referidos y descuentos
- nota de venta
- modo prueba

La prioridad es responder primero la consulta especifica del cliente. Por ejemplo, si el mensaje dice "envio a agencia nacional", debe responder sobre agencia/delivery antes que mostrar una guia general de pedido.

Si el cliente pregunta si ya puede responder lo mencionado hasta ahora, debe confirmar que orienta sobre los temas cargados en la app y aclarar sus limites: no inventa estados reales de pedidos, pagos aprobados, stock ni decisiones del negocio.

Cuando actives Functions, configura:

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

- historia, origen y significado de ASWA La Rica Chicha
- pasos para hacer un pedido
- ejemplos de pedido para que el cliente copie y complete
- recomendacion de presentacion segun necesidad
- productos y precios visibles en la app
- catalogo general y Programa Institucional privado con codigo
- zonas de delivery: Morales, Tarapoto, Banda de Shilcayo y recojo en local
- pagos digitales, efectivo y comprobantes
- reservas, regalos y pedidos programados
- nota de venta para pedidos reales despues de entrega/confirmacion
- seguimiento del pedido cuando el delivery lo marque en camino
- referidos, cupones, misiones, concursos, sugerencias, descuentos y bonos visibles
- modo prueba separado de pedidos reales

## Historia de marca

ASWA La Rica Chicha comenzo en enero de 2004 en San Martin, en el corazon de la Amazonia peruana.

Nacio como una preparacion familiar artesanal, hecha en casa para acompanar comidas, recibir visitas y compartir reuniones. Al inicio se vendia en pequenas cantidades como ingreso complementario del hogar.

Con los anos se perfeccionaron aroma, sabor, textura, fermentacion, materias primas, higiene y presentacion. La identidad ASWA nace de la palabra ancestral "Aswa", usada para referirse a la chicha tradicional, junto a la promesa "La Rica Chicha".

Hoy representa mas de 20 anos de esfuerzo familiar, perseverancia, cultura amazonica y orgullo de San Martin. Su mision es llevar el autentico sabor de la Amazonia peruana a cada hogar, preservando una tradicion de generacion en generacion.

Tambien tiene limites para proteger el negocio:

- no inventa estados reales de pedidos
- no aprueba pagos por su cuenta
- no promete descuentos, bonos, reembolsos ni cambios definitivos
- no revela accesos, claves ni informacion privada de admin/delivery
- cuando hace falta revision humana, pide telefono y detalle del caso

## Estilo de respuesta para clientes

El asistente debe comportarse como guia en directo, no solo como preguntas frecuentes.

Ejemplo de orientacion:

```text
Te guio: elige 1 chicha 3L, coloca tu telefono, nombre y direccion con referencia, selecciona Morales, elige Yape o efectivo, revisa el resumen y toca enviar.
Ejemplo: "Quiero 1 chicha 3L para Morales, pago con Yape, mi direccion es Jr. ... y mi referencia es ...".
```

Tambien puede recordar beneficios:

- si tienes codigo referido, agregalo antes de enviar
- revisa cupones o descuentos activos
- participa en misiones de redes sociales
- envia sugerencias para optar por premios
- participa en concursos cuando esten activos

## Nota de Venta

Todo pedido real debe terminar con Nota de Venta. La app no debe generar la venta final apenas se envia el pedido; primero debe entregarse y el cliente debe confirmar la recepcion. Asi se evita mezclar pedidos pendientes con ventas reales.

## Estructura Comercial

El catalogo general es visible para todos.

- Chicha ASWA 400 ml: S/ 2.50 por unidad, venta minima 1 unidad.
- Chicha ASWA 2L, 3L y 4L se mantienen visibles.
- El precio del producto no incluye delivery.
- Delivery: Morales S/ 3.00, Tarapoto S/ 4.00 y La Banda de Shilcayo S/ 5.00.

El Programa Institucional ASWA es privado y requiere codigo de acceso.

- No debe mostrar productos institucionales, precios, packs ni timbos al publico general.
- Mensaje para no autorizados: "Esta seccion es exclusiva para instituciones educativas, refrigerios y kioscos escolares. Solicite informacion o una visita comercial para obtener acceso."
- Pack Escolar ASWA 400 ml: 15 botellas por S/ 30.00, costo unitario S/ 2.00.
- Precio sugerido al cliente final: S/ 3.00 por botella.
- Venta estimada: 15 x S/ 3.00 = S/ 45.00.
- Ganancia estimada: S/ 15.00 por pack.
- Timbo ASWA 20L: recarga S/ 50.00 o timbo nuevo con envase S/ 70.00.
- Mensaje sugerido de WhatsApp: "Hola, deseo cotizar Chicha ASWA para refrigerios escolares de mi institucion educativa o kiosco."

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

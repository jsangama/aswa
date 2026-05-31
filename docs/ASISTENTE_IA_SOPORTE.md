# Asistente IA para soporte ASWA

El chat de soporte sigue en la app. La IA responde desde Firebase Functions, no desde el HTML publico.

## Donde va cada archivo

- GitHub: `index.html`, `firebase.json`, `functions/package.json`, `functions/index.js` y este documento.
- Firebase: se despliega la funcion `responderChatConIa`.
- OpenAI: la clave API se guarda como secreto de Firebase, nunca en GitHub.

## Como funciona

1. El cliente escribe en el chat de soporte.
2. La app guarda el mensaje en Firestore: `chats/{chatId}/mensajes`.
3. Firebase Functions detecta el mensaje nuevo.
4. La funcion llama a OpenAI con instrucciones de soporte ASWA.
5. La respuesta vuelve al mismo chat como `Asistente ASWA`.

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

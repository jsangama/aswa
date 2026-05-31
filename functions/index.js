import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { defineSecret } from 'firebase-functions/params';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';

initializeApp();

const db = getFirestore();
const OPENAI_API_KEY = defineSecret('OPENAI_API_KEY');
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

const ASWA_AGENT_INSTRUCTIONS = `
Eres el asistente de soporte de ASWA La Rica Chicha en Morales, San Martin, Peru.
Responde en espanol claro, amable y breve.
Ayudas con pedidos, zonas, pagos, comprobantes, horarios, delivery, notas de venta y seguimiento.
No inventes datos de estado de pedido, pagos aprobados, stock, precios especiales ni tiempos exactos si no aparecen en el chat.
Si el cliente necesita accion humana, pide telefono, direccion o detalle y di que el equipo ASWA lo revisara.
No prometas reembolsos, descuentos o cambios definitivos sin revision del negocio.
`.trim();

function cleanText(value, max = 1200) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function shouldAnswer(message, chat) {
  if (!message || message.de !== 'cliente') return false;
  if (message.ai_omit === true) return false;
  if (chat?.ai_responder_disabled === true) return false;
  return cleanText(message.texto, 20).length > 0;
}

async function getRecentMessages(chatId) {
  const snap = await db
    .collection('chats')
    .doc(chatId)
    .collection('mensajes')
    .orderBy('fecha', 'desc')
    .limit(12)
    .get();

  return snap.docs
    .map(doc => doc.data())
    .reverse()
    .map(msg => `${msg.de === 'cliente' ? 'Cliente' : 'ASWA'}: ${cleanText(msg.texto, 500)}`)
    .join('\n');
}

async function createAiReply({ chat, chatId }) {
  const history = await getRecentMessages(chatId);
  const input = [
    {
      role: 'developer',
      content: ASWA_AGENT_INSTRUCTIONS
    },
    {
      role: 'user',
      content:
        `Datos del chat:\n` +
        `Nombre: ${cleanText(chat.nombre, 80) || 'Cliente'}\n` +
        `Telefono: ${cleanText(chat.telefono, 20) || 'No indicado'}\n` +
        `Negocio: ASWA La Rica Chicha\n\n` +
        `Conversacion reciente:\n${history}\n\n` +
        `Responde al ultimo mensaje del cliente.`
    }
  ];

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY.value()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input,
      max_output_tokens: 260,
      temperature: 0.3
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenAI API ${response.status}: ${detail.slice(0, 300)}`);
  }

  const data = await response.json();
  return cleanText(data.output_text, 900) ||
    'Gracias por escribirnos. El equipo ASWA revisara tu mensaje y te respondera pronto.';
}

export const responderChatConIa = onDocumentCreated(
  {
    document: 'chats/{chatId}/mensajes/{mensajeId}',
    region: 'us-central1',
    secrets: [OPENAI_API_KEY],
    timeoutSeconds: 60,
    memory: '256MiB',
    maxInstances: 3
  },
  async event => {
    const message = event.data?.data();
    const { chatId, mensajeId } = event.params;
    const chatRef = db.collection('chats').doc(chatId);
    const chatSnap = await chatRef.get();
    const chat = chatSnap.data() || {};

    if (!shouldAnswer(message, chat)) return;

    const originalRef = chatRef.collection('mensajes').doc(mensajeId);
    await originalRef.set({
      ai_estado: 'procesando',
      ai_started_at: FieldValue.serverTimestamp()
    }, { merge: true });

    try {
      const reply = await createAiReply({ chat, chatId });
      await chatRef.collection('mensajes').add({
        de: 'negocio',
        autor: 'ia',
        nombre: 'Asistente ASWA',
        texto: reply,
        fecha: FieldValue.serverTimestamp(),
        leido_cliente: false,
        leido_negocio: true
      });
      await chatRef.set({
        ultimo_msg: reply,
        ultimo_de: 'negocio',
        ultimo_autor: 'ia',
        actualizado_en: FieldValue.serverTimestamp(),
        no_leidos_cliente: FieldValue.increment(1),
        ai_last_reply_at: FieldValue.serverTimestamp()
      }, { merge: true });
      await originalRef.set({
        ai_estado: 'respondido',
        ai_finished_at: FieldValue.serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('responderChatConIa:', error);
      await originalRef.set({
        ai_estado: 'error',
        ai_error: cleanText(error.message, 300),
        ai_finished_at: FieldValue.serverTimestamp()
      }, { merge: true });
    }
  }
);

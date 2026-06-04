const fs = require('fs');
const path = require('path');

function loadAssistantReply() {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const start = html.indexOf('const ASWA_SUPPORT_KNOWLEDGE = [');
  const end = html.indexOf('async function _chatResponderAutomatico', start);

  if (start < 0 || end < 0) {
    throw new Error('No se encontro el bloque del asistente de soporte');
  }

  const code = html.slice(start, end);
  return new Function(`${code}; return _chatRespuestaAutomatica;`)();
}

function loadAssistantApi() {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const start = html.indexOf('const ASWA_SUPPORT_KNOWLEDGE = [');
  const end = html.indexOf('async function _chatResponderAutomatico', start);

  if (start < 0 || end < 0) {
    throw new Error('No se encontro el bloque del asistente de soporte');
  }

  const code = html.slice(start, end);
  const api = new Function(`const __aswaStorage = new Map();
  var _chatId = '';
  var __listeners = [];
  var document = {
    getElementById: () => null,
    querySelector: () => null,
    addEventListener: (type) => __listeners.push(type)
  };
  var window = { FB: null, ASWA_CONFIG: {} };
  const localStorage = {
    setItem: (key, value) => __aswaStorage.set(key, String(value)),
    getItem: (key) => __aswaStorage.has(key) ? __aswaStorage.get(key) : null,
    removeItem: (key) => __aswaStorage.delete(key),
    clear: () => __aswaStorage.clear()
  };
  ${code}; return {
    reply: _chatRespuestaAutomatica,
    process: _chatPedidoProcesarTexto,
    conversational: _chatRespuestaConversacional,
    hasUnlockHelper: () => typeof _chatDesbloquearEntrada === 'function',
    hasGlobalUnlockHelper: () => typeof window._chatDesbloquearEntrada === 'function',
    hasInputWatchdog: () => !!window._chatInputWatchdog && __listeners.includes('pointerdown') && __listeners.includes('keydown'),
    attach: () => { _chatPedidoDraft.comprobanteAdjunto = true; return _chatPedidoSiguientePregunta(_chatPedidoDraft); },
    dropMemory: () => { _chatPedidoDraft = null; },
    setCache: (mensajes) => { _chatMensajesCache = mensajes; },
    reset: () => { _chatPedidoDraft = null; _chatComprobanteData = null; _chatMensajesCache = []; localStorage.clear(); }
  };`)();
  api.sourceContains = (needle) => html.includes(needle);
  return api;
}

describe('support assistant replies', () => {
  const reply = loadAssistantReply();

  test('explains the San Juan school campaign with audience, minimum, prices and delivery', () => {
    const text = reply('como funciono o en que consiste la campana san juanera');

    expect(text).toContain('centros educativos');
    expect(text).toContain('Pedido minimo');
    expect(text).toContain('chicha ASWA 400 ml S/ 2');
    expect(text).toContain('solo juane S/ 2.00');
    expect(text).toContain('combo juane + chicha 400 ml S/ 3.50');
    expect(text).toContain('No cobramos delivery');
    expect(text).not.toContain('Productos principales');
  });

  test('answers note of sale questions even with typos', () => {
    const text = reply('todo lospedidos reales tien nocta de venta');

    expect(text).toContain('todo pedido real debe tener Nota de Venta');
    expect(text).toContain('confirma la recepcion');
    expect(text).not.toContain('Te guio paso a paso');
  });

  test('answers capability questions without falling back to generic help', () => {
    const text = reply('yapuedes responde a todo lo que te mencione en hasta ahora');

    expect(text).toContain('puedo responder con coherencia');
    expect(text).toContain('campana San Juan');
    expect(text).toContain('Nota de Venta');
    expect(text).toContain('historia de ASWA');
    expect(text).not.toContain('Escribe, por ejemplo');
  });

  test('keeps regular product pricing separate from campaign explanation', () => {
    const text = reply('cuanto cuesta la chicha 3l');

    expect(text).toContain('Chicha ASWA 3L S/ 13');
    expect(text).not.toContain('centros educativos');
  });

  test('answers a short price question with current product prices', () => {
    const text = reply('CUANTO ESTA LA CHICHA');

    expect(text).toContain('Chicha ASWA 2L S/ 9');
    expect(text).toContain('Chicha ASWA 3L S/ 13');
    expect(text).toContain('Chicha ASWA Familiar 4L S/ 15');
    expect(text).toContain('Delivery');
    expect(text).not.toContain('Soy tu guia ASWA');
    expect(text).not.toContain('Escribe, por ejemplo');
  });

  test('explains ASWA gallon presentations without converting as a measurement', () => {
    const text = reply('QUIERO 3 GALONES');

    expect(text).toContain('Galon ASWA 2L S/ 9');
    expect(text).toContain('Galon Familiar ASWA 4L S/ 15');
    expect(text).toContain('Chicha ASWA 3L S/ 13');
    expect(text).not.toContain('Soy tu guia ASWA');
  });

  test('answers agency delivery specifically instead of a generic first-order guide', () => {
    const text = reply('como funciona el envio a agencia nacional');

    expect(text).toContain('agencia nacional');
    expect(text).toContain('flete destino');
    expect(text).not.toContain('Si es tu primera vez');
  });

  test('answers ASWA history and meaning', () => {
    const text = reply('que significa aswa y cuantos anos tiene');

    expect(text).toContain('enero de 2004');
    expect(text).toContain('"Aswa"');
    expect(text).toContain('mas de 20 anos');
  });

  test('guides a complete chat order before registration', () => {
    const api = loadAssistantApi();
    api.reset();

    expect(api.process('quiero 3 chichas de 4 litros')).toContain('Subtotal S/ 45.00');
    expect(api.process('JR. JIMENES PIMENTEL 452 TARAPOTO')).toContain('Cual es tu numero de telefono');
    expect(api.process('950845067')).toContain('Cual es tu nombre completo');
    expect(api.process('JOSUE SANGAMA PEZO')).toContain('Cual metodo de pago usaras');
    expect(api.process('yape')).toContain('Total a pagar: S/ 49.00');

    const ready = api.attach();
    expect(ready).toContain('Resumen listo');
    expect(ready).toContain('3 x Chicha ASWA Familiar 4L');
    expect(ready).toContain('Pago: Yape, comprobante adjunto');
    expect(ready).toContain('CONFIRMAR PEDIDO');
  });

  test('asks cash amount and calculates change for chat order', () => {
    const api = loadAssistantApi();
    api.reset();

    api.process('quiero 3 chichas de 4 litros');
    api.process('JR. JIMENES PIMENTEL 452 TARAPOTO');
    api.process('950845067');
    api.process('JOSUE SANGAMA PEZO');
    expect(api.process('efectivo')).toContain('Con cuanto vas a pagar');

    const ready = api.process('50 soles');
    expect(ready).toContain('Resumen listo');
    expect(ready).toContain('Total S/ 49.00');
    expect(ready).toContain('vuelto S/ 1.00');
  });

  test('accepts confirmado as final chat order confirmation', () => {
    const api = loadAssistantApi();
    api.reset();

    api.process('quiero 1 galon de 2 litros');
    api.process('JR. JIMENES PIMENTEL 521 TARAPOTO');
    api.process('950845067');
    api.process('JOSUE SANGAMA PEZO');
    api.process('efectivo');
    api.process('20');

    const confirmation = api.process('CONFIRMADO');
    expect(confirmation).toEqual({ registrar:true, texto:'Estoy registrando tu pedido en ASWA...' });
  });

  test('accepts short ok after the order summary is ready', () => {
    const api = loadAssistantApi();
    api.reset();

    api.process('quiero 2 galones de 2 litros');
    api.process('Jr. San Martin 524 Banda de Shilcayo');
    api.process('950845067');
    api.process('JOSUE SANGAMA PEZO');
    api.process('efectivo');
    api.process('50');

    const confirmation = api.process('ok');
    expect(confirmation).toEqual({ registrar:true, texto:'Estoy registrando tu pedido en ASWA...' });
  });

  test('recovers the ready order from the last chat summary when memory was lost', () => {
    const api = loadAssistantApi();
    api.reset();
    api.setCache([
      {
        de: 'negocio',
        texto: 'Resumen listo: 1 x Chicha ASWA 2L. Total S/ 13.00. Direccion: JR. JIMENES PIMENTEL 521. Cliente: JOSUE SANGAMA PEZO, 950845067. Pago: Efectivo con S/ 20.00; vuelto S/ 7.00. Escribe CONFIRMAR PEDIDO para registrarlo.'
      }
    ]);
    api.dropMemory();

    const confirmation = api.process('CONFIRMO');
    expect(confirmation).toEqual({ registrar:true, texto:'Estoy registrando tu pedido en ASWA...' });
  });

  test('treats natural follow-up wording as order confirmation', () => {
    const api = loadAssistantApi();
    api.reset();
    api.setCache([
      {
        de: 'negocio',
        texto: 'Resumen listo: 1 x Chicha ASWA 2L. Total S/ 13.00. Direccion: JR. JIMENES PIMENTEL 521. Cliente: JOSUE SANGAMA PEZO, 950845067. Pago: Efectivo con S/ 20.00; vuelto S/ 7.00. Escribe CONFIRMAR PEDIDO para registrarlo.'
      }
    ]);
    api.dropMemory();

    const confirmation = api.process('pero ya te dije');
    expect(confirmation).toEqual({ registrar:true, texto:'Estoy registrando tu pedido en ASWA...' });
  });

  test('answers registered-order follow-up from the last success message', () => {
    const api = loadAssistantApi();
    api.reset();
    api.setCache([
      {
        de: 'negocio',
        texto: 'OK, tu pedido fue registrado. Codigo interno: ABCD1234. Total S/ 13.00. El equipo ASWA lo revisara y el seguimiento aparecera cuando el deliverista lo tome.'
      }
    ]);

    const text = api.process('ya lo registraste mi pedido');
    expect(text).toContain('tu pedido ya fue registrado');
    expect(text).toContain('ABCD1234');
    expect(text).not.toContain('Para hacer un pedido');
  });

  test('does not fall back to the long guide for a stuck follow-up', async () => {
    const api = loadAssistantApi();
    api.reset();

    const text = await api.conversational('pero ya te dije');
    expect(text).toContain('No encuentro un resumen pendiente');
    expect(text).not.toContain('Para hacer un pedido');
  });

  test('exposes chat input unlock helper for recovery', () => {
    const api = loadAssistantApi();
    expect(api.sourceContains('instalarRescateInputChat')).toBe(true);
    expect(api.sourceContains('window._chatEarlyInputRescue')).toBe(true);
    expect(api.hasUnlockHelper()).toBe(true);
    expect(api.hasGlobalUnlockHelper()).toBe(true);
    expect(api.hasInputWatchdog()).toBe(true);
    expect(api.sourceContains('function _chatInsertarTextoEmergencia')).toBe(true);
  });

  test('client chat messages bypass backend and use local reply path', () => {
    const api = loadAssistantApi();
    expect(api.sourceContains('ai_omit:true')).toBe(true);
    expect(api.sourceContains('const espera = 350')).toBe(true);
  });

  test('repairs an unanswered latest customer message on render', () => {
    const api = loadAssistantApi();
    expect(api.sourceContains('function _chatRepararMensajeClientePendiente')).toBe(true);
    expect(api.sourceContains('_chatRepararMensajeClientePendiente(_chatMensajesCache)')).toBe(true);
  });

  test('includes a customer chat reset for stuck histories', () => {
    const api = loadAssistantApi();
    expect(api.sourceContains('reiniciarChatCliente')).toBe(true);
    expect(api.sourceContains('cliente_chat_reset_at')).toBe(true);
    expect(api.sourceContains('_chatFiltrarMensajesVisibles')).toBe(true);
    expect(api.sourceContains('Chat reiniciado. Ya puedes escribir de nuevo.')).toBe(true);
  });

  test('shows sent chat messages locally before the Firebase snapshot returns', () => {
    const api = loadAssistantApi();
    expect(api.sourceContains('function _chatMostrarMensajeLocal')).toBe(true);
    expect(api.sourceContains('_chatMostrarMensajeLocal(localMsg)')).toBe(true);
    expect(api.sourceContains('local_cliente_')).toBe(true);
    expect(api.sourceContains('local_negocio_')).toBe(true);
  });

  test('continues a saved chat order after local memory was lost', () => {
    const api = loadAssistantApi();
    api.reset();

    api.process('quiero 1 galon de 2 litros');
    api.process('JR. JIMENES PIMENTEL 521 TARAPOTO');
    api.process('950845067');
    api.process('JOSUE SANGAMA PEZO');
    api.process('efectivo');
    api.process('20');
    api.dropMemory();

    const confirmation = api.process('CONFIRMADO');
    expect(confirmation).toEqual({ registrar:true, texto:'Estoy registrando tu pedido en ASWA...' });
  });

  test('rejects unsupported banks and lists available payment options', () => {
    const api = loadAssistantApi();
    api.reset();

    api.process('quiero 1 chicha de 2 litros');
    api.process('JR. JIMENES PIMENTEL 452 TARAPOTO');
    api.process('950845067');
    api.process('JOSUE SANGAMA PEZO');

    const text = api.process('quiero pagar con BCP');
    expect(text).toContain('Ese banco no lo tenemos disponible');
    expect(text).toContain('Interbank');
    expect(text).toContain('BBVA');
    expect(text).toContain('Banbif');
  });

  test('registers gallon 2 liter wording as the 2L product', () => {
    const api = loadAssistantApi();
    api.reset();

    const text = api.process('QUIERO EL PEDIDO DE DE 2 GALONES DE 2 LITROS');
    expect(text).toContain('Te registro 2 x Chicha ASWA 2L');
    expect(text).toContain('S/ 18.00');
    expect(text).toContain('A que direccion seria el pedido');
  });

  test('registers familiar gallon wording as the 4L product', () => {
    const api = loadAssistantApi();
    api.reset();

    const text = api.process('quiero hacer pedido de 2 galones familiares');
    expect(text).toContain('Te registro 2 x Chicha ASWA Familiar 4L');
    expect(text).toContain('S/ 30.00');
    expect(text).toContain('A que direccion seria el pedido');
  });

  test('asks which ASWA gallon presentation when customer does not specify liters', () => {
    const api = loadAssistantApi();
    api.reset();

    const text = api.process('quiero hacer pedido de 2 galones');
    expect(text).toContain('galon ASWA de 2 litros');
    expect(text).toContain('galon familiar de 4 litros');
  });

  test('explains bidon as 20 liter product with prices', () => {
    const text = reply('cuanto cuesta el bidon');

    expect(text).toContain('bidon ASWA es de 20 litros');
    expect(text).toContain('5 familiares de 4L');
    expect(text).toContain('5 x S/ 15 = S/ 75');
    expect(text).toContain('recarga con bidon vacio cuesta S/ 70');
    expect(text).toContain('envase nuevo retornable cuesta S/ 90');
    expect(text).toContain('no se usan 5 envases de 4L');
    expect(text).toContain('promo escolar San Juan queda con precio especial');
    expect(text).toContain('Puedes pagarlo con efectivo');
  });

  test('registers bidon recarga as 20 liter order and accepts cash', () => {
    const api = loadAssistantApi();
    api.reset();

    const first = api.process('quiero 1 bidon recarga');
    expect(first).toContain('1 x Bidon ASWA 20L');
    expect(first).toContain('S/ 70.00');
    expect(first).toContain('El bidon es de 20 litros');

    api.process('JR. JIMENES PIMENTEL 452 TARAPOTO');
    api.process('950845067');
    api.process('JOSUE SANGAMA PEZO');
    const cash = api.process('efectivo');
    expect(cash).toContain('Con cuanto vas a pagar');
  });

  test('registers bidon with new container at 90 soles', () => {
    const api = loadAssistantApi();
    api.reset();

    const text = api.process('quiero 1 bidon con envase nuevo');
    expect(text).toContain('1 x Bidon ASWA 20L con envase nuevo');
    expect(text).toContain('S/ 90.00');
  });
});

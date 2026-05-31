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
  return new Function(`${code}; return {
    reply: _chatRespuestaAutomatica,
    process: _chatPedidoProcesarTexto,
    attach: () => { _chatPedidoDraft.comprobanteAdjunto = true; return _chatPedidoSiguientePregunta(_chatPedidoDraft); },
    reset: () => { _chatPedidoDraft = null; _chatComprobanteData = null; }
  };`)();
}

describe('support assistant replies', () => {
  const reply = loadAssistantReply();

  test('explains the San Juan school campaign with audience, minimum, prices and delivery', () => {
    const text = reply('como funciono o en que consiste la campana san juanera');

    expect(text).toContain('centros educativos');
    expect(text).toContain('Pedido minimo');
    expect(text).toContain('chicha ASWA 400 ml S/ 2');
    expect(text).toContain('solo juane S/ 1.50');
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
});

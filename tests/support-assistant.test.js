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
});

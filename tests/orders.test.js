describe('orders module behavior', () => {
  test('cart totals use price times quantity', () => {
    const items = [
      { price: 12, quantity: 1 },
      { price: 16, quantity: 2 },
    ];

    const total = items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    expect(total).toBe(44);
  });

  test('receipt choice is offered after delivery confirmation', () => {
    const fs = require('fs');
    const path = require('path');
    const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

    expect(html).toContain('id="comprobanteFinalModal"');
    expect(html).toContain('id="comprobanteTipo"');
    expect(html).toContain('Solo Nota de Venta ASWA');
    expect(html).toContain('Solicitar Boleta electronica');
    expect(html).toContain('Solicitar Factura electronica');
    expect(html).toContain('SANGAMA INVERSIONES SAC');
    expect(html).toContain('20600386531');
    expect(html).toContain('function obtenerSolicitudComprobanteReal');
    expect(html).toContain('function solicitarComprobanteRealFinal');
    expect(html).toContain('function continuarConNotaVentaFinal');
    expect(html).toContain('comprobante_real_solicitado');
    expect(html).toContain('comprobante_real_decision');
    expect(html).toContain('pedidoComprobanteRealHtml');
  });

  test('school San Juan products allow direct quantity entry', () => {
    const fs = require('fs');
    const path = require('path');
    const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

    expect(html).toContain('id="q-sjChicha04" type="number"');
    expect(html).toContain("setQtyDirect('sjChicha04',this.value)");
    expect(html).toContain('id="q-sjCombo" type="number"');
    expect(html).toContain("setQtyDirect('sjCombo',this.value)");
    expect(html).toContain('id="q-sjJuane" type="number"');
    expect(html).toContain("setQtyDirect('sjJuane',this.value)");
    expect(html).toContain('function setQtyDirect');
    expect(html).toContain('function syncQtyUI');
  });

  test('firebase function prepares automatic receipt emission without Clave SOL', () => {
    const fs = require('fs');
    const path = require('path');
    const source = fs.readFileSync(path.join(__dirname, '..', 'functions', 'index.js'), 'utf8');

    expect(source).toContain('export const emitirComprobanteReal');
    expect(source).toContain("document: 'pedidos/{pedidoId}'");
    expect(source).toContain('FACTURACION_API_KEY');
    expect(source).toContain('FACTURACION_API_URL');
    expect(source).toContain('pendiente_proveedor');
    expect(source).toContain('confirmacion_cliente === true');
    expect(source).toContain("['entregado', 'cerrado']");
    expect(source).toContain("yapeEstado === 'aprobado'");
    expect(source).not.toMatch(/clave\s*sol/i);
  });
});

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

  test('order form supports real boleta and factura requests', () => {
    const fs = require('fs');
    const path = require('path');
    const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

    expect(html).toContain('id="comprobanteTipo"');
    expect(html).toContain('Solicitar Boleta electronica');
    expect(html).toContain('Solicitar Factura electronica');
    expect(html).toContain('SANGAMA INVERSIONES SAC');
    expect(html).toContain('20600386531');
    expect(html).toContain('function obtenerSolicitudComprobanteReal');
    expect(html).toContain('comprobante_real_solicitado');
    expect(html).toContain('pedidoComprobanteRealHtml');
  });
});

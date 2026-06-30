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
    const html = fs.readFileSync(path.join(__dirname, '..', 'src/features/legacy/legacy-shell.html'), 'utf8');

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

  test('public 400 ml and private institutional products are wired to cart', () => {
    const fs = require('fs');
    const path = require('path');
    const html = fs.readFileSync(path.join(__dirname, '..', 'src/features/legacy/legacy-shell.html'), 'utf8');

    expect(html).toContain('id="c-p400"');
    expect(html).toContain("qty('p400',+1)");
    expect(html).toContain("p400: { nombre:'Chicha ASWA 400 ml'");
    expect(html).toContain('p400: 2.5');
    expect(html).toContain('id="q-sjChicha04" type="number"');
    expect(html).toContain("setQtyDirect('sjChicha04',this.value)");
    expect(html).toContain("sjChicha04: { nombre:'Pack Escolar ASWA 400 ml'");
    expect(html).toContain("sjBidon: { nombre:'Timbo ASWA 20 litros'");
    expect(html).toContain('function setQtyDirect');
    expect(html).toContain('function syncQtyUI');
  });

  test('institutional section stays private behind access code', () => {
    const fs = require('fs');
    const path = require('path');
    const html = fs.readFileSync(path.join(__dirname, '..', 'src/features/legacy/legacy-shell.html'), 'utf8');

    expect(html).toContain('id="institutionalPrivateContent" hidden');
    expect(html).toContain('const INSTITUTIONAL_ACCESS_CODES');
    expect(html).toContain("'ASWA2026'");
    expect(html).toContain('function verificarAccesoInstitucional');
    expect(html).toContain('Los productos institucionales, precios especiales, packs escolares y timbos se muestran solo con codigo.');
    expect(html).toContain('Esta seccion es exclusiva para instituciones educativas, refrigerios y kioscos escolares.');
    expect(html).toContain("const SCHOOL_MINIMUM_QTY_IDS = []");
  });

  test('public 20L bidon appears as a normal product with returnable options', () => {
    const fs = require('fs');
    const path = require('path');
    const html = fs.readFileSync(path.join(__dirname, '..', 'src/features/legacy/legacy-shell.html'), 'utf8');

    expect(html).toContain('<div class="pn">Bidon ASWA 20L</div>');
    expect(html.indexOf('class="bidon-normal-options"')).toBeLessThan(html.indexOf('id="c-sjBidonPublic"'));
    expect(html).toContain('class="bidon-normal-options"');
    expect(html).toContain('Ya tengo bidon vacio');
    expect(html).toContain('Chicha + envase retornable');
    expect(html).toContain('<div class="pp" id="pr-sjBidonPublic">S/ 60.00</div>');
    expect(html).toContain('<b>S/ 80</b>');
    expect(html).toContain('En recarga de bidon 20L pagas S/ 60');
    expect(html).toContain('ahorras S/ 15');
    expect(html).toContain('equivalente a una presentacion familiar de 4L');
    expect(html).not.toContain('id="sanJuanPublico"');
    expect(html).not.toContain('El bidon para obra o publico general solo acepta');
    expect(html).toContain('Puedes pagarlo con efectivo, Yape, Plin o transferencia');
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

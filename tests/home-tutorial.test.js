const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

describe('public home stage 1', () => {
  test('boots the landing in catalog-only mode', () => {
    expect(html).toContain('<body class="purchase-step-products">');
    expect(html).toContain("mostrarPasoCompra('products', false)");
    expect(html).toContain('body.purchase-step-products #btnRef');
    expect(html).toContain('body.purchase-step-products .btn-tutorial-top');
    expect(html).toContain('body.purchase-step-products #pwaInstallCard');
    expect(html).toContain('body.purchase-step-products #installPWA');
    expect(html).toContain('body.purchase-step-products #promoSlider');
    expect(html).toContain('body.purchase-step-products .easy-start');
    expect(html).toContain('body.purchase-step-products .quick-order');
    expect(html).toContain('body.purchase-step-products .home-help-collapsible');
    expect(html).toContain('body.purchase-step-products #homeCoverageSection');
    expect(html).toContain('body.purchase-step-products #datosPedidoSection');
    expect(html).toContain('body.purchase-step-products #pagoPedidoSection');
    expect(html).toContain('body.purchase-step-products .social-section');
    expect(html).toContain('body.purchase-step-products #aswaSocialShareMenu');
    expect(html).toContain('body.purchase-step-products footer');
    expect(html).toContain('body.purchase-step-products .bottomnav');
    expect(html).toContain('body.purchase-step-products .chat-fab');
    expect(html).toContain('body.purchase-step-products .quick-access-panel');
    expect(html).toContain('body.purchase-step-products #badge-bono');
  });

  test('shows the visible catalog and floating cart', () => {
    expect(html).toContain('id="productosSection"');
    expect(html).toContain('Chicha ASWA 2 litros');
    expect(html).toContain('Chicha ASWA 3 litros');
    expect(html).toContain('Chicha ASWA 4 litros');
    expect(html).toContain('Bidon ASWA 20L');
    expect(html).toContain('id="c-p400"');
    expect(html).toContain('Ideal para consumo personal. Disponible desde 1 unidad.');
    expect(html).toContain('Programa Institucional ASWA');
    expect(html).toContain('institutionalPrivateContent" hidden');
    expect(html).toContain('Chicha ASWA 400 ml');
    expect(html).toContain('Pack Escolar ASWA 400 ml');
    expect(html).toContain('Timbo ASWA 20 litros');
    expect(html).toContain('Pedido Institucional');
    expect(html).not.toContain('Pack 12 Chichas ASWA');
    expect(html).not.toContain('Pack 24 Chichas ASWA');
    expect(html).toContain('id="btnCarritoFlotante"');
    expect(html).toContain('id="cartCountText"');
    expect(html).toContain('onclick="abrirResumen(true)"');
  });
});

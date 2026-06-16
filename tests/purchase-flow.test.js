const fs = require('fs');
const path = require('path');

function readHtml() {
  return fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
}

describe('guided purchase flow', () => {
  test('keeps benefits, app install, and social content out of the purchase steps', () => {
    const html = readHtml();

    expect(html).toContain('id="purchaseFlowRealFinalOverrides"');
    expect(html).toContain('<body class="purchase-step-products">');
    expect(html).toContain("mostrarPasoCompra('products', false)");
    expect(html).toContain('body.purchase-step-products #pwaInstallCard');
    expect(html).toContain('body.purchase-step-products #btnRef');
    expect(html).toContain('body.purchase-step-products #aswaSocialShareMenu');
    expect(html).toContain('body.purchase-step-products .easy-start');
    expect(html).toContain('body.purchase-step-products .quick-order');
    expect(html).toContain('body.purchase-step-products #homeCoverageSection');
    expect(html).toContain('body.purchase-step-products #installPWA');

    expect(html).toContain('body.purchase-step-delivery #productosSection');
    expect(html).toContain('body.purchase-step-delivery #pagoPedidoSection');
    expect(html).toContain('body.purchase-step-delivery #installPWA');

    expect(html).toContain('body.purchase-step-payment #productosSection');
    expect(html).toContain('body.purchase-step-payment #datosPedidoSection');
    expect(html).toContain('body.purchase-step-payment #installPWA');
  });

  test('moves benefits and app install into the post-purchase success screen', () => {
    const html = readHtml();

    expect(html).toContain('id="postCompraBenefits"');
    expect(html).toContain('Ahora si: beneficios de cliente');
    expect(html).toContain('Tu compra ya fue enviada');
    expect(html).toContain('pwaAbrirModal()');
    expect(html).toContain("irA('bono')");
    expect(html).toContain("abrirMision('video')");
    expect(html).toContain("irA('tutorial')");
  });

  test('only shows the floating app installer after purchase and keeps sw v37 installable', () => {
    const html = readHtml();
    const sw = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');

    expect(html).toContain('function pwaCompraEnCurso');
    expect(html).toContain("const ASWA_PWA_CACHE_NAME = 'aswa-v37'");
    expect(html).toContain('async function pwaForzarVersionNueva');
    expect(html).toContain("navigator.serviceWorker.addEventListener('controllerchange'");
    expect(html).toContain('pwaForzarVersionNueva();');
    expect(html).toContain('function mostrarPostCompraUI');
    expect(html).toContain("document.body.classList.add('purchase-complete')");
    expect(html).toContain('mostrarPostCompraUI();');
    expect(html).toContain('}, 45000);');
    expect(html).toContain("lsGet('succ_active') === '1'");
    expect(html).toContain('!postCompra || pwaCompraEnCurso() || pwaEsStandalone()');
    expect(html).toContain('/\\/sw\\.js(?:\\?|$)/.test(script)');
    expect(html).toContain("navigator.serviceWorker.register('./sw.js?v=37'");
    expect(html).toContain("const CACHE_NAME = 'aswa-v37'");
    expect(html).toContain("fetch(new Request(e.request, { cache: 'no-store' }))");
    expect(html).toContain("url.searchParams.set(VERSION_PARAM, CACHE_NAME)");
    expect(sw).toContain("const CACHE_NAME = 'aswa-v37'");
    expect(sw).toContain("fetch(new Request(e.request, { cache: 'no-store' }))");
    expect(sw).toContain("url.searchParams.set(VERSION_PARAM, CACHE_NAME)");
  });
});

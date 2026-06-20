const fs = require('fs');
const path = require('path');
const { TextDecoder, TextEncoder } = require('util');

global.TextDecoder = global.TextDecoder || TextDecoder;
global.TextEncoder = global.TextEncoder || TextEncoder;

const { JSDOM, VirtualConsole } = require('jsdom');

function setupPaymentDom() {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  return new JSDOM(html, {
    url: 'http://localhost',
    virtualConsole: new VirtualConsole()
  }).window.document;
}

describe('payment methods layout', () => {
  test('shows only the main electronic wallets before the more button', () => {
    const document = setupPaymentDom();
    const visibleWallets = Array.from(document.querySelectorAll('#pagoPedidoSection .pgrd-top .popt'))
      .map(el => el.id);

    expect(document.querySelector('#pagoPedidoSection .pgrd-label').textContent).toContain('Billeteras');
    expect(visibleWallets).toEqual(['pay-Yape', 'pay-PlinBBVA', 'pay-PlinIBK']);
    expect(document.getElementById('btnMasBilleteras')).toBeTruthy();
  });

  test('keeps BIM, Agora and Binance in the additional wallets panel', () => {
    const document = setupPaymentDom();
    const extraPanel = document.getElementById('pagoBilleterasExtra');
    const extraWallets = Array.from(extraPanel.querySelectorAll('.popt')).map(el => el.id);
    const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

    expect(extraPanel.classList.contains('show')).toBe(false);
    expect(extraWallets).toEqual(['pay-BIM', 'pay-Agora', 'pay-Binance']);
    expect(extraPanel.querySelector('.pgrd-crypto-label').textContent).toContain('solo Binance');
    expect(html).toContain('#pagoPedidoSection #pagoBilleterasExtra.pgrd-top-2');
    expect(html).toContain('display:none !important');
  });

  test('shows the final total in cash, wallet and bank payment instructions', () => {
    const document = setupPaymentDom();
    const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

    expect(document.getElementById('pagoTotalMonto')).toBeTruthy();
    expect(document.getElementById('payboxMonto')).toBeTruthy();
    expect(document.getElementById('efectivoTotalMonto')).toBeTruthy();
    expect(document.getElementById('pagoTotalHelp').textContent).toContain('monto final');
    expect(document.getElementById('payboxMontoLabel').textContent).toContain('Monto a pagar');

    expect(html).toContain('function actualizarMontoPagoUI()');
    expect(html).toContain("setText('pagoTotalMonto', totalText)");
    expect(html).toContain("setText('payboxMonto', totalText)");
    expect(html).toContain("setText('efectivoTotalMonto', totalText)");
    expect(html).toContain("setText('payboxMontoLabel', esBanco ? 'Monto a transferir' : 'Monto a pagar')");
    expect(html).toContain('Paga este total al recibir. Ingresa abajo con cuanto pagaras para calcular tu vuelto.');
    expect(html).toContain('Transfiere exactamente este monto por banco y sube el comprobante.');
    expect(html).toContain('Paga exactamente este monto por billetera y sube el comprobante.');
    expect(html).toContain("pagoCon.placeholder = total > 0 ? totalText : 'S/ 0.00'");
  });
});

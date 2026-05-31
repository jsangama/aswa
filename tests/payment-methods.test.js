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
});

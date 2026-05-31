const fs = require('fs');
const path = require('path');
const { TextDecoder, TextEncoder } = require('util');

global.TextDecoder = global.TextDecoder || TextDecoder;
global.TextEncoder = global.TextEncoder || TextEncoder;

const { JSDOM, VirtualConsole } = require('jsdom');

function setupTutorialDom() {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const virtualConsole = new VirtualConsole();
  const dom = new JSDOM(html, {
    runScripts: 'outside-only',
    url: 'http://localhost',
    virtualConsole
  });

  const { window } = dom;
  window.tst = () => {};
  window.Element.prototype.scrollIntoView = () => {};

  const start = html.indexOf('const ASWA_HOME_TUTORIAL_STEPS');
  const end = html.indexOf('function _zonaNorm', start);

  if (start < 0 || end < 0) {
    throw new Error('No se encontro el bloque del tutorial de inicio');
  }

  window.eval(html.slice(start, end));
  window.tutHomeRender();

  return window;
}

describe('home tutorial guide', () => {
  test('is visible on the initial order page and renders the first step', () => {
    const window = setupTutorialDom();
    const section = window.document.querySelector('.home-tutorial');

    expect(section).toBeTruthy();
    expect(window.document.getElementById('homeTutTitle').textContent).toBe('Abre la app');
    expect(window.document.querySelectorAll('.home-tutorial-dot').length).toBe(6);
  });

  test('advances steps and shows preparation tab coherently', () => {
    const window = setupTutorialDom();

    window.tutHomeNext();
    expect(window.document.getElementById('homeTutTitle').textContent).toBe('Elige tu chicha');

    window.tutHomeSetTab('preparacion');
    expect(window.document.getElementById('homeTutPrepPanel').classList.contains('show')).toBe(true);
    expect(window.document.getElementById('homeTutTabPrep').getAttribute('aria-selected')).toBe('true');
    expect(window.document.getElementById('homeTutPrepPanel').textContent).toContain('Preparacion y entrega');
  });
});

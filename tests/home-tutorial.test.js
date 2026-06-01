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
    expect(window.document.getElementById('homeTutTitle').textContent).toBe('Entra a ASWA');
    expect(window.document.querySelectorAll('.home-tutorial-dot').length).toBe(7);
  });

  test('advances steps, jumps by dot, and shows preparation tab coherently', () => {
    const window = setupTutorialDom();

    window.tutHomeNext();
    expect(window.document.getElementById('homeTutTitle').textContent).toBe('Abre la app');

    window.tutHomeSetStep(2);
    expect(window.document.getElementById('homeTutTitle').textContent).toBe('Elige tu chicha');

    window.tutHomeSetTab('preparacion');
    expect(window.document.getElementById('homeTutPrepPanel').classList.contains('show')).toBe(true);
    expect(window.document.getElementById('homeTutTabPrep').getAttribute('aria-selected')).toBe('true');
    expect(window.document.getElementById('homeTutPrepPanel').textContent).toContain('Preparacion y entrega');
  });

  test('guide facebook tutorial opens through the video modal path', () => {
    const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
    const start = html.indexOf("function tutAbrirVideo(seccion)");
    const end = html.indexOf("function tutCerrarVideo()", start);
    const block = html.slice(start, end);

    expect(html).toContain("onclick=\"tutAbrirVideo('inicio')\"");
    expect(html).toContain("inicio   : 'fQbZiTTD88g'");
    expect(block).toContain("const modal = document.getElementById('tutVideoModal')");
    expect(block).not.toContain("tutToggleTutorialPedido(true)");
    expect(html).toContain('function tutRepararIconosGuia');
  });
});

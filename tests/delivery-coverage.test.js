const fs = require('fs');
const path = require('path');
const { TextDecoder, TextEncoder } = require('util');

global.TextDecoder = global.TextDecoder || TextDecoder;
global.TextEncoder = global.TextEncoder || TextEncoder;

const { JSDOM, VirtualConsole } = require('jsdom');

function setupCoverageDom() {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const virtualConsole = new VirtualConsole();
  const dom = new JSDOM(html, {
    runScripts: 'outside-only',
    url: 'http://localhost',
    virtualConsole
  });

  const { window } = dom;
  window.calcTotal = () => {};
  window.mostrarNotaNacional = () => {};
  window.tst = () => {};
  window.Element.prototype.scrollIntoView = () => {};

  const start = html.indexOf('function _zonaNorm');
  const end = html.indexOf('function actualizarETAVisual', start);

  if (start < 0 || end < 0) {
    throw new Error('No se encontro el bloque de seleccion de zona');
  }

  window.eval(html.slice(start, end));
  window.eval('function actualizarETAVisual(){}');

  return window;
}

describe('home delivery coverage section', () => {
  test('is visible on the initial page and selects Tarapoto in the real order zone', () => {
    const window = setupCoverageDom();
    const section = window.document.querySelector('.home-coverage');

    expect(section).toBeTruthy();

    window.seleccionarZonaInicio('Tarapoto', 4);

    const zone = window.document.getElementById('zona');
    const activeZones = window.document.querySelectorAll(
      '.home-zone-card.active,.home-map-zone.active,.zona-quick-btn.active'
    );

    expect(zone.value).toBe('4');
    expect(zone.options[zone.selectedIndex].textContent).toContain('Tarapoto');
    expect(activeZones.length).toBeGreaterThanOrEqual(2);
  });

  test('selects national shipping and keeps agency note available', () => {
    const window = setupCoverageDom();

    window.seleccionarZonaInicio('Nacional', 10);

    const zone = window.document.getElementById('zona');
    const note = window.document.querySelector('.home-zone-note');

    expect(zone.value).toBe('10');
    expect(zone.options[zone.selectedIndex].textContent).toContain('agencia');
    expect(note.textContent).toContain('agencia');
  });
});

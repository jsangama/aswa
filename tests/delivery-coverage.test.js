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
    const summary = window.document.getElementById('zonaSelectedText');
    const activeZones = window.document.querySelectorAll(
      '.home-zone-card.active,.home-map-zone.active,.zona-quick-btn.active'
    );

    expect(zone.value).toBe('4');
    expect(zone.options[zone.selectedIndex].textContent).toContain('Tarapoto');
    expect(summary.textContent).toContain('Tarapoto');
    expect(activeZones.length).toBeGreaterThanOrEqual(1);
  });

  test('uses a real embedded map for the delivery coverage area', () => {
    const window = setupCoverageDom();
    const iframe = window.document.querySelector('.home-map iframe');
    const openMap = window.document.querySelector('.home-map-open');

    expect(iframe).toBeTruthy();
    expect(iframe.getAttribute('src')).toBeFalsy();
    expect(iframe.getAttribute('data-defer')).toBe('manual');
    expect(iframe.getAttribute('data-src')).toContain('openstreetmap.org/export/embed.html');
    expect(iframe.getAttribute('title')).toContain('Mapa real');
    expect(window.document.querySelector('.home-map-load').textContent).toContain('Cargar mapa');
    expect(openMap.getAttribute('href')).toContain('google.com/maps');
  });

  test('does not duplicate the delivery zone cards in the order form', () => {
    const window = setupCoverageDom();

    expect(window.document.getElementById('zonaQuickGrid')).toBeFalsy();
    expect(window.document.querySelector('.zona-selected-summary')).toBeTruthy();
    expect(window.document.querySelectorAll('.home-zone-card')).toHaveLength(5);
  });

  test('selects national shipping and keeps agency note available', () => {
    const window = setupCoverageDom();

    window.seleccionarZonaInicio('Nacional', 10);

    const zone = window.document.getElementById('zona');
    const note = window.document.querySelector('.home-zone-note');
    const conditions = window.document.getElementById('nationalShippingNoticeInicio');

    expect(zone.value).toBe('10');
    expect(zone.options[zone.selectedIndex].textContent).toContain('agencia');
    expect(note.textContent).toContain('agencia');
    expect(window.document.querySelector('[data-zona-nombre="Nacional"]')).toBeTruthy();
    expect(conditions.textContent).toContain('flete desde la agencia');
  });
});

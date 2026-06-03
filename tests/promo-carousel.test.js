const fs = require('fs');
const path = require('path');
const { TextDecoder, TextEncoder } = require('util');

global.TextDecoder = global.TextDecoder || TextDecoder;
global.TextEncoder = global.TextEncoder || TextEncoder;

const { JSDOM, VirtualConsole } = require('jsdom');

function setupCarouselDom() {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const virtualConsole = new VirtualConsole();
  return new JSDOM(html, {
    runScripts: 'dangerously',
    url: 'http://localhost',
    virtualConsole
  }).window;
}

describe('promo carousel', () => {
  test('keeps all current slides and v7 fusion captions', () => {
    const window = setupCarouselDom();
    const slides = window.document.querySelectorAll('#promoSlider > div');
    const dots = window.document.querySelectorAll('#promoDots > span');
    const captions = [...window.document.querySelectorAll('.promo-caption')]
      .map(el => el.textContent);

    expect(slides.length).toBe(10);
    expect(dots.length).toBe(10);
    expect(captions.join(' ')).toContain('Chicha artesanal - La Rica Chicha');
    expect(captions.join(' ')).toContain('La chicha tambien sabe a Peru');
    expect(captions.join(' ')).toContain('Pedidos con delivery');
  });

  test('prioritizes the first slide and defers the rest of the carousel', () => {
    const window = setupCarouselDom();
    const imgs = [...window.document.querySelectorAll('#promoSlider img')];
    const first = imgs[0];

    expect(first.getAttribute('loading')).toBe('eager');
    expect(first.getAttribute('fetchpriority')).toBe('high');
    expect(imgs.filter(img => img.getAttribute('data-src')).length).toBeGreaterThanOrEqual(8);
    expect(imgs.filter(img => img.getAttribute('src')).length).toBeLessThan(imgs.length);
  });
});

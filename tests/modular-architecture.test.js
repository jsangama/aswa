const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

describe('modular architecture scaffold', () => {
  test('loads a real module entrypoint from index.html', () => {
    const html = read('index.html');

    expect(html).toContain('<script type="module" src="src/main.js"></script>');
    expect(html).toContain("const ASWA_PWA_CACHE_NAME = 'aswa-v39'");
    expect(html).toContain("navigator.serviceWorker.register('./sw.js?v=39'");
  });

  test('keeps domain modules outside the monolithic html file', () => {
    const modules = [
      'src/modules/app-shell.js',
      'src/modules/storage.js',
      'src/modules/cart.js',
      'src/modules/catalog.js',
      'src/modules/purchase-flow.js',
      'src/modules/pwa-cache.js',
    ];

    for (const modulePath of modules) {
      expect(fs.existsSync(path.join(root, modulePath))).toBe(true);
      expect(read(modulePath)).toMatch(/export /);
    }

    const main = read('src/main.js');
    expect(main).toContain("from './modules/app-shell.js'");
    expect(main).toContain("from './modules/storage.js'");
    expect(main).toContain("from './modules/cart.js'");
    expect(main).toContain("from './modules/catalog.js'");
    expect(main).toContain("from './modules/purchase-flow.js'");
    expect(main).toContain("from './modules/pwa-cache.js'");
    expect(main).toContain('window.ASWA');
  });

  test('publishes src modules to Firebase Hosting and PWA cache', () => {
    const build = read('scripts/build-hosting.mjs');
    const html = read('index.html');
    const sw = read('sw.js');

    expect(build).toContain("'src'");
    expect(html).toContain("'./src/main.js'");
    expect(sw).toContain("BASE + 'src/main.js'");
    expect(sw).toContain("BASE + 'src/modules/app-shell.js'");
    expect(sw).toContain("BASE + 'src/modules/cart.js'");
    expect(sw).toContain("BASE + 'src/modules/catalog.js'");
    expect(sw).toContain("BASE + 'src/modules/purchase-flow.js'");
    expect(sw).toContain("BASE + 'src/modules/pwa-cache.js'");
    expect(sw).toContain("BASE + 'src/modules/storage.js'");
  });
});

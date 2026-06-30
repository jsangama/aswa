const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

describe('modular architecture scaffold', () => {
  test('keeps index.html as a small application shell', () => {
    const html = read('index.html');

    expect(html).toContain('<div id="app"></div>');
    expect(html).toContain('<script type="module" src="src/app/main.js"></script>');
    expect(html).not.toContain('function continuarPedidoInteligente');
    expect(html).not.toContain('id="productosSection"');
    expect(html).not.toContain('const ASWA_PWA_CACHE_NAME');
    expect(html.length).toBeLessThan(1200);
  });

  test('keeps domain modules outside the application shell', () => {
    const modules = [
      'src/app/main.js',
      'src/app/router.js',
      'src/app/routes.js',
      'src/layouts/app-layout.js',
      'src/layouts/admin-layout.js',
      'src/layouts/delivery-layout.js',
      'src/features/legacy/index.js',
      'src/features/catalog/index.js',
      'src/features/cart/index.js',
      'src/features/checkout/index.js',
      'src/features/payment/index.js',
      'src/features/delivery/index.js',
      'src/features/orders/index.js',
      'src/features/customers/index.js',
      'src/features/auth/index.js',
      'src/features/admin/index.js',
      'src/features/reports/index.js',
      'src/features/ugc/index.js',
      'src/shared/store/app-store.js',
      'src/shared/utils/format-money.js',
      'src/shared/services/firebase-service.js',
      'src/shared/components/app-root.js',
      'src/modules/app-shell.js',
      'src/modules/storage.js',
      'src/modules/cart.js',
      'src/modules/catalog.js',
      'src/modules/commercial-structure.js',
      'src/modules/delivery-options.js',
      'src/modules/payment-methods.js',
      'src/modules/purchase-flow.js',
      'src/modules/pwa-cache.js',
      'src/components/delivery-address-field.js',
      'src/components/payment-total-card.js',
      'src/pages/delivery-page.js',
      'src/pages/payment-page.js',
    ];

    for (const modulePath of modules) {
      expect(fs.existsSync(path.join(root, modulePath))).toBe(true);
      expect(read(modulePath)).toMatch(/export /);
    }

    const appMain = read('src/app/main.js');
    const router = read('src/app/router.js');
    const legacyFeature = read('src/features/legacy/index.js');
    const legacyMain = read('src/main.js');

    expect(appMain).toContain("from './router.js'");
    expect(router).toContain("from './routes.js'");
    expect(router).toContain("from '../features/legacy/index.js'");
    expect(legacyFeature).toContain('legacy-shell.html');
    expect(legacyMain).toContain("from './modules/app-shell.js'");
    expect(legacyMain).toContain('window.ASWA');
  });

  test('publishes src modules to Firebase Hosting and PWA cache', () => {
    const build = read('scripts/build-hosting.mjs');
    const sw = read('sw.js');

    expect(build).toContain("'src'");
    expect(sw).toContain("BASE + 'src/app/main.js'");
    expect(sw).toContain("BASE + 'src/app/router.js'");
    expect(sw).toContain("BASE + 'src/app/routes.js'");
    expect(sw).toContain("BASE + 'src/features/legacy/index.js'");
    expect(sw).toContain("BASE + 'src/features/legacy/legacy-shell.html'");
    expect(sw).toContain("BASE + 'src/main.js'");
    expect(sw).toContain("BASE + 'src/modules/app-shell.js'");
    expect(sw).toContain("BASE + 'src/modules/cart.js'");
    expect(sw).toContain("BASE + 'src/modules/catalog.js'");
    expect(sw).toContain("BASE + 'src/modules/commercial-structure.js'");
    expect(sw).toContain("BASE + 'src/modules/delivery-options.js'");
    expect(sw).toContain("BASE + 'src/modules/payment-methods.js'");
    expect(sw).toContain("BASE + 'src/modules/purchase-flow.js'");
    expect(sw).toContain("BASE + 'src/modules/pwa-cache.js'");
    expect(sw).toContain("BASE + 'src/modules/storage.js'");
    expect(sw).toContain("BASE + 'src/components/delivery-address-field.js'");
    expect(sw).toContain("BASE + 'src/components/payment-total-card.js'");
    expect(sw).toContain("BASE + 'src/pages/delivery-page.js'");
    expect(sw).toContain("BASE + 'src/pages/payment-page.js'");
  });

  test('documents the public modular architecture in the repository README', () => {
    const readme = read('README.md');

    expect(readme).toContain('## Arquitectura Actual');
    expect(readme).toContain('src/app');
    expect(readme).toContain('src/features');
    expect(readme).toContain('src/shared');
    expect(readme).toContain('src/layouts');
    expect(readme).toContain('src/modules');
    expect(readme).toContain('src/components');
    expect(readme).toContain('src/pages');
    expect(readme).toContain('index.html` ahora es solo el shell de arranque');
    expect(readme).toContain('src/features/legacy/legacy-shell.html');
    expect(readme).toContain('payment-methods.js');
    expect(readme).toContain('delivery-options.js');
    expect(readme).toContain('Shell limpio con router feature-based');
    expect(readme).not.toContain('/index.html\n/ugc.html\n/css\n/js\n/assets\n/images');
    expect(readme).not.toContain('Tailwind CSS');
  });

  test('keeps commercial catalog data separated from catalog service logic', () => {
    const catalog = read('src/modules/catalog.js');
    const commercial = read('src/modules/commercial-structure.js');

    expect(catalog).toContain("from './commercial-structure.js'");
    expect(catalog).toContain('createCatalogService');
    expect(catalog).not.toContain("id: 'p400'");
    expect(commercial).toContain('PUBLIC_CATALOG_PRODUCTS');
    expect(commercial).toContain('INSTITUTIONAL_CATALOG_PRODUCTS');
    expect(commercial).toContain('INSTITUTIONAL_ACCESS_CODES');
    expect(commercial).toContain('createCommercialCatalog');
    expect(commercial).toContain('isInstitutionalAccessCode');
  });
});

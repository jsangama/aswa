import { createAppShell } from './modules/app-shell.js';
import { createStorageAdapter } from './modules/storage.js';
import { PRODUCT_CATALOG, createCatalogService } from './modules/catalog.js';
import { createCartService } from './modules/cart.js';
import { createPurchaseFlow } from './modules/purchase-flow.js';
import { createPwaCacheController } from './modules/pwa-cache.js';
import { createPaymentMethodsService } from './modules/payment-methods.js';
import { createPaymentPage } from './pages/payment-page.js';

const existing = window.ASWA || {};

const modules = {
  storage: createStorageAdapter({
    getBusinessId: () => window.ASWA_CONFIG?.BUSINESS_ID || window.BUSINESS_ID || 'aswa001',
  }),
  catalog: createCatalogService({ products: PRODUCT_CATALOG }),
  cart: createCartService(),
  purchaseFlow: createPurchaseFlow({ document }),
  paymentMethods: createPaymentMethodsService(),
  paymentPage: createPaymentPage({ document }),
  pwaCache: createPwaCacheController({
    cacheName: 'aswa-v47',
    serviceWorker: navigator.serviceWorker,
    location,
    sessionStorage,
  }),
};

window.ASWA = {
  ...existing,
  shell: createAppShell({ modules }),
  modules,
};

document.addEventListener('firebase-ready', () => {
  window.ASWA.shell.setReady('firebase', true);
});

window.ASWA.shell.setReady('modules', true);

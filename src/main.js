/**
 * ASWA Platform - main entry point.
 */

window.ASWA_STATE = window.ASWA_STATE || {
  user: null,
  cart: [],
  negocio: null,
  fbReady: false,
  authenticated: false,
};

document.addEventListener('firebase-ready', () => {
  window.ASWA_STATE.fbReady = true;
});

window.esperarFB = () => {
  return new Promise((resolve) => {
    if (window.ASWA_STATE.fbReady) {
      resolve();
      return;
    }

    document.addEventListener('firebase-ready', resolve, { once: true });
  });
};

console.log('ASWA Platform initialized');

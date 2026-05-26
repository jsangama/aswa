/**
 * ASWA Platform — Main Entry Point
 * 
 * Punto de entrada principal de la aplicación.
 * Carga módulos, inicializa Firebase y prepara la UI.
 * 
 * @author jsangama
 * @version 4.0.1
 */

console.log('🚀 ASWA Platform v4.0.1 iniciando...');

// Estado global
window.ASWA_STATE = {
  user: null,
  cart: [],
  negocio: null,
  fbReady: false,
  authenticated: false
};

// Esperar a que Firebase esté listo
document.addEventListener('firebase-ready', () => {
  console.log('✅ Firebase inicializado correctamente');
  window.ASWA_STATE.fbReady = true;
});

// Helper para esperar Firebase
window.esperarFB = () => {
  return new Promise(resolve => {
    if (window.ASWA_STATE.fbReady) {
      resolve();
    } else {
      document.addEventListener('firebase-ready', resolve, { once: true });
    }
  });
};

console.log('✅ main.js cargado');

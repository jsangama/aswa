import { startRouter } from './router.js';

export function bootstrapApp({ window, document }) {
  const root = document.getElementById('app');

  if (!root) {
    throw new Error('ASWA app root was not found.');
  }

  return startRouter({ window, document, root }).catch((error) => {
    console.error('[ASWA] App bootstrap failed', error);
    root.innerHTML = `
      <main style="font-family: system-ui, sans-serif; padding: 24px; color: #111;">
        <h1>ASWA no pudo iniciar</h1>
        <p>Actualiza la pagina o vuelve a intentarlo en unos minutos.</p>
      </main>
    `;
  });
}

bootstrapApp({ window, document });

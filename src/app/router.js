import { resolveRoute } from './routes.js';
import { mountLegacyFeature } from '../features/legacy/index.js';

const featureMounts = Object.freeze({
  legacy: mountLegacyFeature,
});

export async function startRouter({ window, document, root }) {
  const route = resolveRoute(window.location.pathname);
  const mount = featureMounts[route.feature];

  if (!mount) {
    throw new Error(`No mount registered for feature: ${route.feature}`);
  }

  document.title = route.title;
  await mount({ window, document, root, route });
}

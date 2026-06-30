export const routes = Object.freeze([
  {
    id: 'storefront',
    path: '/',
    feature: 'legacy',
    title: 'ASWA - La Rica Chicha',
  },
  {
    id: 'admin',
    path: '/admin',
    feature: 'legacy',
    title: 'ASWA Admin',
  },
  {
    id: 'delivery',
    path: '/delivery',
    feature: 'legacy',
    title: 'ASWA Delivery',
  },
]);

export function resolveRoute(pathname = '/') {
  return routes.find((route) => route.path === pathname) || routes[0];
}

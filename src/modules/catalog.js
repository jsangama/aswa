import { createCommercialCatalog } from './commercial-structure.js';

export const PRODUCT_CATALOG = createCommercialCatalog();

export function createCatalogService({ products = PRODUCT_CATALOG } = {}) {
  const byId = new Map(products.map((product) => [product.id, { ...product }]));

  return {
    all() {
      return [...byId.values()].map((product) => ({ ...product }));
    },
    find(id) {
      const product = byId.get(id);
      return product ? { ...product } : null;
    },
    byGroup(group) {
      return this.all().filter((product) => product.group === group);
    },
    priceFor(id) {
      return Number(byId.get(id)?.price || 0);
    },
  };
}

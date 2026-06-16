export const PRODUCT_CATALOG = [
  { id: 'p2l', name: 'Chicha ASWA 2 litros', shortName: '2 litros', price: 9, group: 'catalogo' },
  { id: 'p3l', name: 'Chicha ASWA 3 litros', shortName: '3 litros', price: 13, group: 'catalogo' },
  { id: 'p4l', name: 'Chicha ASWA 4 litros', shortName: '4 litros', price: 15, group: 'catalogo' },
  { id: 'sjBidonPublic', name: 'Bidon ASWA 20L', shortName: 'Bidon 20L', price: 60, group: 'catalogo' },
  { id: 'sjBidon', name: 'Bidon escolar sanjuanero 20L', shortName: 'Bidon escolar', price: 50, group: 'escolar' },
  { id: 'sjChicha04', name: 'ASWA escolar sanjuanera 400 ml', shortName: 'Chicha 400 ml', price: 2.5, group: 'escolar' },
  { id: 'sjJuane', name: 'Solo juane escolar', shortName: 'Juane escolar', price: 2.5, group: 'escolar' },
  { id: 'sjCombo', name: 'Combo chicha 400 ml + juane escolar', shortName: 'Combo escolar', price: 4, group: 'escolar' },
  { id: 'sjJuaneFamiliar', name: 'Juane institucional', shortName: 'Juane institucional', price: 25, group: 'institucional' },
];

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

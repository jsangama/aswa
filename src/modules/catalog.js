export const PRODUCT_CATALOG = [
  { id: 'p400', name: 'Chicha ASWA 400 ml', shortName: '400 ml', price: 2.5, group: 'catalogo' },
  { id: 'p2l', name: 'Chicha ASWA 2 litros', shortName: '2 litros', price: 9, group: 'catalogo' },
  { id: 'p3l', name: 'Chicha ASWA 3 litros', shortName: '3 litros', price: 13, group: 'catalogo' },
  { id: 'p4l', name: 'Chicha ASWA 4 litros', shortName: '4 litros', price: 15, group: 'catalogo' },
  { id: 'sjBidonPublic', name: 'Bidon ASWA 20L', shortName: 'Bidon 20L', price: 60, group: 'catalogo' },
  { id: 'sjBidon', name: 'Timbo ASWA 20 litros', shortName: 'Timbo 20L', price: 50, group: 'escolar' },
  { id: 'sjChicha04', name: 'Pack Escolar ASWA 400 ml', shortName: 'Pack 15 x 400 ml', price: 30, group: 'escolar' },
  { id: 'sjJuaneFamiliar', name: 'Pedido Institucional de Chicha ASWA', shortName: 'Pedido Institucional', price: 0, group: 'institucional' },
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

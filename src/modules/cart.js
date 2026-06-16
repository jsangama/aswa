export function normalizeCart({ cart = {}, prices = {}, productIds = [] } = {}) {
  const nextCart = { ...cart };
  const nextPrices = { ...prices };

  productIds.forEach((id) => {
    if (!Number.isFinite(Number(nextCart[id]))) nextCart[id] = 0;
    if (!Number.isFinite(Number(nextPrices[id]))) nextPrices[id] = 0;
  });

  return { cart: nextCart, prices: nextPrices };
}

export function itemsFromCart({
  cart = {},
  prices = {},
  productMeta = {},
  productIds = Object.keys(productMeta),
} = {}) {
  const normalized = normalizeCart({ cart, prices, productIds });

  return productIds
    .filter((id) => Number(normalized.cart[id] || 0) > 0)
    .map((id) => {
      const qty = Number(normalized.cart[id] || 0);
      const price = Number(normalized.prices[id] || 0);
      return {
        id,
        qty,
        precio: price,
        price,
        total: +(qty * price).toFixed(2),
        nombre: productMeta[id]?.nombre || productMeta[id]?.name || id,
        corto: productMeta[id]?.corto || productMeta[id]?.shortName || id,
      };
    });
}

export function calculateTotals({
  cart = {},
  prices = {},
  productIds = [],
  delivery = 0,
  discountPercent = 0,
  fixedDiscount = 0,
} = {}) {
  const normalized = normalizeCart({ cart, prices, productIds });
  const base = productIds.reduce((sum, id) => {
    return sum + Number(normalized.cart[id] || 0) * Number(normalized.prices[id] || 0);
  }, 0);
  const raw = +(base + Number(delivery || 0)).toFixed(2);
  const percent = Math.min(100, Math.max(0, Number(discountPercent || 0)));
  const afterPercent = Math.max(0, raw * (1 - percent / 100));
  const fixed = Math.min(Math.max(0, Number(fixedDiscount || 0)), afterPercent);
  const final = +Math.max(0, afterPercent - fixed).toFixed(2);

  return { base: +base.toFixed(2), raw, final, fixedDiscountApplied: +fixed.toFixed(2) };
}

export function createCartService() {
  return {
    normalizeCart,
    itemsFromCart,
    calculateTotals,
  };
}

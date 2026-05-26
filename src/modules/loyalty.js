/**
 * ASWA Loyalty Module.
 */

export const LOYALTY_LEVELS = {
  BRONCE: { name: 'Bronce', minOrders: 0, discount: 0.05 },
  PLATA: { name: 'Plata', minOrders: 11, discount: 0.1 },
  ORO: { name: 'Oro', minOrders: 26, discount: 0.15 },
  DIAMANTE: { name: 'Diamante', minOrders: 51, discount: 0.2 },
};

export class LoyaltyManager {
  getLevel(orders) {
    if (orders >= LOYALTY_LEVELS.DIAMANTE.minOrders) return LOYALTY_LEVELS.DIAMANTE;
    if (orders >= LOYALTY_LEVELS.ORO.minOrders) return LOYALTY_LEVELS.ORO;
    if (orders >= LOYALTY_LEVELS.PLATA.minOrders) return LOYALTY_LEVELS.PLATA;
    return LOYALTY_LEVELS.BRONCE;
  }

  getDiscount(orders) {
    return this.getLevel(orders).discount;
  }

  applyDiscount(total, orders) {
    return total * (1 - this.getDiscount(orders));
  }
}

export const loyaltyManager = new LoyaltyManager();

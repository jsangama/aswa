/**
 * Legacy app helpers. New code belongs in src/modules.
 */

class Cart {
  constructor() {
    this.items = [];
  }

  addItem(item) {
    if (!item || !item.id) return false;
    this.items.push(item);
    this.save();
    return true;
  }

  removeItem(itemId) {
    this.items = this.items.filter((item) => item.id !== itemId);
    this.save();
  }

  save() {
    localStorage.setItem('cart', JSON.stringify(this.items));
  }

  load() {
    this.items = JSON.parse(localStorage.getItem('cart')) || [];
  }
}

class LoyaltySystem {
  constructor(userId) {
    this.userId = userId;
    this.points = 0;
  }

  addPoints(points) {
    this.points += points;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Cart,
    LoyaltySystem,
  };
}

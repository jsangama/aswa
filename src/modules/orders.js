/**
 * ASWA Orders Module.
 */

function getBusinessId() {
  return window.ASWA_CONFIG?.BUSINESS_ID || 'aswa001';
}

export class OrderManager {
  constructor() {
    this.cart = [];
    this.selectedPayment = null;
  }

  addToCart(product) {
    if (!product || !product.id) {
      return false;
    }

    const existing = this.cart.find((item) => item.id === product.id);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      this.cart.push({ ...product, quantity: product.quantity || 1 });
    }

    this.saveToLocalStorage();
    return true;
  }

  removeFromCart(productId) {
    this.cart = this.cart.filter((item) => item.id !== productId);
    this.saveToLocalStorage();
  }

  getTotal() {
    return this.cart.reduce((sum, item) => {
      return sum + Number(item.price || 0) * Number(item.quantity || 1);
    }, 0);
  }

  clearCart() {
    this.cart = [];
    this.selectedPayment = null;
    this.saveToLocalStorage();
  }

  saveToLocalStorage() {
    localStorage.setItem(`${getBusinessId()}_cart`, JSON.stringify(this.cart));
  }

  loadFromLocalStorage() {
    const saved = localStorage.getItem(`${getBusinessId()}_cart`);
    this.cart = saved ? JSON.parse(saved) : [];
  }
}

export const orderManager = new OrderManager();

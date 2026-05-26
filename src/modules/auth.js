/**
 * ASWA Auth Module.
 *
 * Credentials are read from window.ASWA_CONFIG so secrets can live in an
 * ignored local config file during development.
 */

export const AUTH_MODES = {
  ADMIN: 'admin',
  DELIVERY: 'delivery',
  NONE: 'none',
};

function getConfig() {
  return window.ASWA_CONFIG || {};
}

export class AuthManager {
  constructor() {
    this.mode = AUTH_MODES.NONE;
    this.user = null;
  }

  verifyAdminPassword(password) {
    const adminPassword = getConfig().ADMIN_PASSWORD;
    return Boolean(adminPassword) && password === adminPassword;
  }

  verifyDeliveryPin(pin) {
    const deliveryPin = getConfig().DELIVERY_PIN;
    return Boolean(deliveryPin) && pin === deliveryPin;
  }

  loginAdmin(username, password) {
    if (!username || !password) {
      return { success: false, error: 'Campos requeridos' };
    }

    if (this.verifyAdminPassword(password)) {
      this.mode = AUTH_MODES.ADMIN;
      this.user = { role: AUTH_MODES.ADMIN, username };
      return { success: true, role: AUTH_MODES.ADMIN };
    }

    return { success: false, error: 'Credenciales invalidas' };
  }

  loginDelivery(pin) {
    if (!pin || pin.length !== 4) {
      return { success: false, error: 'PIN debe tener 4 digitos' };
    }

    if (this.verifyDeliveryPin(pin)) {
      this.mode = AUTH_MODES.DELIVERY;
      this.user = { role: AUTH_MODES.DELIVERY };
      return { success: true, role: AUTH_MODES.DELIVERY };
    }

    return { success: false, error: 'PIN incorrecto' };
  }

  logout() {
    this.mode = AUTH_MODES.NONE;
    this.user = null;
  }

  getMode() {
    return this.mode;
  }
}

export const authManager = new AuthManager();

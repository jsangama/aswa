/**
 * ASWA Auth Module
 * 
 * Gestiona autenticación de admin y deliveristas.
 * PIN para deliveristas, contraseña para admin.
 * 
 * @module auth
 */

export const AUTH_MODES = {
  ADMIN: 'admin',
  DELIVERY: 'delivery',
  NONE: 'none'
};

export class AuthManager {
  constructor() {
    this.mode = AUTH_MODES.NONE;
    this.user = null;
  }

  /**
   * Verificar credenciales del admin
   */
  verifyAdminPassword(password) {
    const adminPassword = window.ASWA_CONFIG?.ADMIN_PASSWORD;
    
    if (!adminPassword) {
      console.error('❌ Admin password no configurada en variables de entorno');
      return false;
    }

    return password === adminPassword;
  }

  /**
   * Verificar PIN del deliverista
   */
  verifyDeliveryPin(pin) {
    const deliveryPin = window.ASWA_CONFIG?.DELIVERY_PIN;
    
    if (!deliveryPin) {
      console.error('❌ Delivery PIN no configurada en variables de entorno');
      return false;
    }

    return pin === deliveryPin;
  }

  /**
   * Login admin
   */
  loginAdmin(username, password) {
    if (!username || !password) {
      return { success: false, error: 'Campos requeridos' };
    }

    if (this.verifyAdminPassword(password)) {
      this.mode = AUTH_MODES.ADMIN;
      this.user = { role: 'admin', username };
      return { success: true, role: 'admin' };
    }

    return { success: false, error: 'Credenciales inválidas' };
  }

  /**
   * Login deliverista
   */
  loginDelivery(pin) {
    if (!pin || pin.length !== 4) {
      return { success: false, error: 'PIN debe tener 4 dígitos' };
    }

    if (this.verifyDeliveryPin(pin)) {
      this.mode = AUTH_MODES.DELIVERY;
      this.user = { role: 'delivery' };
      return { success: true, role: 'delivery' };
    }

    return { success: false, error: 'PIN incorrecto' };
  }

  /**
   * Logout
   */
  logout() {
    this.mode = AUTH_MODES.NONE;
    this.user = null;
  }

  /**
   * Obtener modo actual
   */
  getMode() {
    return this.mode;
  }
}

export const authManager = new AuthManager();

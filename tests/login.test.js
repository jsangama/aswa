/**
 * tests/login.test.js
 */

const { setupDOM } = require('./helpers/setup-dom');
const {
  doAdminLogin,
  verifyPin,
  showPinLogin,
  showNormalLogin,
  closeAdminLogin,
  clearPinInputs,
  movePinFocus,
  handlePinBackspace,
} = require('../js/login');

// ═══════════════════════════════════════════════════════════════════════════
// SUITE 1: doAdminLogin — Login con usuario y contraseña
// ═══════════════════════════════════════════════════════════════════════════

describe('doAdminLogin()', () => {
  beforeEach(() => setupDOM());

  // ── Flujo exitoso ─────────────────────────────────────────────────────

  test('✅ admin con credenciales correctas retorna success:true y role:admin', () => {
    document.getElementById('adminUser').value = 'admin';
    document.getElementById('adminPass').value = 'test-admin-password';
    expect(doAdminLogin()).toEqual({ success: true, role: 'admin' });
  });

  test('✅ delivery con credenciales correctas retorna success:true y role:delivery', () => {
    document.getElementById('adminUser').value = 'delivery';
    document.getElementById('adminPass').value = 'test-delivery-password';
    expect(doAdminLogin()).toEqual({ success: true, role: 'delivery' });
  });

  test('✅ login exitoso oculta el overlay', () => {
    document.getElementById('adminLogin').style.display = 'flex';
    document.getElementById('adminUser').value = 'admin';
    document.getElementById('adminPass').value = 'test-admin-password';
    doAdminLogin();
    expect(document.getElementById('adminLogin').style.display).toBe('none');
  });

  test('✅ login exitoso limpia los campos del formulario', () => {
    document.getElementById('adminUser').value = 'admin';
    document.getElementById('adminPass').value = 'test-admin-password';
    doAdminLogin();
    expect(document.getElementById('adminUser').value).toBe('');
    expect(document.getElementById('adminPass').value).toBe('');
  });

  // ── Casos límite / errores ────────────────────────────────────────────

  test('❌ usuario vacío retorna empty_fields', () => {
    document.getElementById('adminUser').value = '';
    document.getElementById('adminPass').value = 'test-admin-password';
    expect(doAdminLogin()).toEqual({ success: false, reason: 'empty_fields' });
  });

  test('❌ contraseña vacía retorna empty_fields', () => {
    document.getElementById('adminUser').value = 'admin';
    document.getElementById('adminPass').value = '';
    expect(doAdminLogin()).toEqual({ success: false, reason: 'empty_fields' });
  });

  test('❌ ambos campos vacíos retorna empty_fields', () => {
    expect(doAdminLogin()).toEqual({ success: false, reason: 'empty_fields' });
  });

  test('❌ usuario solo con espacios se trata como vacío', () => {
    document.getElementById('adminUser').value = '   ';
    document.getElementById('adminPass').value = 'test-admin-password';
    expect(doAdminLogin()).toEqual({ success: false, reason: 'empty_fields' });
  });

  test('❌ contraseña incorrecta retorna invalid_credentials', () => {
    document.getElementById('adminUser').value = 'admin';
    document.getElementById('adminPass').value = 'wrong_password';
    expect(doAdminLogin()).toEqual({ success: false, reason: 'invalid_credentials' });
  });

  test('❌ usuario inexistente retorna invalid_credentials', () => {
    document.getElementById('adminUser').value = 'root';
    document.getElementById('adminPass').value = 'test-admin-password';
    expect(doAdminLogin()).toEqual({ success: false, reason: 'invalid_credentials' });
  });

  test('❌ credenciales incorrectas limpian el campo de contraseña', () => {
    document.getElementById('adminUser').value = 'admin';
    document.getElementById('adminPass').value = 'wrong_password';
    doAdminLogin();
    expect(document.getElementById('adminPass').value).toBe('');
  });

  test('❌ contraseña es case-sensitive', () => {
    document.getElementById('adminUser').value = 'admin';
    document.getElementById('adminPass').value = 'aswa2025admin#'; // todo minúsculas
    expect(doAdminLogin()).toEqual({ success: false, reason: 'invalid_credentials' });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SUITE 2: verifyPin — Verificación de PIN de 4 dígitos
// ═══════════════════════════════════════════════════════════════════════════

describe('verifyPin()', () => {
  beforeEach(() => setupDOM());

  function fillPin(p1, p2, p3, p4) {
    document.getElementById('pin1').value = p1 ?? '';
    document.getElementById('pin2').value = p2 ?? '';
    document.getElementById('pin3').value = p3 ?? '';
    document.getElementById('pin4').value = p4 ?? '';
  }

  // ── Flujo exitoso ─────────────────────────────────────────────────────

  test('✅ PIN correcto (1234) retorna success:true', () => {
    fillPin('1', '2', '3', '4');
    expect(verifyPin()).toEqual({ success: true });
  });

  test('✅ PIN correcto oculta el overlay', () => {
    document.getElementById('adminLogin').style.display = 'flex';
    fillPin('1', '2', '3', '4');
    verifyPin();
    expect(document.getElementById('adminLogin').style.display).toBe('none');
  });

  // ── Casos límite / errores ────────────────────────────────────────────

  test('❌ PIN incorrecto retorna wrong_pin', () => {
    fillPin('0', '0', '0', '0');
    expect(verifyPin()).toEqual({ success: false, reason: 'wrong_pin' });
  });

  test('❌ PIN incorrecto limpia todos los inputs', () => {
    fillPin('0', '0', '0', '0');
    verifyPin();
    for (let i = 1; i <= 4; i++) {
      expect(document.getElementById(`pin${i}`).value).toBe('');
    }
  });

  test('❌ PIN incompleto (2 dígitos) retorna incomplete_pin', () => {
    fillPin('8', '5');
    expect(verifyPin()).toEqual({ success: false, reason: 'incomplete_pin' });
  });

  test('❌ todos los inputs vacíos retorna incomplete_pin', () => {
    expect(verifyPin()).toEqual({ success: false, reason: 'incomplete_pin' });
  });

  test('❌ dígitos correctos en orden incorrecto retorna wrong_pin', () => {
    fillPin('4', '3', '2', '1'); // invertido
    expect(verifyPin()).toEqual({ success: false, reason: 'wrong_pin' });
  });

  test('❌ un solo dígito diferente al final falla', () => {
    fillPin('1', '2', '3', '9'); // pin4 incorrecto
    expect(verifyPin()).toEqual({ success: false, reason: 'wrong_pin' });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SUITE 3: Navegación entre formularios
// ═══════════════════════════════════════════════════════════════════════════

describe('Navegación entre formularios', () => {
  beforeEach(() => {
    setupDOM();
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('pinForm').style.display  = 'none';
  });

  test('✅ showPinLogin() oculta loginForm y muestra pinForm', () => {
    showPinLogin();
    expect(document.getElementById('loginForm').style.display).toBe('none');
    expect(document.getElementById('pinForm').style.display).toBe('block');
  });

  test('✅ showNormalLogin() oculta pinForm y muestra loginForm', () => {
    showPinLogin();
    showNormalLogin();
    expect(document.getElementById('pinForm').style.display).toBe('none');
    expect(document.getElementById('loginForm').style.display).toBe('block');
  });

  test('✅ showNormalLogin() limpia los dígitos del PIN', () => {
    document.getElementById('pin1').value = '8';
    document.getElementById('pin2').value = '5';
    showNormalLogin();
    for (let i = 1; i <= 4; i++) {
      expect(document.getElementById(`pin${i}`).value).toBe('');
    }
  });

  test('✅ flujo completo loginForm → pinForm → loginForm', () => {
    showPinLogin();
    expect(document.getElementById('pinForm').style.display).toBe('block');
    showNormalLogin();
    expect(document.getElementById('loginForm').style.display).toBe('block');
    expect(document.getElementById('pinForm').style.display).toBe('none');
  });

  test('✅ closeAdminLogin() oculta el overlay', () => {
    document.getElementById('adminLogin').style.display = 'flex';
    closeAdminLogin();
    expect(document.getElementById('adminLogin').style.display).toBe('none');
  });

  test('✅ closeAdminLogin() limpia usuario, contraseña y PIN', () => {
    document.getElementById('adminUser').value = 'admin';
    document.getElementById('adminPass').value = 'secret';
    document.getElementById('pin1').value      = '8';
    closeAdminLogin();
    expect(document.getElementById('adminUser').value).toBe('');
    expect(document.getElementById('adminPass').value).toBe('');
    expect(document.getElementById('pin1').value).toBe('');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SUITE 4: Navegación por teclado en el PIN
// ═══════════════════════════════════════════════════════════════════════════

describe('Navegación por teclado en el PIN', () => {
  beforeEach(() => setupDOM());

  test('✅ movePinFocus avanza al siguiente input al escribir un dígito', () => {
    document.getElementById('pin1').value = '8';
    movePinFocus(1);
    expect(document.activeElement.id).toBe('pin2');
  });

  test('✅ movePinFocus no avanza más allá del pin4', () => {
    document.getElementById('pin4').value = '1';
    expect(() => movePinFocus(4)).not.toThrow();
  });

  test('✅ handlePinBackspace retrocede el foco al presionar Backspace en campo vacío', () => {
    document.getElementById('pin2').focus();
    document.getElementById('pin2').value = '';
    const event = new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true });
    const spy = jest.spyOn(event, 'preventDefault');
    handlePinBackspace(event, 2);
    expect(document.activeElement.id).toBe('pin1');
    expect(spy).toHaveBeenCalled();
  });

  test('✅ handlePinBackspace no retrocede si el campo tiene valor', () => {
    document.getElementById('pin2').focus();
    document.getElementById('pin2').value = '5';
    const event = new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true });
    handlePinBackspace(event, 2);
    expect(document.activeElement.id).toBe('pin2');
  });

  test('✅ handlePinBackspace no lanza error desde pin1', () => {
    document.getElementById('pin1').focus();
    document.getElementById('pin1').value = '';
    const event = new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true });
    expect(() => handlePinBackspace(event, 1)).not.toThrow();
  });
});

/**
 * js/login.js
 *
 * Lógica de autenticación extraída del HTML inline.
 * Se exporta con module.exports para que Jest pueda importarla.
 *
 * En el HTML, carga este archivo así:
 *   <script src="js/login.js"></script>
 * (en el navegador, module.exports se ignora silenciosamente)
 */

const ADMIN_PIN = '8521';

const ADMIN_CREDENTIALS = {
  admin:    'ASWA2025Admin#',
  delivery: 'ASWA2025Delivery#',
};

// ── Visibilidad del overlay ───────────────────────────────────────────────

function showAdminLogin() {
  document.getElementById('adminLogin').style.display = 'flex';
  document.getElementById('adminUser').focus();
}

function closeAdminLogin() {
  document.getElementById('adminLogin').style.display = 'none';
  clearLoginForm();
}

// ── Limpieza de campos ────────────────────────────────────────────────────

function clearLoginForm() {
  document.getElementById('adminUser').value = '';
  document.getElementById('adminPass').value = '';
  clearPinInputs();
}

function clearPinInputs() {
  for (let i = 1; i <= 4; i++) {
    document.getElementById(`pin${i}`).value = '';
  }
}

// ── Toggle de contraseña ──────────────────────────────────────────────────

function togglePassword() {
  const passInput = document.getElementById('adminPass');
  passInput.type = passInput.type === 'password' ? 'text' : 'password';
}

// ── Navegación entre formularios ──────────────────────────────────────────

function showPinLogin() {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('pinForm').style.display = 'block';
  document.getElementById('pin1').focus();
}

function showNormalLogin() {
  document.getElementById('pinForm').style.display = 'none';
  document.getElementById('loginForm').style.display = 'block';
  clearPinInputs();
  document.getElementById('adminUser').focus();
}

// ── Login usuario / contraseña ────────────────────────────────────────────

function doAdminLogin() {
  const user = document.getElementById('adminUser').value.trim();
  const pass = document.getElementById('adminPass').value;

  if (!user || !pass) {
    return { success: false, reason: 'empty_fields' };
  }

  if (ADMIN_CREDENTIALS[user] === pass) {
    closeAdminLogin();
    return { success: true, role: user };
  }

  document.getElementById('adminPass').value = '';
  return { success: false, reason: 'invalid_credentials' };
}

// ── Verificación de PIN ───────────────────────────────────────────────────

function verifyPin() {
  const pin =
    document.getElementById('pin1').value +
    document.getElementById('pin2').value +
    document.getElementById('pin3').value +
    document.getElementById('pin4').value;

  if (pin.length !== 4) {
    return { success: false, reason: 'incomplete_pin' };
  }

  if (pin === ADMIN_PIN) {
    closeAdminLogin();
    return { success: true };
  }

  clearPinInputs();
  return { success: false, reason: 'wrong_pin' };
}

// ── Navegación por teclado en el PIN ─────────────────────────────────────

function movePinFocus(current) {
  const currentInput = document.getElementById(`pin${current}`);
  if (currentInput.value.length === 1 && current < 4) {
    document.getElementById(`pin${current + 1}`).focus();
  }
  if (current === 4 && currentInput.value.length === 1) {
    setTimeout(verifyPin, 300);
  }
}

function handlePinBackspace(event, current) {
  if (event.key === 'Backspace') {
    const currentInput = document.getElementById(`pin${current}`);
    if (currentInput.value === '' && current > 1) {
      event.preventDefault();
      document.getElementById(`pin${current - 1}`).focus();
    }
  }
}

// ── Exportación (para Jest) ───────────────────────────────────────────────

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ADMIN_PIN,
    ADMIN_CREDENTIALS,
    showAdminLogin,
    closeAdminLogin,
    clearLoginForm,
    clearPinInputs,
    togglePassword,
    showPinLogin,
    showNormalLogin,
    doAdminLogin,
    verifyPin,
    movePinFocus,
    handlePinBackspace,
  };
}

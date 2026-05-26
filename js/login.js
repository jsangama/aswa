/**
 * Legacy login helpers used by Jest and optional browser login wiring.
 */

function getConfig() {
  if (typeof window !== 'undefined' && window.ASWA_CONFIG) {
    return window.ASWA_CONFIG;
  }

  if (typeof global !== 'undefined' && global.ASWA_CONFIG) {
    return global.ASWA_CONFIG;
  }

  return {};
}

function getAdminCredentials() {
  const config = getConfig();
  return config.ADMIN_CREDENTIALS || {};
}

function getAdminPin() {
  return getConfig().ADMIN_PIN || getConfig().DELIVERY_PIN || '';
}

function showAdminLogin() {
  document.getElementById('adminLogin').style.display = 'flex';
  document.getElementById('adminUser').focus();
}

function closeAdminLogin() {
  document.getElementById('adminLogin').style.display = 'none';
  clearLoginForm();
}

function clearLoginForm() {
  document.getElementById('adminUser').value = '';
  document.getElementById('adminPass').value = '';
  clearPinInputs();
}

function clearPinInputs() {
  for (let i = 1; i <= 4; i += 1) {
    document.getElementById(`pin${i}`).value = '';
  }
}

function togglePassword() {
  const passInput = document.getElementById('adminPass');
  passInput.type = passInput.type === 'password' ? 'text' : 'password';
}

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

function doAdminLogin() {
  const user = document.getElementById('adminUser').value.trim();
  const pass = document.getElementById('adminPass').value;

  if (!user || !pass) {
    return { success: false, reason: 'empty_fields' };
  }

  if (getAdminCredentials()[user] === pass) {
    closeAdminLogin();
    return { success: true, role: user };
  }

  document.getElementById('adminPass').value = '';
  return { success: false, reason: 'invalid_credentials' };
}

function verifyPin() {
  const pin =
    document.getElementById('pin1').value +
    document.getElementById('pin2').value +
    document.getElementById('pin3').value +
    document.getElementById('pin4').value;

  if (pin.length !== 4) {
    return { success: false, reason: 'incomplete_pin' };
  }

  if (pin === getAdminPin()) {
    closeAdminLogin();
    return { success: true };
  }

  clearPinInputs();
  return { success: false, reason: 'wrong_pin' };
}

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
  if (event.key !== 'Backspace') return;

  const currentInput = document.getElementById(`pin${current}`);
  if (currentInput.value === '' && current > 1) {
    event.preventDefault();
    document.getElementById(`pin${current - 1}`).focus();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getAdminCredentials,
    getAdminPin,
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

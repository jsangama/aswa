/**
 * tests/helpers/setup-dom.js
 *
 * Monta el DOM mínimo que necesita login.js.
 * Importado en cada archivo de prueba con:
 *   const { setupDOM } = require('./helpers/setup-dom');
 */

function setupDOM() {
  document.body.innerHTML = `
    <div id="adminLogin" style="display:none;">

      <div id="loginForm" style="display:block;">
        <input id="adminUser" type="text"     value="" />
        <input id="adminPass" type="password" value="" />
      </div>

      <div id="pinForm" style="display:none;">
        <input id="pin1" type="tel" maxlength="1" value="" />
        <input id="pin2" type="tel" maxlength="1" value="" />
        <input id="pin3" type="tel" maxlength="1" value="" />
        <input id="pin4" type="tel" maxlength="1" value="" />
      </div>

    </div>
  `;
}

module.exports = { setupDOM };

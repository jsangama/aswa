# 🧪 Tests — ASWA Login

Pruebas unitarias para el módulo de autenticación (`js/login.js`).  
Framework: **Jest 29** con entorno **jsdom**.

---

## 📂 Estructura

```
tu-proyecto/
│
├── js/
│   └── login.js              ← Lógica extraída del HTML (fuente a probar)
│
├── tests/
│   ├── helpers/
│   │   └── setup-dom.js      ← Monta el DOM simulado para cada test
│   └── login.test.js         ← 27 pruebas unitarias
│
├── package.json
└── README-TESTS.md
```

---

## ⚡ Instalación

```bash
# 1. En la raíz del proyecto
npm install
```

Eso instala `jest` y `jest-environment-jsdom` como dependencias de desarrollo.

---

## ▶️ Comandos

| Comando | Descripción |
|---------|-------------|
| `npm test` | Ejecuta todas las pruebas una vez |
| `npm run test:watch` | Modo vigilancia: re-ejecuta al guardar |
| `npm run test:coverage` | Pruebas + informe de cobertura |

---

## 🗂️ Suites cubiertas

### Suite 1 — `doAdminLogin()` (10 tests)
Autenticación con usuario y contraseña.

| Caso | Esperado |
|------|----------|
| `admin` + contraseña correcta | `{ success: true, role: 'admin' }` |
| `delivery` + contraseña correcta | `{ success: true, role: 'delivery' }` |
| Login exitoso | Overlay oculto, campos limpios |
| Usuario vacío | `{ success: false, reason: 'empty_fields' }` |
| Contraseña vacía | `{ success: false, reason: 'empty_fields' }` |
| Solo espacios en usuario | `{ success: false, reason: 'empty_fields' }` |
| Contraseña incorrecta | `{ success: false, reason: 'invalid_credentials' }` |
| Usuario inexistente | `{ success: false, reason: 'invalid_credentials' }` |
| Error → campo password | Se limpia automáticamente |
| Contraseña en minúsculas | `{ success: false, reason: 'invalid_credentials' }` |

### Suite 2 — `verifyPin()` (7 tests)
Verificación del PIN de 4 dígitos.

| Caso | Esperado |
|------|----------|
| PIN `8521` correcto | `{ success: true }` |
| PIN correcto | Overlay oculto |
| PIN incorrecto | `{ success: false, reason: 'wrong_pin' }` |
| PIN incorrecto | Inputs limpiados |
| PIN incompleto (2 dígitos) | `{ success: false, reason: 'incomplete_pin' }` |
| Inputs vacíos | `{ success: false, reason: 'incomplete_pin' }` |
| Dígitos correctos, orden incorrecto | `{ success: false, reason: 'wrong_pin' }` |

### Suite 3 — Navegación entre formularios (6 tests)
Transiciones entre el form de usuario/contraseña y el form de PIN.

- `showPinLogin()` → oculta loginForm, muestra pinForm
- `showNormalLogin()` → operación inversa + limpia PIN
- Flujo completo de ida y vuelta
- `closeAdminLogin()` → oculta overlay y limpia todo

### Suite 4 — Teclado en el PIN (5 tests)
Usabilidad del ingreso de PIN.

- `movePinFocus` avanza al siguiente campo al escribir
- No avanza más allá del pin4
- `handlePinBackspace` retrocede desde campo vacío
- No retrocede si el campo tiene valor
- No lanza error desde el primer campo

---

## 🔧 Integrar `login.js` en tu HTML

Reemplaza el `<script>` inline del login por:

```html
<!-- Al final, antes de </body> -->
<script src="js/login.js"></script>
```

El archivo detecta si está en Node.js (Jest) o en el navegador y se comporta
correctamente en ambos entornos gracias a:

```js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ... };
}
```

---

## 📊 Cobertura mínima configurada

```
Líneas:     80 %
Funciones:  80 %
Ramas:      70 %
```

Si la cobertura cae por debajo, `npm run test:coverage` fallará con error.

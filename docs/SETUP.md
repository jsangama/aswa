# ASWA Platform - Setup

## Requisitos

- Node.js 16 o superior
- npm 7 o superior
- Git
- Navegador moderno

## Configuracion local

1. Instala dependencias:

```bash
npm install
```

2. Crea configuracion local para credenciales cuando trabajes en local:

```bash
cp .env.example .env
cp js/local-config.example.js js/local-config.js
```

3. En desarrollo local, carga `js/local-config.js` antes de `js/app-config.js` o pega sus valores temporalmente en la consola. Edita `js/local-config.js` con tus valores reales:

```javascript
window.ASWA_CONFIG = {
  ...(window.ASWA_CONFIG || {}),
  // Solo para pruebas locales con PIN/password legacy.
  // En produccion debe quedar false o no definirse.
  ALLOW_LEGACY_LOCAL_ACCESS: true,
  ADMIN_PIN: '1234',
  DELIVERY_PIN: '1234',
  ADMIN_CREDENTIALS: {
    admin: 'tu-password-admin',
    delivery: 'tu-password-delivery',
  },
};
```

`js/local-config.js` esta en `.gitignore` para que no se publique. La app no lo solicita automaticamente, asi se evitan errores 404 en GitHub Pages. Si no cargas una configuracion privada antes de `js/app-config.js`, los accesos privados que dependan de PIN/password no estaran habilitados. En produccion, Admin/Delivery/TV deben usar Firebase Auth y roles operativos.

4. Ejecuta localmente:

```bash
npm run dev
```

Luego abre `http://localhost:8080`.

## Tests

```bash
npm test
npm run test:coverage
```

## Estructura

```text
assets/images/
  icons/      Iconos PWA
  logos/      Bancos, QR y medios de pago
  misc/       Capturas y piezas no centrales
  products/   Logo ASWA y productos
docs/         Documentacion
js/           Compatibilidad legacy y config publica
src/modules/  Modulos nuevos
tests/        Tests unitarios
```

## Seguridad

- No publiques `.env`.
- No publiques `js/local-config.js`.
- Cambia los PIN y passwords antes de usar en produccion.
- No actives `ALLOW_LEGACY_LOCAL_ACCESS` fuera de localhost.
- Las claves Firebase de frontend son publicas por naturaleza; protege datos con reglas de Firestore/Storage.
- No agregues nuevas credenciales dentro de `index.html`, `ugc.html` o archivos versionados.

## Firebase Auth local

Si pruebas en `127.0.0.1:8094` o `localhost` y Firebase Auth muestra que el dominio esta bloqueado, agrega ese host en Firebase Console > Authentication > Settings > Authorized domains. La app mostrara el dominio exacto que debes autorizar.

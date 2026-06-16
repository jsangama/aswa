# ASWA Platform - Architecture

ASWA sigue siendo una aplicacion estatica HTML/CSS/JavaScript con Firebase, pero la direccion nueva es modular: `index.html` queda como shell legacy mientras la logica se mueve por dominios a `src/`.

## Capas

- `index.html`: shell legacy de la experiencia principal. Debe ir perdiendo responsabilidades en migraciones pequenas.
- `ugc.html`: experiencia UGC y flujo relacionado.
- `js/app-config.js`: configuracion publica versionada.
- `js/local-config.js`: configuracion local sensible, ignorada por Git y cargada manualmente solo en entornos privados.
- `src/main.js`: entrada modular cargada por `index.html`.
- `src/modules`: modulos por dominio para ir separando logica de negocio.
- `assets/images`: imagenes fuera de la raiz para reducir desorden.
- `docs/archive`: copias historicas o archivos de referencia que no deben competir con la app principal.

## Modulos nuevos

- `app-shell.js`: registro de modulos y estado de preparacion.
- `storage.js`: adaptador de `localStorage` con prefijo por negocio.
- `catalog.js`: catalogo publico y consulta de productos por dominio.
- `purchase-flow.js`: estados del flujo de compra progresivo.
- `pwa-cache.js`: helpers para versionar PWA y refrescar clientes instalados.
- `auth.js`: login admin/delivery usando `window.ASWA_CONFIG`.
- `orders.js`: carrito, totales y persistencia por `BUSINESS_ID`.
- `loyalty.js`: niveles y descuentos.
- `ugc.js`: flujo de aprobacion de contenido.

## Regla De Migracion

Cada nueva funcionalidad debe nacer en `src/modules` cuando sea posible. Si todavia depende del HTML legacy, se expone desde `window.ASWA.modules` y luego se reemplazan las funciones inline por llamadas al modulo.

La migracion segura es:

1. Extraer una funcion pura a `src/modules`.
2. Cubrirla con pruebas o una prueba de contrato.
3. Conectarla desde `src/main.js`.
4. Reemplazar el bloque inline de `index.html` solo cuando el comportamiento ya este verificado.

## Compatibilidad

Los archivos en `js/` se mantienen para no romper la version actual. La migracion debe continuar moviendo funciones desde HTML inline hacia `src/modules` en cambios pequenos y probados.

## Firebase

La inicializacion principal vive en `index.html` y `ugc.html`, leyendo `window.ASWA_CONFIG.FIREBASE`.

`js/app-config.js` carga defaults publicos y combina cualquier `window.ASWA_CONFIG` ya existente. No solicita archivos ignorados, para evitar 404 en Firebase Hosting.

`dist/` es el artefacto generado para Firebase Hosting y contiene solo los archivos publicos necesarios. El build copia `src/` porque `index.html` carga `src/main.js` como modulo.

Las claves Firebase usadas en frontend no deben tratarse como secreto. La seguridad real debe estar en reglas de Firebase, autenticacion y validaciones del backend.

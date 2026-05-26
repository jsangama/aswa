# ASWA Platform - Architecture

ASWA sigue siendo una aplicacion estatica HTML/CSS/JavaScript con Firebase.

## Capas

- `index.html`: experiencia principal de pedidos, admin y delivery.
- `ugc.html`: experiencia UGC y flujo relacionado.
- `js/app-config.js`: configuracion publica versionada.
- `js/local-config.js`: configuracion local sensible, ignorada por Git y cargada manualmente solo en entornos privados.
- `src/modules`: modulos nuevos para ir separando logica de negocio.
- `assets/images`: imagenes fuera de la raiz para reducir desorden.
- `docs/archive`: copias historicas o archivos de referencia que no deben competir con la app principal.

## Modulos nuevos

- `auth.js`: login admin/delivery usando `window.ASWA_CONFIG`.
- `orders.js`: carrito, totales y persistencia por `BUSINESS_ID`.
- `loyalty.js`: niveles y descuentos.
- `ugc.js`: flujo de aprobacion de contenido.

## Compatibilidad

Los archivos en `js/` se mantienen para no romper la version actual. La migracion debe continuar moviendo funciones desde HTML inline hacia `src/modules` en cambios pequenos y probados.

## Firebase

La inicializacion principal vive en `index.html` y `ugc.html`, leyendo `window.ASWA_CONFIG.FIREBASE`.

`js/app-config.js` carga defaults publicos y combina cualquier `window.ASWA_CONFIG` ya existente. No solicita archivos ignorados, para evitar 404 en GitHub Pages.

Las claves Firebase usadas en frontend no deben tratarse como secreto. La seguridad real debe estar en reglas de Firebase, autenticacion y validaciones del backend.

# ASWA Platform - Architecture

ASWA sigue siendo una aplicacion estatica HTML/CSS/JavaScript con Firebase, pero la direccion nueva es modular: `index.html` queda como shell legacy mientras la logica se mueve por dominios a `src/`.

La guia de producto viva esta en [PRODUCT_BRIEF.md](PRODUCT_BRIEF.md): mision, vision, problema, solucion, modulos principales y objetivo comercial.

## Capas

- `index.html`: shell legacy de la experiencia principal. Debe ir perdiendo responsabilidades en migraciones pequenas.
- `ugc.html`: experiencia UGC y flujo relacionado.
- `js/app-config.js`: configuracion publica versionada.
- `js/local-config.js`: configuracion local sensible, ignorada por Git y cargada manualmente solo en entornos privados.
- `src/main.js`: entrada modular cargada por `index.html`.
- `src/modules`: modulos por dominio para ir separando logica de negocio.
- `src/components`: componentes de UI reutilizables, sin reglas de negocio.
- `src/pages`: orquestadores de pantallas; conectan estado, modulos y componentes.
- `assets/images`: imagenes fuera de la raiz para reducir desorden.
- `docs/archive`: copias historicas o archivos de referencia que no deben competir con la app principal.

## Modulos nuevos

- `app-shell.js`: registro de modulos y estado de preparacion.
- `storage.js`: adaptador de `localStorage` con prefijo por negocio.
- `catalog.js`: catalogo publico y consulta de productos por dominio.
- `purchase-flow.js`: estados del flujo de compra progresivo.
- `delivery-options.js`: reglas de zona, recojo en local y direccion requerida/opcional.
- `pwa-cache.js`: helpers para versionar PWA y refrescar clientes instalados.
- `payment-methods.js`: reglas de metodos de pago, bancos, textos y calculo de vuelto.
- `auth.js`: login admin/delivery usando `window.ASWA_CONFIG`.
- `orders.js`: carrito, totales y persistencia por `BUSINESS_ID`.
- `loyalty.js`: niveles y descuentos.
- `ugc.js`: flujo de aprobacion de contenido.

## Paginas Y Componentes

- `pages/payment-page.js`: pantalla de metodos de pago. Lee el estado legacy y delega la vista del total.
- `components/payment-total-card.js`: actualiza los elementos visibles del monto total y vuelto sin conocer reglas de negocio.
- `pages/delivery-page.js`: pantalla de datos/zona. Lee la zona seleccionada y delega la direccion.
- `components/delivery-address-field.js`: actualiza label, placeholder, required y ayuda del campo direccion.

## Regla De Migracion

Cada nueva funcionalidad debe nacer en `src/modules` cuando sea posible. Si todavia depende del HTML legacy, se expone desde `window.ASWA.modules` y luego se reemplazan las funciones inline por llamadas al modulo.

La migracion segura es:

1. Extraer una funcion pura a `src/modules`.
2. Si toca UI, crear o reutilizar un componente en `src/components`.
3. Si corresponde a una pantalla, conectarla desde `src/pages`.
4. Cubrirla con pruebas o una prueba de contrato.
5. Conectarla desde `src/main.js`.
6. Reemplazar el bloque inline de `index.html` solo cuando el comportamiento ya este verificado.

## Compatibilidad

Los archivos en `js/` se mantienen para no romper la version actual. La migracion debe continuar moviendo funciones desde HTML inline hacia `src/modules` en cambios pequenos y probados.

## Firebase

La inicializacion principal vive en `index.html` y `ugc.html`, leyendo `window.ASWA_CONFIG.FIREBASE`.

`js/app-config.js` carga defaults publicos y combina cualquier `window.ASWA_CONFIG` ya existente. No solicita archivos ignorados, para evitar 404 en Firebase Hosting.

`dist/` es el artefacto generado para Firebase Hosting y contiene solo los archivos publicos necesarios. El build copia `src/` porque `index.html` carga `src/main.js` como modulo.

Las claves Firebase usadas en frontend no deben tratarse como secreto. La seguridad real debe estar en reglas de Firebase, autenticacion y validaciones del backend.

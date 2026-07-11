# ASWA Platform - Architecture

ASWA sigue siendo una aplicacion estatica HTML/CSS/JavaScript con Firebase, pero la direccion nueva es modular y feature-based: `index.html` queda como shell limpio y la funcionalidad vive en `src/`.

Este proyecto esta distribuido en multiples archivos y carpetas, siguiendo una arquitectura modular. No se concentra toda la logica en un unico `index.html`, sino que se organiza en componentes, servicios y paginas independientes para facilitar el mantenimiento y la escalabilidad.

La arquitectura separa interfaz, logica de negocio, estado compartido y acceso a Firebase. Cada modulo debe cargar solo lo que necesita y debe poder evolucionar sin afectar a las demas funcionalidades.

La guia de producto viva esta en [PRODUCT_BRIEF.md](PRODUCT_BRIEF.md): mision, vision, problema, solucion, modulos principales y objetivo comercial.

## Capas

- `index.html`: shell de arranque. Solo contiene metadatos minimos, `<div id="app"></div>` y `src/app/main.js`.
- `ugc.html`: experiencia UGC y flujo relacionado.
- `js/app-config.js`: configuracion publica versionada.
- `js/local-config.js`: configuracion local sensible, ignorada por Git y cargada manualmente solo en entornos privados.
- `src/app`: entrada principal, router y definicion de rutas.
- `src/layouts`: layouts reutilizables para app, admin y delivery.
- `src/features`: funcionalidades autonomas por dominio.
- `src/shared`: componentes, servicios, utilidades, store y estilos compartidos.
- `src/features/legacy`: experiencia actual aislada mientras se extraen features reales.
- `src/main.js`: entrada legacy cargada dentro de `features/legacy`.
- `src/modules`: servicios legacy ya extraidos; se iran moviendo a features.
- `src/components`: componentes legacy reutilizables, sin reglas de negocio.
- `src/pages`: orquestadores legacy de pantallas; conectan estado, modulos y componentes.
- `assets/images`: imagenes fuera de la raiz para reducir desorden.
- `docs/archive`: copias historicas o archivos de referencia que no deben competir con la app principal.

## Estructura Feature-Based

```text
src/
|-- app/
|-- layouts/
|-- shared/
|   |-- components/
|   |-- services/
|   |-- utils/
|   |-- store/
|   |-- styles/
|-- features/
|   |-- catalog/
|   |-- cart/
|   |-- checkout/
|   |-- payment/
|   |-- delivery/
|   |-- orders/
|   |-- customers/
|   |-- auth/
|   |-- admin/
|   |-- reports/
|   |-- ugc/
|   |-- legacy/
|-- assets/
```

## Modulos legacy ya extraidos

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

Cada nueva funcionalidad debe nacer en `src/features/<feature>`. Si necesita piezas compartidas, estas van en `src/shared`. Si todavia depende del HTML legacy, se conecta desde `src/features/legacy` y luego se reemplazan las funciones inline por llamadas a la feature.

La migracion segura es:

1. Extraer una funcion pura al servicio de su feature.
2. Si toca UI, crear o reutilizar un componente dentro de la feature.
3. Si varias features lo necesitan, moverlo a `src/shared`.
4. Cubrirla con pruebas o una prueba de contrato.
5. Conectarla desde `src/app/router.js` o desde el feature legacy mientras convivan.
6. Reemplazar el bloque inline de `src/features/legacy/legacy-shell.html` solo cuando el comportamiento ya este verificado.

## Compatibilidad

Los archivos en `js/` y `src/features/legacy/legacy-shell.html` se mantienen para no romper la version actual. La migracion debe continuar moviendo funciones desde HTML inline hacia features autonomas en cambios pequenos y probados.

## Firebase

La inicializacion principal de la experiencia legacy vive en `src/features/legacy/legacy-shell.html` y `ugc.html`, leyendo `window.ASWA_CONFIG.FIREBASE`.

`js/app-config.js` carga defaults publicos y combina cualquier `window.ASWA_CONFIG` ya existente. No solicita archivos ignorados, para evitar 404 en Firebase Hosting.

`dist/` es el artefacto generado para Firebase Hosting y contiene solo los archivos publicos necesarios. El build copia `src/` porque `index.html` carga `src/app/main.js` como modulo.

Las claves Firebase usadas en frontend no deben tratarse como secreto. La seguridad real debe estar en reglas de Firebase, autenticacion y validaciones del backend.

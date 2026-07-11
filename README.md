# ASWA - Sistema Digital de Pedidos | La Rica Chicha

Tradicion amazonica con tecnologia moderna.

ASWA es una plataforma digital de pedidos para modernizar la venta de chicha y productos tradicionales, integrando catalogo, carrito, delivery, pagos, clientes, fidelizacion, administracion y contenido generado por clientes.

Actualmente esta implementada para La Rica Chicha en Morales y Tarapoto, Peru.

## Ubicacion Y Contacto

Direccion: Jr. Sargento Lores #425, Morales - Tarapoto, Peru

Referencia: cerca al parque central de Morales

Pedidos por WhatsApp:

- +51 955 273 229
- +51 986 445 531

Pagos via Yape:

- +51 947 999 736

## Funcionalidades Principales

### Sistema De Ventas

- Catalogo interactivo de productos ASWA.
- Carrito dinamico.
- Total estimado desde el inicio con zona y delivery.
- Recojo en local sin pedir direccion obligatoria.
- Flujo progresivo: productos, zona/datos, pago y resumen.
- Generacion de pedido con datos listos para gestion interna.

### Delivery Y Zonas

- Morales.
- Tarapoto.
- Banda de Shilcayo.
- Recojo en local.
- Envio nacional coordinado.
- Chicha ASWA 400 ml publica y Programa Institucional privado con codigo.

### Metodos De Pago

- Efectivo al recibir con calculo de vuelto.
- Yape, Plin y otras billeteras.
- Transferencias bancarias.
- Monto final visible en la pantalla de pago.
- Comprobante obligatorio para billeteras y bancos.

### Gestion De Pedidos

- Registro automatico en Firebase.
- Estados de pedido: pendiente, pagado, en reparto, confirmado y cerrado.
- Panel administrativo privado.
- Panel de deliverista.
- Seguimiento y herramientas operativas.

### Fidelizacion Y Crecimiento

- Referidos.
- Beneficios por cliente.
- Niveles de fidelizacion.
- Promociones.
- UGC: contenido generado por clientes.
- Soporte y asistente informativo.

## Arquitectura Actual

El proyecto ya no debe crecer como un solo `index.html`. La direccion tecnica es modular y escalable.

Este proyecto utiliza una arquitectura modular. Esta distribuido en multiples archivos y carpetas, con componentes, servicios y paginas independientes, en lugar de concentrar todo en un unico `index.html`. Esto facilita su mantenimiento y escalabilidad.

La logica de la aplicacion se organiza por responsabilidades: pantallas, componentes reutilizables, servicios de datos, estado compartido y funcionalidades independientes. Esta estructura prepara ASWA para crecer como plataforma SaaS sin volver a depender de un archivo gigante.

`index.html` ahora es solo el shell de arranque: contiene `<div id="app"></div>` y carga `src/app/main.js`. La experiencia actual vive temporalmente en `src/features/legacy/legacy-shell.html` mientras se migra feature por feature.

```text
.
|-- index.html
|-- ugc.html
|-- src/
|   |-- app/
|   |   |-- main.js
|   |   |-- router.js
|   |   |-- routes.js
|   |-- layouts/
|   |   |-- app-layout.js
|   |   |-- admin-layout.js
|   |   |-- delivery-layout.js
|   |-- features/
|   |   |-- catalog/
|   |   |-- cart/
|   |   |-- checkout/
|   |   |-- payment/
|   |   |-- delivery/
|   |   |-- orders/
|   |   |-- customers/
|   |   |-- auth/
|   |   |-- admin/
|   |   |-- reports/
|   |   |-- ugc/
|   |   |-- legacy/
|   |-- shared/
|   |   |-- components/
|   |   |-- services/
|   |   |-- utils/
|   |   |-- store/
|   |   |-- styles/
|   |-- main.js
|   |-- modules/
|   |   |-- app-shell.js
|   |   |-- cart.js
|   |   |-- catalog.js
|   |   |-- delivery-options.js
|   |   |-- payment-methods.js
|   |   |-- purchase-flow.js
|   |   |-- pwa-cache.js
|   |   |-- storage.js
|   |-- components/
|   |   |-- delivery-address-field.js
|   |   |-- payment-total-card.js
|   |-- pages/
|       |-- delivery-page.js
|       |-- payment-page.js
|-- js/
|   |-- app-config.js
|-- assets/images/
|-- docs/
|-- tests/
|-- scripts/
|-- functions/
```

### Capas

- `src/app`: arranque, rutas y router de la aplicacion.
- `src/features`: funcionalidades autonomas por dominio.
- `src/shared`: componentes, servicios, utilidades y store compartidos.
- `src/layouts`: layouts reutilizables para app, admin y delivery.
- `src/modules`: servicios legacy ya extraidos, usados por features durante la migracion.
- `src/components`: componentes legacy reutilizables.
- `src/pages`: orquestadores legacy de pantallas.
- `src/main.js`: entrada legacy que registra `window.ASWA.modules` dentro de `features/legacy`.
- `index.html`: shell limpio de aplicacion.
- `dist/`: artefacto generado para Firebase Hosting.

### Modulos Migrados

- Carrito y calculo de totales.
- Flujo de compra progresivo.
- Metodos de pago y monto total visible.
- Zona, recojo en local y direccion opcional.
- Cache PWA.
- Storage con prefijo por negocio.
- Catalogo base.
- Shell limpio con router feature-based.
- Feature legacy aislado para no seguir creciendo el entrypoint.

Ver tambien:

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/PRODUCT_BRIEF.md](docs/PRODUCT_BRIEF.md)
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- [docs/GITHUB_SETUP.md](docs/GITHUB_SETUP.md)

## Tecnologias

Frontend:

- HTML5.
- CSS propio responsivo.
- JavaScript ES modules.
- PWA con service worker.

Backend y datos:

- Firebase Hosting.
- Cloud Firestore.
- Firebase Authentication.
- Firebase Storage.
- Cloud Functions.

Calidad y despliegue:

- Jest.
- GitHub Actions.
- Firebase CLI.
- Scripts de build y preflight en `scripts/`.

## Estado Actual

- MVP funcional.
- Sistema de pedidos activo.
- Flujo de compra guiado.
- Total con delivery visible antes de registrar datos.
- Metodos de pago con monto final.
- Panel administrativo.
- Panel de deliverista.
- Base de datos operativa en Firebase.
- Arquitectura en migracion modular.

## Vision

ASWA no es solo una tienda online. Es la base de una futura plataforma SaaS para que pequenos negocios puedan vender online, gestionar delivery, automatizar fidelizacion, generar comprobantes y escalar digitalmente.

La Rica Chicha es el primer caso real implementado.

## Filosofia

Tradicion y sabor en cada sorbo. Tecnologia y vision en cada pedido.

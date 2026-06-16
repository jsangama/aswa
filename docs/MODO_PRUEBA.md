# Modo prueba de pedidos ASWA

Este modo sirve para revisar el proceso completo de pedido, admin, delivery, confirmacion y nota de venta sin mezclarlo con pedidos reales.

## Donde va cada cosa

- GitHub: el modo prueba esta en `index.html`. Al publicar en Firebase Hosting, puedes usarlo desde el navegador.
- Firebase: usa colecciones separadas: `pedidos_prueba` y `clientes_prueba`.
- Firebase rules/indexes: `firestore.rules` y `firestore.indexes.json` incluyen esas colecciones separadas.

## Como abrirlo

Usa la pagina con este parametro:

```text
https://jsangama.github.io/aswa/?aswa_test=1
```

Tambien funciona:

```text
https://jsangama.github.io/aswa/?modo=prueba
```

## Que hace

- Guarda el pedido en Firebase, pero en `pedidos_prueba`.
- Guarda/actualiza cliente de prueba en `clientes_prueba`.
- No toca la coleccion real `pedidos`.
- No toca la coleccion real `clientes`.
- No abre WhatsApp automaticamente para evitar avisos reales por error.
- Admin, delivery, TV e historial consultan las colecciones de prueba cuando la URL tiene `?aswa_test=1`.
- La nota de venta muestra `MODO PRUEBA - Nota`.

## Como volver a pedidos reales

Cierra la nota de venta o abre la pagina normal:

```text
https://jsangama.github.io/aswa/
```

Si el navegador conserva datos antiguos, borra los datos del sitio o abre una ventana privada.

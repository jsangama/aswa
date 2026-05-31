# Modo prueba de pedidos ASWA

Este modo sirve para revisar el proceso completo de pedido, confirmacion y nota de venta sin registrar datos reales.

## Donde va cada cosa

- GitHub: el modo prueba esta en `index.html`. Al publicar GitHub Pages, puedes usarlo desde el navegador.
- Firebase: no necesita archivo nuevo. En modo prueba no crea documentos en `pedidos`, no actualiza `clientes` y no envia datos a Firestore.

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

- Guarda el pedido solo en el navegador del dispositivo.
- Marca el pedido con un ID local que empieza con `TEST-`.
- No abre WhatsApp automaticamente.
- No registra venta real en Firebase.
- La nota de venta muestra `MODO PRUEBA - Nota`.

## Como volver a pedidos reales

Cierra la nota de venta o abre la pagina normal:

```text
https://jsangama.github.io/aswa/
```

Si el navegador conserva datos antiguos, borra los datos del sitio o abre una ventana privada.

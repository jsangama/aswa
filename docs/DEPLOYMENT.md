# ASWA Deployment

ASWA se publica ahora en Firebase Hosting con dos entornos separados:

- `staging`: validacion previa y pruebas de despliegue.
- `production`: sitio publico real.

## Flujo GitHub Actions

- Push a `staging` despliega en el proyecto de staging.
- Push a `main` despliega en produccion.
- `workflow_dispatch` permite elegir manualmente `staging` o `production`.

## Recursos necesarios en GitHub

- Secret `FIREBASE_SERVICE_ACCOUNT`: JSON de una service account con acceso a ambos proyectos Firebase.
- Variable opcional `FIREBASE_PROJECT_STAGING`: por defecto `pedidos-aswa-peru-staging`.
- Variable opcional `FIREBASE_PROJECT_PRODUCTION`: por defecto `pedidos-aswa-peru`.

Ver la guia detallada en [docs/GITHUB_SETUP.md](GITHUB_SETUP.md).

## Build local del hosting

```bash
npm run build:hosting
```

Eso genera `dist/` con solo los archivos publicos necesarios para publicar la app.

## Preflight de despliegue

```bash
npm run deployment:preflight
```

Ese chequeo valida que el workflow, `firebase.json`, `.firebaserc` y la documentacion de despliegue sigan alineados.

## Sincronizar precios del catalogo

Si necesitas corregir los precios escolares canonicos en Firestore sin editar documentos a mano:

```bash
npm run catalogo:sync-school-prices -- --business aswa001 --dry-run yes
npm run catalogo:sync-school-prices -- --business aswa001
```

Ese comando deja en `S/ 2.50` el `solo juane escolar`, en `S/ 2.50` la `chicha ASWA 400 ml` y en `S/ 4.00` el `combo escolar sanjuanero`, respetando el negocio `aswa001`.

## Deploy manual

```bash
firebase deploy --only hosting,firestore:rules,firestore:indexes,storage --project pedidos-aswa-peru
```

Para staging cambia el `--project` por el proyecto correspondiente.

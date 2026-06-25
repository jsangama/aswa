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

Si `FIREBASE_SERVICE_ACCOUNT` no existe, el workflow valida tests/build y omite el deploy con un aviso. Esto evita dejar `main` en rojo mientras se configura la credencial.

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

Ese comando deja el catalogo general con `Chicha ASWA 400 ml` a `S/ 2.50` y la seccion institucional privada con `Pack Escolar ASWA 400 ml` a `S/ 30.00`, respetando el negocio `aswa001`.

## Deploy manual

```bash
firebase deploy --only hosting,firestore:rules,firestore:indexes --project pedidos-aswa-peru
```

Para staging cambia el `--project` por el proyecto correspondiente.

Firebase Storage se despliega aparte cuando el bucket del proyecto ya este inicializado en Firebase Console:

```bash
firebase deploy --only storage --project pedidos-aswa-peru
```

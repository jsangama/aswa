# GitHub Setup para ASWA

Este repositorio ya espera que GitHub Actions despliegue a Firebase Hosting.

## 1. Crea los entornos de GitHub

En `Settings > Environments`, crea:

- `staging`
- `production`

Recomendado:

- Deja `staging` sin revisores obligatorios.
- Agrega revisores obligatorios a `production` si quieres una aprobación manual antes de publicar.

## 2. Agrega el secret del repositorio

En `Settings > Secrets and variables > Actions`, agrega:

- `FIREBASE_SERVICE_ACCOUNT`

Valor:

- El JSON completo de una service account de Firebase con permisos para desplegar en los proyectos de staging y producción.

## 3. Agrega variables del repositorio

En `Settings > Secrets and variables > Actions > Variables`, agrega:

- `FIREBASE_PROJECT_STAGING` = `pedidos-aswa-peru-staging`
- `FIREBASE_PROJECT_PRODUCTION` = `pedidos-aswa-peru`

Si mantienes los valores por defecto del workflow, estas variables son opcionales. Igual conviene crearlas para verlas explícitamente en GitHub.

## 4. Relaciona ramas con entornos

- Los push a `staging` disparan el despliegue de staging.
- Los push a `main` disparan el despliegue de producción.
- El `workflow_dispatch` permite elegir `staging` o `production`.

## 5. Flujo recomendado

1. Abre un PR hacia `staging`.
2. Haz merge cuando CI pase.
3. Verifica el despliegue de staging.
4. Abre o mergea el PR de `staging` hacia `main`.
5. Aprueba y despliega producción.

## 6. Comprobaciones útiles

- `npm run deployment:preflight`
- `npm run build:hosting`
- `npm test -- --runInBand`

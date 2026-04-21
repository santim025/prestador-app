#!/bin/sh
set -e

echo "[entrypoint] Sincronizando schema con la base de datos..."
node /app/prisma-cli/node_modules/prisma/build/index.js db push --skip-generate --accept-data-loss

echo "[entrypoint] Arrancando la app..."
exec "$@"

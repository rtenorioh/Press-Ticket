#!/bin/sh
set -e

echo "🔄 Rodando migrações do banco de dados..."
npx sequelize-cli db:migrate

echo "🌱 Rodando seeds iniciais..."
npx sequelize-cli db:seed:all 2>/dev/null || true

echo "🚀 Iniciando servidor backend na porta ${PORT:-8000}..."
exec node dist/server.js

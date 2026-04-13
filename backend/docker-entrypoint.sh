#!/bin/sh
set -e

echo "🔄 Rodando migrações do banco de dados..."
npx sequelize-cli db:migrate

echo "🌱 Rodando seeds iniciais..."
npx sequelize-cli db:seed:all 2>/dev/null || true

echo "🧹 Limpando lock files do Chrome..."
rm -rf /tmp/com.google.Chrome.* /tmp/.com.google.Chrome.* /tmp/puppeteer_* 2>/dev/null || true
find /app/.wwebjs_auth -name "SingletonLock" -delete 2>/dev/null || true
find /app/.wwebjs_auth -name "SingletonCookie" -delete 2>/dev/null || true

echo "🚀 Iniciando servidor backend na porta ${PORT:-8000}..."
exec node dist/server.js

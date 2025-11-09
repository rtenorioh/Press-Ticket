#!/bin/bash

# Script simples para verificar rate limit
# Uso: ./check-rate-limit-simple.sh [auth|api]

API_URL="https://devapi.pressticket.com.br"
TYPE="${1:-auth}"

if [ "$TYPE" != "auth" ] && [ "$TYPE" != "api" ]; then
  echo "❌ Tipo inválido. Use: auth ou api"
  exit 1
fi

echo "🔍 Verificando Rate Limit: $TYPE"
echo ""

RESPONSE=$(curl -s "$API_URL/rate-limit-test-$TYPE")

if command -v jq &> /dev/null; then
  echo "📊 Status: $(echo $RESPONSE | jq -r '.rateLimit.status')"
  echo "🎯 Limite: $(echo $RESPONSE | jq -r '.rateLimit.limit')"
  echo "✅ Restantes: $(echo $RESPONSE | jq -r '.rateLimit.remaining')"
  echo "📈 Usadas: $(echo $RESPONSE | jq -r '.rateLimit.used')"
  echo "📊 Uso: $(echo $RESPONSE | jq -r '.rateLimit.percentUsed')"
  echo "⏰ Tempo para reset: $(echo $RESPONSE | jq -r '.rateLimit.timeRemaining')"
  echo "📅 Reset em: $(echo $RESPONSE | jq -r '.rateLimit.resetDate')"
  echo ""
  
  BLOCKED=$(echo $RESPONSE | jq -r '.rateLimit.blocked')
  if [ "$BLOCKED" = "true" ]; then
    echo "🔴 BLOQUEADO! Aguarde o tempo de reset ou reinicie o servidor."
  else
    echo "✅ Funcionando normalmente"
  fi
else
  echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
fi

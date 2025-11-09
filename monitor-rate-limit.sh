#!/bin/bash

# Script para monitorar rate limit em tempo real
# Uso: ./monitor-rate-limit.sh [auth|api]

API_URL="https://devapi.pressticket.com.br"
TYPE="${1:-auth}"  # Padrão: auth

if [ "$TYPE" != "auth" ] && [ "$TYPE" != "api" ]; then
  echo "❌ Tipo inválido. Use: auth ou api"
  echo "Uso: $0 [auth|api]"
  exit 1
fi

echo "🔍 Monitorando Rate Limit: $TYPE"
echo "📍 URL: $API_URL/rate-limit-test-$TYPE"
echo "⏰ Atualizando a cada 2 segundos... (Ctrl+C para parar)"
echo ""

while true; do
  clear
  echo "═══════════════════════════════════════════════════════════"
  echo "🔍 MONITOR DE RATE LIMIT - $(date '+%H:%M:%S')"
  echo "═══════════════════════════════════════════════════════════"
  echo ""
  
  # Fazer requisição e formatar resposta
  RESPONSE=$(curl -s "$API_URL/rate-limit-test-$TYPE")
  
  # Extrair informações usando jq (se disponível)
  if command -v jq &> /dev/null; then
    echo "📊 Tipo: $(echo $RESPONSE | jq -r '.type // "N/A"')"
    echo "📝 Descrição: $(echo $RESPONSE | jq -r '.description // "N/A"')"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📈 ESTATÍSTICAS"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    LIMIT=$(echo $RESPONSE | jq -r '.rateLimit.limit // "N/A"')
    REMAINING=$(echo $RESPONSE | jq -r '.rateLimit.remaining // "N/A"')
    USED=$(echo $RESPONSE | jq -r '.rateLimit.used // "N/A"')
    PERCENT=$(echo $RESPONSE | jq -r '.rateLimit.percentUsed // "N/A"')
    STATUS=$(echo $RESPONSE | jq -r '.rateLimit.status // "N/A"')
    TIME_REMAINING=$(echo $RESPONSE | jq -r '.rateLimit.timeRemaining // "N/A"')
    RESET_DATE=$(echo $RESPONSE | jq -r '.rateLimit.resetDate // "N/A"')
    
    echo "🎯 Limite Total: $LIMIT requisições"
    echo "✅ Restantes: $REMAINING requisições"
    echo "📊 Usadas: $USED requisições"
    echo "📈 Uso: $PERCENT"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "⏰ TEMPO"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "⏳ Tempo para reset: $TIME_REMAINING"
    echo "📅 Reset em: $RESET_DATE"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🚦 STATUS"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "$STATUS"
    echo ""
    
    # Barra de progresso visual
    if [ "$REMAINING" != "N/A" ] && [ "$LIMIT" != "N/A" ]; then
      PERCENT_NUM=$(echo $PERCENT | sed 's/%//')
      BAR_LENGTH=50
      FILLED=$((PERCENT_NUM * BAR_LENGTH / 100))
      EMPTY=$((BAR_LENGTH - FILLED))
      
      echo -n "["
      for ((i=0; i<$FILLED; i++)); do echo -n "█"; done
      for ((i=0; i<$EMPTY; i++)); do echo -n "░"; done
      echo "] $PERCENT"
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "💡 DICAS"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "$(echo $RESPONSE | jq -r '.tips.refresh // "N/A"')"
    echo "$(echo $RESPONSE | jq -r '.tips.blocked // "N/A"')"
    
  else
    # Fallback sem jq
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
  fi
  
  echo ""
  echo "═══════════════════════════════════════════════════════════"
  echo "Pressione Ctrl+C para parar"
  
  sleep 2
done

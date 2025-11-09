#!/bin/bash

# Script para verificar status do Rate Limit
# Uso: ./check-rate-limit.sh

echo "🔍 Verificando Rate Limit do Press-Ticket..."
echo ""

# Fazer requisição e capturar headers
RESPONSE=$(curl -s -i https://devapi.pressticket.com.br/rate-limit-status 2>&1)

# Debug: mostrar headers recebidos (descomente para debug)
# echo "DEBUG - Headers recebidos:"
# echo "$RESPONSE" | grep -i "x-ratelimit"
# echo ""

# Extrair headers do rate limit (suporta ambos os formatos: RateLimit-* e X-RateLimit-*)
LIMIT=$(echo "$RESPONSE" | grep -iE "(x-)?ratelimit-limit:" | grep -oE '[0-9]+' | head -1)
REMAINING=$(echo "$RESPONSE" | grep -iE "(x-)?ratelimit-remaining:" | grep -oE '[0-9]+' | head -1)
RESET=$(echo "$RESPONSE" | grep -iE "(x-)?ratelimit-reset:" | grep -oE '[0-9]+' | head -1)

echo "📊 Status do Rate Limit:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Verificar se conseguimos extrair valores numéricos
if [ -n "$LIMIT" ] && [ "$LIMIT" -gt 0 ] 2>/dev/null; then
    echo "✅ Limite Total:      $LIMIT requisições"
    echo "📈 Requisições Restantes: $REMAINING"
    
    # Calcular tempo restante
    if [ -n "$RESET" ] && [ "$RESET" -gt 0 ] 2>/dev/null; then
        NOW=$(date +%s)
        TIME_LEFT=$((RESET - NOW))
        
        if [ $TIME_LEFT -gt 0 ]; then
            MINUTES=$((TIME_LEFT / 60))
            SECONDS=$((TIME_LEFT % 60))
            echo "⏰ Reseta em:        ${MINUTES}m ${SECONDS}s"
        else
            echo "⏰ Reseta em:        Já resetado"
        fi
        
        # Calcular porcentagem usada (com proteção contra divisão por zero)
        if [ "$LIMIT" -gt 0 ]; then
            USED=$((LIMIT - REMAINING))
            PERCENT=$((USED * 100 / LIMIT))
            echo "📊 Uso:              $PERCENT% ($USED/$LIMIT)"
        fi
        
        # Status
        if [ "$REMAINING" -eq 0 ]; then
            echo "🔴 Status:           BLOQUEADO"
            echo ""
            echo "⚠️  Você está bloqueado! Aguarde ${MINUTES}m ${SECONDS}s ou reinicie o servidor."
        elif [ "$REMAINING" -lt 10 ]; then
            echo "🟡 Status:           ATENÇÃO - Poucas requisições restantes"
        else
            echo "🟢 Status:           OK"
        fi
    fi
else
    echo "⚠️  Não foi possível obter informações do rate limit"
    echo ""
    echo "Possíveis causas:"
    echo "  1. Servidor não está rodando"
    echo "  2. Rate limit não está configurado"
    echo "  3. Endpoint não está acessível"
    echo ""
    echo "Tentando conexão básica..."
    
    if curl -s https://devapi.pressticket.com.br/health > /dev/null 2>&1; then
        echo "✅ Servidor está rodando"
    else
        echo "❌ Servidor não está respondendo"
    fi
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 Dicas:"
echo "  • Rate limit aplicado APENAS em:"
echo "    - /auth/* (login/autenticação)"
echo "    - /v1/* (API pública)"
echo "  • Rotas internas SEM rate limit:"
echo "    - Chat, mensagens, tickets, etc"
echo "  • Limites:"
echo "    - Produção: 20 logins/15min | 5000 API/hora"
echo "    - Desenvolvimento: 50 logins/15min | 10000 API/hora"
echo "  • Para resetar: pm2 restart backend"
echo ""

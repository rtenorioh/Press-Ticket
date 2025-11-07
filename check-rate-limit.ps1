# Script PowerShell para verificar status do Rate Limit
# Uso: .\check-rate-limit.ps1

Write-Host "🔍 Verificando Rate Limit do Press-Ticket..." -ForegroundColor Cyan
Write-Host ""

try {
    # Fazer requisição e capturar headers
    $response = Invoke-WebRequest -Uri "http://localhost:8080/rate-limit-status" -Method GET -UseBasicParsing
    
    # Extrair headers do rate limit
    $limit = $response.Headers['X-RateLimit-Limit']
    $remaining = $response.Headers['X-RateLimit-Remaining']
    $reset = $response.Headers['X-RateLimit-Reset']
    
    Write-Host "📊 Status do Rate Limit:" -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    
    if ($limit) {
        Write-Host "✅ Limite Total:           $limit requisições" -ForegroundColor Green
        Write-Host "📈 Requisições Restantes:  $remaining" -ForegroundColor Cyan
        
        # Calcular tempo restante
        if ($reset) {
            $now = [int][double]::Parse((Get-Date -UFormat %s))
            $timeLeft = [int]$reset - $now
            
            if ($timeLeft -gt 0) {
                $minutes = [math]::Floor($timeLeft / 60)
                $seconds = $timeLeft % 60
                Write-Host "⏰ Reseta em:              ${minutes}m ${seconds}s" -ForegroundColor Magenta
            } else {
                Write-Host "⏰ Reseta em:              Já resetado" -ForegroundColor Green
            }
            
            # Calcular porcentagem usada
            $used = [int]$limit - [int]$remaining
            $percent = [math]::Floor(($used * 100) / [int]$limit)
            Write-Host "📊 Uso:                    $percent% ($used/$limit)" -ForegroundColor Yellow
            
            # Status
            if ([int]$remaining -eq 0) {
                Write-Host "🔴 Status:                 BLOQUEADO" -ForegroundColor Red
                Write-Host ""
                Write-Host "⚠️  Você está bloqueado! Aguarde ${minutes}m ${seconds}s ou reinicie o servidor." -ForegroundColor Red
            } elseif ([int]$remaining -lt 10) {
                Write-Host "🟡 Status:                 ATENÇÃO - Poucas requisições restantes" -ForegroundColor Yellow
            } else {
                Write-Host "🟢 Status:                 OK" -ForegroundColor Green
            }
        }
    } else {
        Write-Host "⚠️  Headers de rate limit não encontrados" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Servidor está respondendo, mas rate limit pode não estar ativo." -ForegroundColor Gray
    }
    
} catch {
    Write-Host "❌ Erro ao conectar com o servidor" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possíveis causas:" -ForegroundColor Yellow
    Write-Host "  1. Servidor não está rodando" -ForegroundColor Gray
    Write-Host "  2. Porta 8080 não está acessível" -ForegroundColor Gray
    Write-Host "  3. Firewall bloqueando conexão" -ForegroundColor Gray
    Write-Host ""
    
    # Tentar health check
    try {
        $health = Invoke-WebRequest -Uri "http://localhost:8080/health" -Method GET -UseBasicParsing -TimeoutSec 2
        Write-Host "✅ Servidor está rodando (health check passou)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Servidor não está respondendo" -ForegroundColor Red
    }
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 Dicas:" -ForegroundColor Cyan
Write-Host "  • Em desenvolvimento: 1000 req/15min" -ForegroundColor Gray
Write-Host "  • Em produção: 100 req/15min" -ForegroundColor Gray
Write-Host "  • Para resetar: reinicie o servidor" -ForegroundColor Gray
Write-Host ""

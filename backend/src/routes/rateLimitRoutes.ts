import { Router, Request, Response } from "express";
import { rateLimits, authLimiter, apiLimiter } from "../config/rateLimiter";

const rateLimitRoutes = Router();

// Endpoint para verificar status do rate limit
rateLimitRoutes.get("/rate-limit-status", (req: Request, res: Response) => {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const isStrictMode = process.env.RATE_LIMIT_STRICT === 'true';
  
  // Esta rota não tem rate limit, então mostra informações gerais
  const response = {
    info: "Esta rota não possui rate limit. Para testar, acesse rotas protegidas:",
    testRoutes: {
      auth: {
        endpoint: "/auth/login",
        method: "POST",
        rateLimit: `${rateLimits.auth} tentativas / 15 minutos`,
        description: "Protege contra brute force em login"
      },
      api: {
        endpoint: "/v1/*",
        method: "GET/POST",
        rateLimit: `${rateLimits.api} requisições / hora`,
        description: "Protege API pública"
      }
    },
    currentConfig: {
      mode: isStrictMode ? "🔴 Modo Estrito (RATE_LIMIT_STRICT=true)" : (isDevelopment ? "🟢 Desenvolvimento" : "🟡 Produção Normal"),
      environment: process.env.NODE_ENV || "development",
      limits: {
        auth: {
          max: rateLimits.auth,
          window: "15 minutos",
          routes: ["/auth/login", "/auth/signup", "/auth/forgot-password", "/auth/reset-password"]
        },
        api: {
          max: rateLimits.api,
          window: "1 hora",
          routes: ["/v1/*"]
        }
      }
    },
    appliedTo: [
      "✅ /auth/login - Login (protege contra brute force)",
      "✅ /auth/signup - Cadastro (protege contra spam)",
      "✅ /auth/forgot-password - Recuperação de senha",
      "✅ /auth/reset-password - Reset de senha",
      "✅ /v1/* - API pública (protege recursos públicos)",
      "❌ /auth/refresh_token - SEM rate limit (evita bloqueios)",
      "❌ /auth/logout - SEM rate limit (sempre permitir sair)",
      "❌ Rotas internas - SEM rate limit (chat, mensagens, tickets, etc)"
    ],
    currentRequest: {
      ip: req.ip,
      userAgent: req.get('user-agent'),
      timestamp: new Date().toISOString(),
      rateLimited: false,
      reason: "Esta rota (/rate-limit-status) não possui rate limit"
    },
    howToTest: {
      step1: "Faça múltiplas requisições para /auth/login com credenciais inválidas",
      step2: `Após ${rateLimits.auth} tentativas em 15 minutos, você receberá erro 429`,
      step3: "Aguarde 15 minutos ou reinicie o servidor para resetar",
      example: {
        bash: `for i in {1..25}; do curl -X POST https://devapi.pressticket.com.br/auth/login -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"wrong"}'; done`,
        description: "Após 20 tentativas (produção), receberá erro 429"
      }
    },
    tips: {
      blocked: "Se bloqueado, aguarde 15 minutos ou reinicie o servidor (pm2 restart backend)",
      strictMode: "Para ativar modo estrito: RATE_LIMIT_STRICT=true no .env",
      development: "Em desenvolvimento, os limites são mais permissivos para facilitar testes"
    }
  };
  
  return res.json(response);
});

// Endpoint para testar rate limit de autenticação (com headers reais)
rateLimitRoutes.get("/rate-limit-test-auth", authLimiter, (req: Request, res: Response) => {
  // Pegar headers do rate limit
  const limit = res.getHeader('RateLimit-Limit');
  const remaining = res.getHeader('RateLimit-Remaining');
  const reset = res.getHeader('RateLimit-Reset');
  
  // Calcular tempo restante
  let timeRemaining = 0;
  let timeRemainingFormatted = "N/A";
  
  if (reset) {
    const resetTimestamp = parseInt(reset.toString());
    const now = Math.floor(Date.now() / 1000);
    timeRemaining = resetTimestamp - now;
    
    if (timeRemaining > 0) {
      const minutes = Math.floor(timeRemaining / 60);
      const seconds = timeRemaining % 60;
      timeRemainingFormatted = `${minutes}m ${seconds}s`;
    } else {
      timeRemainingFormatted = "Já resetado";
    }
  }
  
  // Calcular porcentagem
  let percentUsed = 0;
  let used = 0;
  if (limit && remaining) {
    const limitNum = parseInt(limit.toString());
    const remainingNum = parseInt(remaining.toString());
    used = limitNum - remainingNum;
    percentUsed = Math.round((used * 100) / limitNum);
  }
  
  // Determinar status
  let status = "OK";
  let statusEmoji = "🟢";
  if (remaining && parseInt(remaining.toString()) === 0) {
    status = "BLOQUEADO";
    statusEmoji = "🔴";
  } else if (remaining && parseInt(remaining.toString()) < 5) {
    status = "CRÍTICO - Poucas requisições restantes";
    statusEmoji = "🟠";
  } else if (remaining && parseInt(remaining.toString()) < 10) {
    status = "ATENÇÃO - Limite próximo";
    statusEmoji = "🟡";
  }
  
  const response = {
    type: "auth",
    description: "Rate limit de autenticação (login, signup, etc)",
    rateLimit: {
      limit: limit ? parseInt(limit.toString()) : null,
      remaining: remaining ? parseInt(remaining.toString()) : null,
      used: used,
      reset: reset ? parseInt(reset.toString()) : null,
      resetDate: reset ? new Date(parseInt(reset.toString()) * 1000).toISOString() : null,
      timeRemaining: timeRemainingFormatted,
      timeRemainingSeconds: timeRemaining > 0 ? timeRemaining : 0,
      percentUsed: `${percentUsed}%`,
      usedFormatted: `${used}/${limit}`,
      status: `${statusEmoji} ${status}`,
      blocked: remaining ? parseInt(remaining.toString()) === 0 : false
    },
    currentRequest: {
      ip: req.ip,
      userAgent: req.get('user-agent'),
      timestamp: new Date().toISOString()
    },
    tips: {
      refresh: "Atualize esta página para ver o contador em tempo real",
      blocked: remaining && parseInt(remaining.toString()) === 0 
        ? `⏰ Aguarde ${timeRemainingFormatted} para desbloquear ou reinicie o servidor`
        : "Continue fazendo requisições para testar o rate limit",
      reset: `O contador reseta automaticamente em ${timeRemainingFormatted}`
    }
  };
  
  return res.json(response);
});

// Endpoint para testar rate limit da API pública (com headers reais)
rateLimitRoutes.get("/rate-limit-test-api", apiLimiter, (req: Request, res: Response) => {
  // Pegar headers do rate limit
  const limit = res.getHeader('RateLimit-Limit');
  const remaining = res.getHeader('RateLimit-Remaining');
  const reset = res.getHeader('RateLimit-Reset');
  
  // Calcular tempo restante
  let timeRemaining = 0;
  let timeRemainingFormatted = "N/A";
  
  if (reset) {
    const resetTimestamp = parseInt(reset.toString());
    const now = Math.floor(Date.now() / 1000);
    timeRemaining = resetTimestamp - now;
    
    if (timeRemaining > 0) {
      const minutes = Math.floor(timeRemaining / 60);
      const seconds = timeRemaining % 60;
      timeRemainingFormatted = `${minutes}m ${seconds}s`;
    } else {
      timeRemainingFormatted = "Já resetado";
    }
  }
  
  // Calcular porcentagem
  let percentUsed = 0;
  let used = 0;
  if (limit && remaining) {
    const limitNum = parseInt(limit.toString());
    const remainingNum = parseInt(remaining.toString());
    used = limitNum - remainingNum;
    percentUsed = Math.round((used * 100) / limitNum);
  }
  
  // Determinar status
  let status = "OK";
  let statusEmoji = "🟢";
  if (remaining && parseInt(remaining.toString()) === 0) {
    status = "BLOQUEADO";
    statusEmoji = "🔴";
  } else if (remaining && parseInt(remaining.toString()) < 100) {
    status = "CRÍTICO - Poucas requisições restantes";
    statusEmoji = "🟠";
  } else if (remaining && parseInt(remaining.toString()) < 500) {
    status = "ATENÇÃO - Limite próximo";
    statusEmoji = "🟡";
  }
  
  const response = {
    type: "api",
    description: "Rate limit da API pública (/v1)",
    rateLimit: {
      limit: limit ? parseInt(limit.toString()) : null,
      remaining: remaining ? parseInt(remaining.toString()) : null,
      used: used,
      reset: reset ? parseInt(reset.toString()) : null,
      resetDate: reset ? new Date(parseInt(reset.toString()) * 1000).toISOString() : null,
      timeRemaining: timeRemainingFormatted,
      timeRemainingSeconds: timeRemaining > 0 ? timeRemaining : 0,
      percentUsed: `${percentUsed}%`,
      usedFormatted: `${used}/${limit}`,
      status: `${statusEmoji} ${status}`,
      blocked: remaining ? parseInt(remaining.toString()) === 0 : false
    },
    currentRequest: {
      ip: req.ip,
      userAgent: req.get('user-agent'),
      timestamp: new Date().toISOString()
    },
    tips: {
      refresh: "Atualize esta página para ver o contador em tempo real",
      blocked: remaining && parseInt(remaining.toString()) === 0 
        ? `⏰ Aguarde ${timeRemainingFormatted} para desbloquear ou reinicie o servidor`
        : "Continue fazendo requisições para testar o rate limit",
      reset: `O contador reseta automaticamente em ${timeRemainingFormatted}`
    }
  };
  
  return res.json(response);
});

// Endpoint para resetar rate limit (apenas desenvolvimento)
rateLimitRoutes.post("/rate-limit-reset", (req: Request, res: Response) => {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  if (!isDevelopment) {
    return res.status(403).json({
      error: "Este endpoint só está disponível em desenvolvimento",
      tip: "Em produção, aguarde o tempo de reset ou reinicie o servidor"
    });
  }
  
  return res.json({
    message: "⚠️ Para resetar o rate limit em desenvolvimento, reinicie o servidor:",
    commands: [
      "pm2 restart backend",
      "ou",
      "npm run dev"
    ],
    note: "O rate limit é armazenado em memória, então reiniciar o servidor limpa todos os contadores",
    alternative: "Ou aguarde 15 minutos para o reset automático"
  });
});

export default rateLimitRoutes;

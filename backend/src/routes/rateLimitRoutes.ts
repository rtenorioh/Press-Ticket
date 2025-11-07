import { Router, Request, Response } from "express";

const rateLimitRoutes = Router();

// Endpoint para verificar status do rate limit
rateLimitRoutes.get("/rate-limit-status", (req: Request, res: Response) => {
  // O middleware de rate limit adiciona informações no res.locals
  // Vamos capturar os headers que serão enviados
  
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  // Pegar headers do rate limit (serão adicionados pelo middleware antes de enviar)
  const limit = res.getHeader('RateLimit-Limit') || res.getHeader('X-RateLimit-Limit');
  const remaining = res.getHeader('RateLimit-Remaining') || res.getHeader('X-RateLimit-Remaining');
  const reset = res.getHeader('RateLimit-Reset') || res.getHeader('X-RateLimit-Reset');
  
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
    percentUsed = Math.floor((used * 100) / limitNum);
  }
  
  // Determinar status
  let status = "OK";
  let statusEmoji = "🟢";
  if (remaining && parseInt(remaining.toString()) === 0) {
    status = "BLOQUEADO";
    statusEmoji = "🔴";
  } else if (remaining && parseInt(remaining.toString()) < 10) {
    status = "ATENÇÃO - Poucas requisições restantes";
    statusEmoji = "🟡";
  }
  
  const response = {
    rateLimit: {
      limit: limit ? parseInt(limit.toString()) : "N/A",
      remaining: remaining ? parseInt(remaining.toString()) : "N/A",
      reset: reset ? parseInt(reset.toString()) : "N/A",
      timeRemaining: timeRemainingFormatted,
      timeRemainingSeconds: timeRemaining > 0 ? timeRemaining : 0,
      percentUsed: limit && remaining ? `${percentUsed}%` : "N/A",
      used: limit && remaining ? `${used}/${limit}` : "N/A",
      status: `${statusEmoji} ${status}`,
      blocked: remaining ? parseInt(remaining.toString()) === 0 : false
    },
    currentRequest: {
      ip: req.ip,
      userAgent: req.get('user-agent'),
      timestamp: new Date().toISOString()
    },
    tips: {
      development: isDevelopment ? "Em desenvolvimento, os limites são 10x maiores (NODE_ENV !== 'production')" : "Em produção",
      limits: {
        general: isDevelopment ? "1000 req/15min (dev)" : "100 req/15min (prod)",
        auth: isDevelopment ? "50 tentativas/15min (dev)" : "5 tentativas/15min (prod)",
        api: isDevelopment ? "10000 req/hora (dev)" : "1000 req/hora (prod)"
      },
      blocked: "Se bloqueado, aguarde 15 minutos ou reinicie o servidor"
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

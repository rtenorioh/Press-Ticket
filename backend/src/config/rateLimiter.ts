import rateLimit from "express-rate-limit";

// Configuração de ambiente
const isDevelopment = process.env.NODE_ENV !== 'production';
const isStrictMode = process.env.RATE_LIMIT_STRICT === 'true';

// Limites flexíveis: strict mode para ambientes sob ataque, normal para uso regular
export const rateLimits = {
  auth: isStrictMode ? 5 : (isDevelopment ? 50 : 20),      // Strict: 5, Prod: 20, Dev: 50
  api: isStrictMode ? 1000 : (isDevelopment ? 10000 : 5000)   // Strict: 1000, Prod: 5000, Dev: 10000
};

// Rate limiter para autenticação (protege contra brute force)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: rateLimits.auth,
  message: "Muitas tentativas de login, tente novamente mais tarde.",
  skipSuccessfulRequests: true, // Não conta logins bem-sucedidos
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Não aplicar rate limit em rotas que não são de login
    const path = req.path;
    return path.includes('/logout') || path.includes('/refresh_token');
  }
});

// Rate limiter para API pública (protege recursos públicos)
export const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: rateLimits.api,
  message: "Limite de requisições da API excedido.",
  standardHeaders: true,
  legacyHeaders: false,
});

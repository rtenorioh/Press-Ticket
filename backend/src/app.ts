import "./bootstrap";
import "reflect-metadata";
import "express-async-errors";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import * as Sentry from "@sentry/node";
import swaggerUi from "swagger-ui-express";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { logger } from "./utils/logger";
import updateLastActivity from "./middleware/updateLastActivity";
import errorLogger from "./middleware/errorLogger";

import "./database";
import uploadConfig from "./config/upload";
import AppError from "./errors/AppError";
import openApiRoutes from "./routes/openApiRoutes";
import routes from "./routes";
import swaggerSpec from "./config/swagger";

if (process.env.NODE_ENV === "production") {
  Sentry.init({ dsn: process.env.SENTRY_DSN });
}

const app = express();

// Configurar trust proxy para funcionar com Nginx/reverse proxy
// Isso permite que o Express confie nos headers X-Forwarded-*
app.set('trust proxy', true);

// Segurança: Headers HTTP
app.use(
  helmet({
    contentSecurityPolicy: false, // Desabilitado para compatibilidade com Socket.IO
    crossOriginEmbedderPolicy: false
  })
);

// Performance: Compressão de respostas
app.use(compression());

app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL
  })
);

// Rate Limiting: Proteção contra brute force e DDoS
// Limites mais permissivos em desenvolvimento
const isDevelopment = process.env.NODE_ENV !== 'production';

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: isDevelopment ? 1000 : 100, // Dev: 1000, Prod: 100 requisições por IP
  message: "Muitas requisições deste IP, tente novamente mais tarde.",
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: isDevelopment ? 50 : 5, // Dev: 50, Prod: 5 tentativas de login
  message: "Muitas tentativas de login, tente novamente mais tarde.",
  skipSuccessfulRequests: true,
});

const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: isDevelopment ? 10000 : 1000, // Dev: 10000, Prod: 1000 requisições
  message: "Limite de requisições da API excedido.",
});

app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.raw({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));
app.use(Sentry.Handlers.requestHandler());

// Aplicar rate limiting geral
app.use(generalLimiter);

const openApiCorsOptions = {
  credentials: true,
  origin: "*",
  allowedHeaders: ["Content-Type", "Authorization", "x-api-token"],
};

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Press Ticket® API Documentation"
}));

app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Rate limiting específico para API pública
app.use("/v1", cors(openApiCorsOptions), apiLimiter, openApiRoutes);

// Rate limiting para rotas de autenticação
app.use("/auth", authLimiter);

app.use("/public", express.static(uploadConfig.directory));
app.use(routes);
app.use(updateLastActivity);

app.use(Sentry.Handlers.errorHandler());
app.use(errorLogger);

app.use(async (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    logger.warn(err);
    return res.status(err.statusCode).json({ error: err.message });
  }

  logger.error(err);
  return res.status(500).json({ error: "Internal server error" });
});

export default app;

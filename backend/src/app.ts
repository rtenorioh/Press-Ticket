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
import { logger } from "./utils/logger";
import updateLastActivity from "./middleware/updateLastActivity";
import errorLogger from "./middleware/errorLogger";

import "./database";
import uploadConfig from "./config/upload";
import AppError from "./errors/AppError";
import openApiRoutes from "./routes/openApiRoutes";
import routes from "./routes";
import swaggerSpec from "./config/swagger";
import { apiLimiter } from "./config/rateLimiter";

if (process.env.NODE_ENV === "production") {
  Sentry.init({ dsn: process.env.SENTRY_DSN });
}

const app = express();

app.set('trust proxy', true);

app.use((req, res, next) => {
  if (req.path === '/api-docs' || req.path.startsWith('/api-docs/')) {
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: false,
      frameguard: false,
      xContentTypeOptions: false,
      permittedCrossDomainPolicies: { permittedPolicies: "none" }
    })(req, res, () => {
      res.setHeader('X-Frame-Options', 'ALLOWALL');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Security-Policy', 
        "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; " +
        "script-src * 'unsafe-inline' 'unsafe-eval'; " +
        "style-src * 'unsafe-inline'; " +
        "img-src * data: blob: 'unsafe-inline'; " +
        "font-src * data:; " +
        "connect-src *; " +
        "frame-src *; " +
        "media-src *; " +
        "object-src *;"
      );
      next();
    });
  } else {
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: false,
      xContentTypeOptions: false,
      permittedCrossDomainPolicies: { permittedPolicies: "none" }
    })(req, res, next);
  }
});

app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 
    'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
  );
  next();
});

app.use(compression());

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) {
      return callback(null, true);
    }
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }

    if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
      return callback(null, true);
    }
    logger.warn(`CORS bloqueou origem não permitida: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Range', 'Accept'],
  exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length'],
  maxAge: 86400 // 24 horas de cache para preflight
};

app.use(cors(corsOptions));

app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.raw({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));
app.use(Sentry.Handlers.requestHandler());

const openApiCorsOptions = {
  credentials: true,
  origin: "*",
  allowedHeaders: ["Content-Type", "Authorization", "x-api-token"],
};

app.use("/api-docs", (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
}, swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Press Ticket® API Documentation"
}));

app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

app.use("/v1", cors(openApiCorsOptions), apiLimiter, openApiRoutes);

const publicCorsOptions = {
  origin: true,
  credentials: false,
  methods: ["GET", "HEAD", "OPTIONS"],
  allowedHeaders: ["Range", "Content-Type", "Accept", "Origin"],
  exposedHeaders: ["Content-Range", "Accept-Ranges", "Content-Length", "Content-Type"],
  maxAge: 86400, // Cache de 24h para preflight
  optionsSuccessStatus: 200
};

app.use("/public", cors(publicCorsOptions), (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
}, express.static(uploadConfig.directory));
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

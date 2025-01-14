import "express-async-errors";
import express, { Request, Response, NextFunction } from "express";
import * as Sentry from "@sentry/node";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import "reflect-metadata";
import "./bootstrap";
import uploadConfig from "./config/upload";
import "./database";
import AppError from "./errors/AppError";
import routes from "./routes";
import { logger } from "./utils/logger";

const app = express();

if (process.env.NODE_ENV === "production") {
  Sentry.init({ dsn: process.env.SENTRY_DSN });
}

app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(Sentry.Handlers.requestHandler());

// Configurar diretório de uploads
app.use("/public", express.static(uploadConfig.directory, {
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
}));

app.use(routes);

app.use(Sentry.Handlers.errorHandler());

app.use(async (err: Error, req: Request, res: Response, _: NextFunction) => {
  if (err instanceof AppError) {
    logger.warn(err);
    return res.status(err.statusCode).json({ error: err.message });
  }

  logger.error(err);
  return res.status(500).json({ error: "Internal server error" });
});

export { app };

import "./bootstrap";
import "reflect-metadata";
import "express-async-errors";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import * as Sentry from "@sentry/node";
import { logger } from "./utils/logger";
import updateLastActivity from "./middleware/updateLastActivity";
import openApiRoutes from "./routes/openApiRoutes";

import "./database";
import uploadConfig from "./config/upload";
import AppError from "./errors/AppError";
import routes from "./routes";

if (process.env.NODE_ENV === "production") {
  Sentry.init({ dsn: process.env.SENTRY_DSN });
}

const app = express();

app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(Sentry.Handlers.requestHandler());

const openApiCorsOptions = {
  credentials: true,
  origin: "*",
  allowedHeaders: ["Content-Type", "Authorization", "x-api-token"],
};

app.use("/v1", cors(openApiCorsOptions), openApiRoutes);

app.use("/public", express.static(uploadConfig.directory));
app.use(routes);
app.use(updateLastActivity);

app.use(Sentry.Handlers.errorHandler());

app.use(async (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    logger.warn(err);
    return res.status(err.statusCode).json({ error: err.message });
  }

  logger.error(err);
  return res.status(500).json({ error: "Internal server error" });
});

export default app;

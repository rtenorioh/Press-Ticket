import "./bootstrap";
import "reflect-metadata";
import "express-async-errors";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import * as Sentry from "@sentry/node";
import swaggerUi from "swagger-ui-express";
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

app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL
  })
);

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

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Press Ticket® API Documentation"
}));

app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

app.use("/v1", cors(openApiCorsOptions), openApiRoutes);

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

import { Router } from "express";
import * as SessionController from "../controllers/SessionController";
import * as UserController from "../controllers/UserController";
import isAuth from "../middleware/isAuth";
import { authLimiter } from "../config/rateLimiter";

const authRoutes = Router();

// Aplicar rate limiter apenas em rotas de autenticação sensíveis
authRoutes.post("/signup", authLimiter, UserController.store);
authRoutes.post("/login", authLimiter, SessionController.store);
authRoutes.post("/forgot-password", authLimiter, SessionController.forgotPassword);
authRoutes.post("/reset-password", authLimiter, SessionController.resetPassword);

// Rotas sem rate limit (já autenticadas ou menos sensíveis)
authRoutes.post("/refresh_token", SessionController.update);
authRoutes.delete("/logout", isAuth, SessionController.remove);

export default authRoutes;

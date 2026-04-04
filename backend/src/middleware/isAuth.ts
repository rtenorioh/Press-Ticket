import { verify } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { TokenExpiredError } from "jsonwebtoken";
import AppError from "../errors/AppError";
import authConfig from "../config/auth";
import UserSession from "../models/UserSession";
import User from "../models/User";
import CheckSettings from "../helpers/CheckSettings";

interface TokenPayload {
  id: string;
  username: string;
  profile: string;
  iat: number;
  exp: number;
}

const isAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  const [, token] = authHeader.split(" ");

  try {
    const decoded = verify(token, authConfig.secret);
    const { id, profile } = decoded as TokenPayload;

    const session = await UserSession.findOne({
      where: {
        userId: id,
        logoutAt: null
      }
    });

    if (!session) {
      throw new AppError("ERR_SESSION_EXPIRED", 401);
    }

    const lastActivity = new Date(session.lastActivity).getTime();
    const currentTime = new Date().getTime();
    const diffHours = (currentTime - lastActivity) / (1000 * 60 * 60);

    let sessionTimeoutHours = 8;
    try {
      const timeoutValue = await CheckSettings("sessionTimeout");
      sessionTimeoutHours = parseInt(timeoutValue, 10) || 8;
    } catch {
      // Setting não encontrado, usa o padrão de 8 horas
    }

    if (diffHours >= sessionTimeoutHours) {
      await session.update({
        logoutAt: new Date()
      });

      await User.update(
        { online: false, currentSessionId: null },
        { where: { id } }
      );

      const io = require("../libs/socket").getIO();
      io.emit("userSessionExpired", {
        userId: id,
        expired: true,
        message: "ERR_SESSION_EXPIRED"
      });

      throw new AppError("ERR_SESSION_EXPIRED", 401);
    }

    await session.update({
      lastActivity: new Date()
    });

    req.user = {
      id,
      profile
    };

    return next();
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      throw new AppError("ERR_SESSION_EXPIRED", 401);
    }
    throw new AppError("ERR_INVALID_TOKEN", 401);
  }
};

export default isAuth;

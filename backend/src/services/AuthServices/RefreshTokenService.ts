import { verify } from "jsonwebtoken";
import { Response as Res } from "express";

import User from "../../models/User";
import AppError from "../../errors/AppError";
import ShowUserService from "../UserServices/ShowUserService";
import authConfig from "../../config/auth";
import {
  createAccessToken,
  createRefreshToken
} from "../../helpers/CreateTokens";
import UserSession from "../../models/UserSession";

interface RefreshTokenPayload {
  id: string;
  tokenVersion: number;
}

interface Response {
  user: User;
  newToken: string;
  refreshToken: string;
}

export const RefreshTokenService = async (
  res: Res,
  token: string
): Promise<Response> => {
  try {
    const decoded = verify(token, authConfig.refreshSecret);
    const { id, tokenVersion } = decoded as RefreshTokenPayload;

    const user = await ShowUserService(id);

    if (user.tokenVersion !== tokenVersion) {
      res.clearCookie("jrt");
      throw new AppError("ERR_SESSION_EXPIRED", 401);
    }

    // Verifica se existe uma sessão ativa
    const session = await UserSession.findOne({
      where: {
        userId: user.id,
        logoutAt: null
      }
    });

    if (!session) {
      res.clearCookie("jrt");
      throw new AppError("ERR_SESSION_EXPIRED", 401);
    }

    // Verifica se passou 8 horas desde a última atividade
    const lastActivity = new Date(session.lastActivity).getTime();
    const currentTime = new Date().getTime();
    const diffHours = (currentTime - lastActivity) / (1000 * 60 * 60);

    if (diffHours >= 8) {
      await session.update({
        logoutAt: new Date()
      });

      await user.update({
        online: false,
        currentSessionId: null
      });

      const io = require("../../libs/socket").getIO();
      io.emit("userSessionExpired", {
        userId: user.id,
        expired: true,
        message: "ERR_SESSION_EXPIRED"
      });

      res.clearCookie("jrt");
      throw new AppError("ERR_SESSION_EXPIRED", 401);
    }

    // Atualiza a última atividade
    await session.update({
      lastActivity: new Date()
    });

    const newToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    return { user, newToken, refreshToken };
  } catch (err) {
    res.clearCookie("jrt");
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }
};

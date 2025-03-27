import { Response as Res } from "express";
import { verify } from "jsonwebtoken";

import authConfig from "../../config/auth";
import AppError from "../../errors/AppError";
import {
  createAccessToken,
  createRefreshToken
} from "../../helpers/CreateTokens";
import User from "../../models/User";
import UserSession from "../../models/UserSession";
import ShowUserService from "../UserServices/ShowUserService";

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

    if (!user.active) {
      res.clearCookie("jrt");
      throw new AppError("ERR_USER_INACTIVE", 401);
    }

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

    await session.update({
      lastActivity: new Date()
    });

    const newToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    return { user, newToken, refreshToken };
  } catch (err) {
    if (err instanceof AppError) {  
      if (err.message === "ERR_USER_INACTIVE") {
        throw err;
      }
    }

    res.clearCookie("jrt");
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }
};

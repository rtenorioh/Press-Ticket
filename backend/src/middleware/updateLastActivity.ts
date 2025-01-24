import { Request, Response, NextFunction } from "express";
import UserSession from "../models/UserSession";
import User from "../models/User";

const updateLastActivity = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { user } = req;

  if (user?.id) {
    try {
      const session = await UserSession.findOne({
        where: {
          userId: user.id,
          logoutAt: null
        }
      });

      if (session) {
        const lastActivity = new Date(session.lastActivity).getTime();
        const currentTime = new Date().getTime();
        const diffHours = (currentTime - lastActivity) / (1000 * 60 * 60);

        if (diffHours >= 8) {
          await session.update({
            logoutAt: new Date()
          });

          await User.update(
            { online: false, currentSessionId: null },
            { where: { id: user.id } }
          );

          const io = require("../libs/socket").getIO();
          io.emit("userSessionExpired", {
            userId: user.id,
            expired: true,
            message: "Sua sessão expirou após 8 horas de inatividade."
          });
        } else {
          await session.update({
            lastActivity: new Date()
          });
        }
      }
    } catch (err) {
      console.error("Error updating last activity:", err);
    }
  }

  next();
};

export default updateLastActivity;

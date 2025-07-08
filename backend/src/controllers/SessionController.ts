import crypto from "crypto";
import { Request, Response } from "express";
import nodemailer from "nodemailer";
import EmailService from "../services/EmailService";
import { Op } from "sequelize";
import AppError from "../errors/AppError";
import { SendRefreshToken } from "../helpers/SendRefreshToken";
import User from "../models/User";
import { RefreshTokenService } from "../services/AuthServices/RefreshTokenService";
import AuthUserService from "../services/UserServices/AuthUserService";
import { createActivityLog, ActivityActions, EntityTypes } from "../services/ActivityLogService";

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body;

  const { token, serializedUser, refreshToken } = await AuthUserService({
    email,
    password
  });

  await createActivityLog({
    userId: serializedUser.id,
    action: ActivityActions.LOGIN,
    description: `Usuário ${serializedUser.name} realizou login no sistema`,
    entityType: EntityTypes.USER,
    entityId: serializedUser.id,
    additionalData: { email: serializedUser.email }
  });

  SendRefreshToken(res, refreshToken);

  return res.status(200).json({
    token,
    user: serializedUser
  });
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const token: string = req.cookies.jrt;

  if (!token) {
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  const { user, newToken, refreshToken } = await RefreshTokenService(
    res,
    token
  );

  SendRefreshToken(res, refreshToken);

  return res.json({ token: newToken, user });
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.user;
  
  if (id) {
    const user = await User.findByPk(id);
    if (user) {
      await user.update({ online: false });
      
      await createActivityLog({
        userId: user.id,
        action: ActivityActions.LOGOUT,
        description: `Usuário ${user.name} realizou logout do sistema`,
        entityType: EntityTypes.USER,
        entityId: user.id,
        additionalData: {}
      });
      
      const io = require("../libs/socket").getIO();
      io.emit("userSessionUpdate", {
        userId: user.id,
        online: false
      });
    }
  }
  
  res.clearCookie("jrt");
  return res.send();
};

export const forgotPassword = async (req: Request, res: Response): Promise<Response> => {
  const { email } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new AppError("E-mail não encontrado.", 404);
  }

  const token = crypto.randomBytes(32).toString("hex");
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  user.passwordResetToken = token;
  user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000);
  await user.save();

  const emailService = EmailService.getInstance();
  
  const sent = await emailService.sendEmail({
    to: email,
    subject: "Redefinição de Senha",
    text: `Clique no link para redefinir sua senha: ${resetUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Redefinição de Senha</h2>
        <p>Olá,</p>
        <p>Você solicitou a redefinição de senha da sua conta.</p>
        <p>Clique no botão abaixo para redefinir sua senha:</p>
        <p>
          <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 0;">Redefinir Senha</a>
        </p>
        <p>Ou copie e cole o seguinte link no seu navegador:</p>
        <p>${resetUrl}</p>
        <p>Este link é válido por 30 minutos.</p>
        <p>Se você não solicitou a redefinição de senha, ignore este e-mail.</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #777;">Este é um e-mail automático, não responda.</p>
      </div>
    `
  });
  
  if (!sent) {
    throw new AppError("Erro ao enviar e-mail de redefinição de senha. Tente novamente mais tarde.", 500);
  }

  return res.status(200).json({ message: "E-mail enviado com sucesso." });
};

export const resetPassword = async (req: Request, res: Response): Promise<Response> => {
  const { token, newPassword } = req.body;

  const user = await User.findOne({
    where: {
      passwordResetToken: token,
      passwordResetExpires: { [Op.gt]: new Date() },
    },
  });

  if (!user) {
    throw new AppError("Token inválido ou expirado.", 400);
  }

  user.password = newPassword;
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  await user.save();

  return res.status(200).json({ message: "Senha redefinida com sucesso." });
};
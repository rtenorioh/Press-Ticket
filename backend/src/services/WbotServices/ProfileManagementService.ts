import { MessageMedia } from "whatsapp-web.js";
import { getWbot } from "../../libs/wbot";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";
import fs from "fs";
import path from "path";

class ProfileManagementService {
  async setStatus(whatsappId: number, status: string): Promise<void> {
    if (!status) {
      throw new AppError("Status é obrigatório");
    }

    try {
      const wbot = getWbot(whatsappId);
      await wbot.setStatus(status);
    } catch (err) {
      logger.error(`[PROFILE] Erro ao definir status: ${err}`);
      throw new AppError(`Erro ao definir status: ${err}`);
    }
  }

  async setDisplayName(whatsappId: number, name: string): Promise<boolean> {
    if (!name || name.trim().length === 0) {
      throw new AppError("Nome é obrigatório");
    }

    try {
      const wbot = getWbot(whatsappId);
      return await wbot.setDisplayName(name);
    } catch (err) {
      logger.error(`[PROFILE] Erro ao definir nome de exibição: ${err}`);
      throw new AppError(`Erro ao definir nome de exibição: ${err}`);
    }
  }

  async setProfilePicture(
    whatsappId: number,
    mediaPath: string
  ): Promise<boolean> {
    if (!mediaPath) {
      throw new AppError("Caminho da mídia é obrigatório");
    }

    try {
      const wbot = getWbot(whatsappId);

      let media: MessageMedia;

      if (mediaPath.startsWith("http://") || mediaPath.startsWith("https://")) {
        media = await MessageMedia.fromUrl(mediaPath);
      } else {
        const uploadsDir = path.resolve(__dirname, "..", "..", "..", "public");
        const resolvedMediaPath = path.resolve(mediaPath);
        if (!resolvedMediaPath.startsWith(uploadsDir + path.sep)) {
          throw new AppError("Caminho de arquivo inválido", 400);
        }
        if (!fs.existsSync(resolvedMediaPath)) {
          throw new AppError("Arquivo não encontrado");
        }
        media = MessageMedia.fromFilePath(resolvedMediaPath);
      }

      return await wbot.setProfilePicture(media);
    } catch (err) {
      logger.error(`[PROFILE] Erro ao definir foto de perfil: ${err}`);
      throw new AppError(`Erro ao definir foto de perfil: ${err}`);
    }
  }

  async removeProfilePicture(whatsappId: number): Promise<boolean> {
    try {
      const wbot = getWbot(whatsappId);
      return await (wbot as any).removeProfilePicture();
    } catch (err) {
      logger.error(`[PROFILE] Erro ao remover foto de perfil: ${err}`);
      throw new AppError(`Erro ao remover foto de perfil: ${err}`);
    }
  }

  async getWWebVersion(whatsappId: number): Promise<string> {
    try {
      const wbot = getWbot(whatsappId);
      const version = await wbot.getWWebVersion();
      return version;
    } catch (err) {
      logger.error(`[PROFILE] Erro ao obter versão do WhatsApp Web: ${err}`);
      throw new AppError(`Erro ao obter versão do WhatsApp Web: ${err}`);
    }
  }

  async sendPresenceUnavailable(whatsappId: number): Promise<void> {
    try {
      const wbot = getWbot(whatsappId);
      await wbot.sendPresenceUnavailable();
    } catch (err) {
      logger.error(`[PROFILE] Erro ao definir presença indisponível: ${err}`);
      throw new AppError(`Erro ao definir presença indisponível: ${err}`);
    }
  }

  async sendPresenceAvailable(whatsappId: number): Promise<void> {
    try {
      const wbot = getWbot(whatsappId);
      await wbot.sendPresenceAvailable();
    } catch (err) {
      logger.error(`[PROFILE] Erro ao definir presença disponível: ${err}`);
      throw new AppError(`Erro ao definir presença disponível: ${err}`);
    }
  }
}

export default new ProfileManagementService();

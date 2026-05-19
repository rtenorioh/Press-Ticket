import { getWbot } from "../../libs/wbot";
import User from "../../models/User";
import Whatsapp from "../../models/Whatsapp";
import { logger } from "../../utils/logger";
import { getVersionInfo } from "../VersionService/VersionService";

interface UpdateResult {
  systemNeedsUpdate: boolean;
  wwjsNeedsUpdate: boolean;
  systemCurrent: string;
  systemLatest: string | null;
  wwjsCurrent: string | null;
  wwjsLatest: string | null;
}

const checkForUpdates = async (): Promise<UpdateResult> => {
  const info = await getVersionInfo();

  return {
    systemNeedsUpdate: info.needsUpdate,
    wwjsNeedsUpdate: info.whatsappLibNeedsUpdate,
    systemCurrent: info.currentVersion,
    systemLatest: info.latestVersion,
    wwjsCurrent: info.whatsappLibVersion,
    wwjsLatest: info.whatsappLibLatestVersion
  };
};

const buildMessage = (result: UpdateResult): string => {
  const companyName = (
    process.env.COMPANY_NAME || "Press Ticket"
  ).toUpperCase();
  const lines: string[] = [];
  lines.push(`🚀 *${companyName} — Atualização Disponível*\n`);

  if (result.systemNeedsUpdate) {
    lines.push(`*Sistema:* ${result.systemCurrent} ➜ ${result.systemLatest}`);
  }

  if (result.wwjsNeedsUpdate) {
    lines.push(
      `*whatsapp-web.js:* v${result.wwjsCurrent} ➜ v${result.wwjsLatest}`
    );
  }

  lines.push("\nAcesse o painel para aplicar as atualizações.");

  return lines.join("\n");
};

const getActiveWhatsappId = async (): Promise<number | null> => {
  const whatsapp = await Whatsapp.findOne({
    where: { status: "CONNECTED", isDefault: true },
    attributes: ["id"]
  });

  if (whatsapp) return whatsapp.id;

  const anyConnected = await Whatsapp.findOne({
    where: { status: "CONNECTED" },
    attributes: ["id"]
  });

  return anyConnected ? anyConnected.id : null;
};

export const CheckUpdatesNotifyService = async (): Promise<void> => {
  try {
    logger.info("[CheckUpdates] Verificando atualizações...");

    const result = await checkForUpdates();

    if (!result.systemNeedsUpdate && !result.wwjsNeedsUpdate) {
      logger.info("[CheckUpdates] Sistema e wwebjs estão atualizados.");
      return;
    }

    logger.info(
      `[CheckUpdates] Atualização detectada — Sistema: ${result.systemNeedsUpdate}, wwebjs: ${result.wwjsNeedsUpdate}`
    );

    const whatsappId = await getActiveWhatsappId();
    if (!whatsappId) {
      logger.warn(
        "[CheckUpdates] Nenhuma conexão WhatsApp ativa para enviar notificações."
      );
      return;
    }

    const users = await User.findAll({
      where: { profile: "masteradmin" },
      attributes: ["id", "name", "whatsappNumber"]
    });

    const eligibleUsers = users.filter(
      u => u.whatsappNumber && u.whatsappNumber.replace(/\D/g, "").length >= 10
    );

    if (eligibleUsers.length === 0) {
      logger.info(
        "[CheckUpdates] Nenhum masteradmin com whatsappNumber para notificar."
      );
      return;
    }

    const wbot = getWbot(whatsappId);
    const message = buildMessage(result);

    for (const user of eligibleUsers) {
      const cleanNumber = user.whatsappNumber!.replace(/\D/g, "");
      const jid = `${cleanNumber}@c.us`;

      await wbot.sendMessage(jid, message).catch(err => {
        logger.error(
          `[CheckUpdates] Erro ao notificar masteradmin ${user.id} (${cleanNumber}): ${err.message}`
        );
      });
    }

    logger.info(
      `[CheckUpdates] ${eligibleUsers.length} masteradmin(s) notificado(s).`
    );
  } catch (err: unknown) {
    logger.error(`[CheckUpdates] Erro no serviço: ${err instanceof Error ? err.message : String(err)}`);
  }
};

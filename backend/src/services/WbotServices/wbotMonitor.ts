import { Client, WAState } from "whatsapp-web.js";

import { getIO } from "../../libs/socket";
import Whatsapp from "../../models/Whatsapp";
import { logger } from "../../utils/logger";
import { StartWhatsAppSession } from "./StartWhatsAppSession";

interface Session extends Client {
  id?: number;
}

const monitorIntervals: Map<number, NodeJS.Timeout> = new Map();

// Mapeia estados brutos do whatsapp-web.js para estados que o frontend entende
const mapStateToStatus = (state: string): string => {
  const stateMap: Record<string, string> = {
    CONNECTED: "CONNECTED",
    OPENING: "OPENING",
    PAIRING: "PAIRING",
    TIMEOUT: "TIMEOUT",
    CONFLICT: "DISCONNECTED",
    UNPAIRED: "DISCONNECTED",
    UNPAIRED_IDLE: "DISCONNECTED",
    PROXYBLOCK: "DISCONNECTED",
    TOS_BLOCK: "DISCONNECTED",
    SMB_TOS_BLOCK: "DISCONNECTED",
    DEPRECATED_VERSION: "DISCONNECTED"
  };
  return stateMap[state] || "OPENING";
};

// Estados que precisam de tentativa de recuperação
const RECOVERY_STATES = [
  "CONFLICT",
  "UNPAIRED",
  "UNPAIRED_IDLE",
  "DEPRECATED_VERSION"
];

const wbotMonitor = async (
  wbot: Session,
  whatsapp: Whatsapp
): Promise<void> => {
  const io = getIO();
  const sessionName = whatsapp.name;

  // Limpar monitor anterior se existir
  const existingInterval = monitorIntervals.get(whatsapp.id);
  if (existingInterval) {
    clearInterval(existingInterval);
    monitorIntervals.delete(whatsapp.id);
  }

  try {
    wbot.on("change_state", async newState => {
      logger.info(`Monitor session: ${sessionName}, ${newState}`);

      const mappedStatus = mapStateToStatus(newState);

      try {
        await whatsapp.update({ status: mappedStatus });
      } catch (err) {
        logger.error(err);
      }

      io.emit("whatsappSession", {
        action: "update",
        session: whatsapp
      });

      // Tentar recuperar de estados problemáticos
      if (RECOVERY_STATES.includes(newState)) {
        logger.warn(
          `[MONITOR] Sessão ${sessionName} em estado ${newState}. Tentando recuperar...`
        );
        try {
          await whatsapp.update({ status: "OPENING", session: "" });
          io.emit("whatsappSession", { action: "update", session: whatsapp });
          setTimeout(() => StartWhatsAppSession(whatsapp), 3000);
        } catch (err) {
          logger.error(
            `[MONITOR] Erro ao recuperar sessão ${sessionName}: ${err}`
          );
        }
      }
    });

    wbot.on("disconnected", async reason => {
      logger.info(`Disconnected session: ${sessionName}, reason: ${reason}`);
      try {
        await whatsapp.update({ status: "OPENING", session: "", number: "" });
      } catch (err) {
        logger.error(err);
      }

      io.emit("whatsappSession", {
        action: "update",
        session: whatsapp
      });

      // Limpar monitor
      const interval = monitorIntervals.get(whatsapp.id);
      if (interval) {
        clearInterval(interval);
        monitorIntervals.delete(whatsapp.id);
      }

      setTimeout(() => StartWhatsAppSession(whatsapp), 3000);
    });

    // Verificação periódica de saúde da sessão (a cada 60s)
    const healthInterval = setInterval(async () => {
      try {
        if (!wbot.pupPage || wbot.pupPage.isClosed()) {
          logger.warn(
            `[MONITOR] PupPage da sessão ${sessionName} não está disponível. Reconectando...`
          );
          clearInterval(healthInterval);
          monitorIntervals.delete(whatsapp.id);

          try {
            await whatsapp.update({ status: "OPENING", session: "" });
            io.emit("whatsappSession", { action: "update", session: whatsapp });
            setTimeout(() => StartWhatsAppSession(whatsapp), 3000);
          } catch (err) {
            logger.error(
              `[MONITOR] Erro ao reiniciar sessão ${sessionName}: ${err}`
            );
          }
          return;
        }

        const state = await wbot.getState().catch(() => null);

        if (state === WAState.CONNECTED) {
          // Sessão saudável - atualizar DB se necessário
          const currentWhatsapp = await Whatsapp.findByPk(whatsapp.id);
          if (currentWhatsapp && currentWhatsapp.status !== "CONNECTED") {
            await currentWhatsapp.update({ status: "CONNECTED" });
            whatsapp.status = "CONNECTED";
            io.emit("whatsappSession", { action: "update", session: whatsapp });
          }
        } else if (state === null) {
          // Não conseguiu obter estado - possível crash do browser
          logger.warn(
            `[MONITOR] Não foi possível obter estado da sessão ${sessionName}`
          );
        }
      } catch (err) {
        logger.error(
          `[MONITOR] Erro no health check da sessão ${sessionName}: ${err}`
        );
      }
    }, 60000); // 60 segundos

    monitorIntervals.set(whatsapp.id, healthInterval);
  } catch (err) {
    logger.error(err);
  }
};

export default wbotMonitor;

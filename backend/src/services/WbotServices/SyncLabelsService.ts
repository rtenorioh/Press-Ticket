import { Op } from "sequelize";
import { getWbot } from "../../libs/wbot";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import TicketLabel from "../../models/TicketLabel";
import WhatsappLabel from "../../models/WhatsappLabel";
import { logger } from "../../utils/logger";
import { getIO } from "../../libs/socket";

const syncInProgress = new Set<number>();

interface RawLabel {
  id: string;
  name: string;
  hexColor?: string;
}

/**
 * Busca labels de negócio do WhatsApp Web.
 * Filtra tipos de sistema (1=Não lidas, 2=Grupos, 3=Favoritos).
 * Nota: "Listas personalizadas" do WhatsApp não são acessíveis via whatsapp-web.js.
 */
const fetchBusinessLabels = async (wbot: any): Promise<RawLabel[]> => {
  try {
    // Buscar labels diretamente do store para ter acesso ao campo 'type'
    const rawLabels = await wbot.pupPage.evaluate(() => {
      const stores = (window as any).require("WAWebCollections");
      const models = stores.Label.getModelsArray();
      return models.map((m: any) => {
        const s = m.serialize ? m.serialize() : {};
        return {
          id: String(s.id),
          name: s.name || "",
          type: s.type,
          hexColor: m.hexColor || null
        };
      });
    });

    // Tipos de sistema: 1=Não lidas, 2=Grupos, 3=Favoritos
    const systemTypes = [1, 2, 3];
    const businessLabels: RawLabel[] = rawLabels
      .filter((l: any) => !systemTypes.includes(l.type))
      .map((l: any) => ({
        id: l.id,
        name: l.name,
        hexColor: l.hexColor || undefined
      }));

    return businessLabels;
  } catch (err: any) {
    logger.error(
      `[SYNC_LABELS] Erro ao buscar labels: ${err.message}`
    );
    return [];
  }
};

const SyncLabelsService = async (whatsappId: number): Promise<void> => {
  // Guard contra execuções simultâneas
  if (syncInProgress.has(whatsappId)) {
    logger.info(`[SYNC_LABELS] Sync já em andamento para WhatsApp ${whatsappId}, ignorando`);
    return;
  }

  syncInProgress.add(whatsappId);

  try {
    const wbot = getWbot(whatsappId);

    // 1. Buscar labels do WhatsApp Business
    const waLabels = await fetchBusinessLabels(wbot);
    logger.info(`[SYNC_LABELS] WhatsApp ${whatsappId}: ${waLabels.length} labels de negócio encontradas`);
    waLabels.forEach(l => {
      logger.info(`[SYNC_LABELS] Label: id=${l.id} name="${l.name}" hexColor=${l.hexColor}`);
    });

    // 2. Sincronizar labels na tabela WhatsappLabels
    const existingLabels = await WhatsappLabel.findAll({
      where: { whatsappId }
    });

    const existingLabelIds = existingLabels.map(l => l.labelId);
    const waLabelIds = waLabels.map(l => String(l.id));

    // Remover labels que não existem mais no WhatsApp
    const removedLabelIds = existingLabelIds.filter(id => !waLabelIds.includes(id));
    if (removedLabelIds.length > 0) {
      const removedLabels = existingLabels.filter(l => removedLabelIds.includes(l.labelId));
      await TicketLabel.destroy({
        where: { whatsappLabelId: removedLabels.map(l => l.id) }
      });
      await WhatsappLabel.destroy({
        where: { whatsappId, labelId: removedLabelIds }
      });
      logger.info(`[SYNC_LABELS] Removidas ${removedLabelIds.length} labels obsoletas`);
    }

    // Upsert das labels atuais
    const savedLabels: WhatsappLabel[] = [];
    for (const waLabel of waLabels) {
      const [label] = await WhatsappLabel.findOrCreate({
        where: { whatsappId, labelId: String(waLabel.id) },
        defaults: {
          whatsappId,
          labelId: String(waLabel.id),
          name: waLabel.name,
          hexColor: waLabel.hexColor || null
        }
      });

      if (label.name !== waLabel.name || label.hexColor !== (waLabel.hexColor || null)) {
        await label.update({
          name: waLabel.name,
          hexColor: waLabel.hexColor || null
        });
      }

      savedLabels.push(label);
    }

    // 3. Para cada label, buscar chats associados e vincular a tickets
    for (const label of savedLabels) {
      try {
        const chats: any[] = await wbot.getChatsByLabelId(label.labelId);

        const chatNumbers = chats
          .map(chat => {
            const id = chat.id?._serialized || String(chat.id);
            return id.replace("@c.us", "").replace("@g.us", "");
          })
          .filter(Boolean);

        if (chatNumbers.length === 0) {
          await TicketLabel.destroy({ where: { whatsappLabelId: label.id } });
          continue;
        }

        const contacts = await Contact.findAll({
          where: { number: { [Op.in]: chatNumbers } },
          attributes: ["id", "number"]
        });

        if (contacts.length === 0) {
          await TicketLabel.destroy({ where: { whatsappLabelId: label.id } });
          continue;
        }

        const contactIds = contacts.map(c => c.id);

        const tickets = await Ticket.findAll({
          where: {
            contactId: { [Op.in]: contactIds },
            whatsappId,
            status: { [Op.in]: ["open", "pending"] }
          },
          attributes: ["id"]
        });

        const ticketIds = tickets.map(t => t.id);

        if (ticketIds.length > 0) {
          await TicketLabel.destroy({
            where: {
              whatsappLabelId: label.id,
              ticketId: { [Op.notIn]: ticketIds }
            }
          });
        } else {
          await TicketLabel.destroy({ where: { whatsappLabelId: label.id } });
        }

        for (const ticketId of ticketIds) {
          await TicketLabel.findOrCreate({
            where: { ticketId, whatsappLabelId: label.id },
            defaults: { ticketId, whatsappLabelId: label.id }
          });
        }

        logger.info(`[SYNC_LABELS] Label "${label.name}": ${chats.length} chats → ${ticketIds.length} tickets`);
      } catch (labelErr: any) {
        logger.warn(`[SYNC_LABELS] Erro ao sincronizar label "${label.name}": ${labelErr.message}`);
      }
    }

    // 4. Emitir evento para atualizar frontend
    const io = getIO();
    const allLabels = await WhatsappLabel.findAll({
      where: { whatsappId },
      include: [{ model: TicketLabel, attributes: ["ticketId"] }]
    });

    io.emit("whatsappLabels", {
      action: "sync",
      whatsappId,
      labels: allLabels.map(l => ({
        id: l.id,
        labelId: l.labelId,
        name: l.name,
        hexColor: l.hexColor,
        ticketIds: l.ticketLabels?.map(tl => tl.ticketId) || []
      }))
    });

    logger.info(`[SYNC_LABELS] Sincronização completa para WhatsApp ${whatsappId}`);
  } catch (err: any) {
    logger.error(`[SYNC_LABELS] Erro geral ao sincronizar labels: ${err.message}`);
  } finally {
    syncInProgress.delete(whatsappId);
  }
};

export default SyncLabelsService;

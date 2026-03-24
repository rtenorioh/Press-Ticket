import Contact from "../../models/Contact";
import { getWbot } from "../../libs/wbot";
import { logger } from "../../utils/logger";

interface Request {
  contactId: number;
  whatsappId: number;
}

const UpdateGroupProfilePicService = async ({
  contactId,
  whatsappId
}: Request): Promise<string | undefined> => {
  const contact = await Contact.findByPk(contactId);
  
  if (!contact) {
    logger.warn(`[UpdateGroupProfilePic] Contato ${contactId} não encontrado`);
    return undefined;
  }

  if (!contact.isGroup) {
    logger.warn(`[UpdateGroupProfilePic] Contato ${contactId} não é um grupo`);
    return undefined;
  }

  try {
    const wbot = getWbot(whatsappId);
    
    const groupJid = contact.number.includes("@g.us") 
      ? contact.number 
      : `${contact.number}@g.us`;

    let profilePicUrl: string | undefined;
    
    try {
      profilePicUrl = await wbot.getProfilePicUrl(groupJid);
      logger.info(`[UpdateGroupProfilePic] Foto obtida para grupo ${groupJid}: ${profilePicUrl ? 'SIM' : 'NÃO'}`);
    } catch (picError) {
      logger.warn(`[UpdateGroupProfilePic] Erro ao obter foto do grupo ${groupJid}:`, picError);
      profilePicUrl = undefined;
    }

    if (profilePicUrl && profilePicUrl !== contact.profilePicUrl) {
      await contact.update({ profilePicUrl });
      logger.info(`[UpdateGroupProfilePic] Foto do grupo ${groupJid} atualizada no banco`);
      
      try {
        const { getIO } = require("../../libs/socket");
        const io = getIO();
        io.emit("contact", {
          action: "update",
          contact: contact.toJSON()
        });
      } catch (socketErr) {
        logger.warn(`[UpdateGroupProfilePic] Erro ao emitir socket:`, socketErr);
      }
    }

    return profilePicUrl;
  } catch (error) {
    logger.error(`[UpdateGroupProfilePic] Erro geral:`, error);
    return undefined;
  }
};

export default UpdateGroupProfilePicService;

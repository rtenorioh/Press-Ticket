import { getWbot } from "../../libs/wbot";
import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";
import Whatsapp from "../../models/Whatsapp";
import { logger } from "../../utils/logger";

interface Request {
  contactId: string;
  whatsappId?: number;
}

interface Response {
  about: string | null;
  contactId: number;
  contactName: string;
  contactNumber: string;
}

const GetAboutService = async ({
  contactId,
  whatsappId
}: Request): Promise<Response> => {
  const contact = await Contact.findByPk(contactId);

  if (!contact) {
    throw new AppError("ERR_CONTACT_NOT_FOUND", 404);
  }

  if (contact.isGroup) {
    throw new AppError("ERR_ABOUT_NOT_SUPPORTED_FOR_GROUP", 400);
  }

  let sessionId: number | null = whatsappId || null;

  if (!sessionId) {
    const connected = await Whatsapp.findOne({
      where: { status: "CONNECTED", type: "wwebjs" }
    });
    sessionId = connected?.id || null;
  }

  if (!sessionId) {
    throw new AppError("ERR_NO_WHATSAPP_SESSION", 400);
  }

  const wbot = await getWbot(sessionId);

  const numberId = await wbot.getNumberId(contact.number!);
  if (!numberId) {
    throw new AppError("ERR_NUMBER_NOT_REGISTERED", 404);
  }

  let about: string | null = null;

  try {
    const wContact = await wbot.getContactById(numberId._serialized);
    const wContactExtended = wContact as unknown as {
      getAbout?: () => Promise<string | null>;
    };
    if (typeof wContactExtended.getAbout === "function") {
      about = await wContactExtended.getAbout();
    }
  } catch (error: unknown) {
    const err = error as { message?: string };
    logger.warn(
      `[FALLBACK] Erro ao obter contato/about do WhatsApp: ${err.message || error}`
    );
    about = null;
  }

  return {
    about,
    contactId: contact.id,
    contactName: contact.name,
    contactNumber: contact.number!
  };
};

export default GetAboutService;

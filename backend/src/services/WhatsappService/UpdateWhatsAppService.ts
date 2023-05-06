import * as Yup from "yup";
import { Op } from "sequelize";

import AppError from "../../errors/AppError";
import Whatsapp from "../../models/Whatsapp";
import ShowWhatsAppService from "./ShowWhatsAppService";
import AssociateWhatsappQueue from "./AssociateWhatsappQueue";

interface WhatsappData {
  name?: string;
  status?: string;
  session?: string;
  isDefault?: boolean;
  greetingMessage?: string;
  farewellMessage?: string;
  //Difinindo horario comercial
  defineWorkHours?: boolean;
  outOfWorkMessage?: string;
  //Dias da semana.
  monday?: boolean;
  tuesday?: boolean;
  wednesday?: boolean;
  thursday?: boolean;
  friday?: boolean;
  saturday?: boolean;
  sunday?: boolean;
  // horario de cada dia da semana.
  StartDefineWorkHoursMonday?: string;
  EndDefineWorkHoursMonday?: string;
  StartDefineWorkHoursMondayLunch?: string;
  EndDefineWorkHoursMondayLunch?: string;

  StartDefineWorkHoursTuesday?: string;
  EndDefineWorkHoursTuesday?: string;
  StartDefineWorkHoursTuesdayLunch?: string;
  EndDefineWorkHoursTuesdayLunch?: string;

  StartDefineWorkHoursWednesday?: string;
  EndDefineWorkHoursWednesday?: string;
  StartDefineWorkHoursWednesdayLunch?: string;
  EndDefineWorkHoursWednesdayLunch?: string;

  StartDefineWorkHoursThursday?: string;
  EndDefineWorkHoursThursday?: string;
  StartDefineWorkHoursThursdayLunch?: string;
  EndDefineWorkHoursThursdayLunch?: string;

  StartDefineWorkHoursFriday?: string;
  EndDefineWorkHoursFriday?: string;
  StartDefineWorkHoursFridayLunch?: string;
  EndDefineWorkHoursFridayLunch?: string;

  StartDefineWorkHoursSaturday?: string;
  EndDefineWorkHoursSaturday?: string;
  StartDefineWorkHoursSaturdayLunch?: string;
  EndDefineWorkHoursSaturdayLunch?: string;

  StartDefineWorkHoursSunday?: string;
  EndDefineWorkHoursSunday?: string;
  StartDefineWorkHoursSundayLunch?: string;
  EndDefineWorkHoursSundayLunch?: string;

  ratingMessage?: string;
  queueIds?: number[];
  isDisplay?: boolean;
  isGroup?: boolean;
  sendInactiveMessage?: boolean;
  inactiveMessage?: string;
  timeInactiveMessage?: string;
}

interface Request {
  whatsappData: WhatsappData;
  whatsappId: string;
}

interface Response {
  whatsapp: Whatsapp;
  oldDefaultWhatsapp: Whatsapp | null;
}

const UpdateWhatsAppService = async ({
  whatsappData,
  whatsappId
}: Request): Promise<Response> => {
  const schema = Yup.object().shape({
    name: Yup.string().min(2),
    status: Yup.string(),
    isDefault: Yup.boolean(),
    isGroup: Yup.boolean(),
    sendInactiveMessage: Yup.boolean(),
    inactiveMessage: Yup.string(),
    timeInactiveMessage: Yup.string()
  });

  const {
    name,
    status,
    isDefault,
    session,
    greetingMessage,
    farewellMessage,

    defineWorkHours,
    outOfWorkMessage,

    monday,
    tuesday,
    wednesday,
    thursday,
    friday,
    saturday,
    sunday,

    StartDefineWorkHoursMonday,
    EndDefineWorkHoursMonday,
    StartDefineWorkHoursMondayLunch,
    EndDefineWorkHoursMondayLunch,

    StartDefineWorkHoursTuesday,
    EndDefineWorkHoursTuesday,
    StartDefineWorkHoursTuesdayLunch,
    EndDefineWorkHoursTuesdayLunch,

    StartDefineWorkHoursWednesday,
    EndDefineWorkHoursWednesday,
    StartDefineWorkHoursWednesdayLunch,
    EndDefineWorkHoursWednesdayLunch,

    StartDefineWorkHoursThursday,
    EndDefineWorkHoursThursday,
    StartDefineWorkHoursThursdayLunch,
    EndDefineWorkHoursThursdayLunch,

    StartDefineWorkHoursFriday,
    EndDefineWorkHoursFriday,
    StartDefineWorkHoursFridayLunch,
    EndDefineWorkHoursFridayLunch,

    StartDefineWorkHoursSaturday,
    EndDefineWorkHoursSaturday,
    StartDefineWorkHoursSaturdayLunch,
    EndDefineWorkHoursSaturdayLunch,

    StartDefineWorkHoursSunday,
    EndDefineWorkHoursSunday,
    StartDefineWorkHoursSundayLunch,
    EndDefineWorkHoursSundayLunch,

    ratingMessage,
    isDisplay,
    isGroup,
    sendInactiveMessage,
    inactiveMessage,
    timeInactiveMessage,
    queueIds = []
  } = whatsappData;

  try {
    await schema.validate({ name, status, isDefault });
  } catch (err) {
    throw new AppError(err.message);
  }

  if (queueIds.length > 1 && !greetingMessage) {
    throw new AppError("ERR_WAPP_GREETING_REQUIRED");
  }

  let oldDefaultWhatsapp: Whatsapp | null = null;

  if (isDefault) {
    oldDefaultWhatsapp = await Whatsapp.findOne({
      where: { isDefault: true, id: { [Op.not]: whatsappId } }
    });
    if (oldDefaultWhatsapp) {
      await oldDefaultWhatsapp.update({ isDefault: false });
    }
  }

  if (isGroup) {
    oldDefaultWhatsapp = await Whatsapp.findOne({
      where: { isGroup: true, id: { [Op.not]: whatsappId } }
    });
    if (oldDefaultWhatsapp) {
      await oldDefaultWhatsapp.update({ isGroup: false });
    }
  }

  if (sendInactiveMessage) {
    oldDefaultWhatsapp = await Whatsapp.findOne({
      where: {
        sendInactiveMessage: true,
        id: { [Op.not]: whatsappId }
      }
    });
    if (oldDefaultWhatsapp) {
      await oldDefaultWhatsapp.update({ sendInactiveMessage: false });
    }
  }

  const whatsapp = await ShowWhatsAppService(whatsappId);

  await whatsapp.update({
    name,
    status,
    session,
    greetingMessage,
    farewellMessage,

    defineWorkHours,
    outOfWorkMessage,

    monday,
    tuesday,
    wednesday,
    thursday,
    friday,
    saturday,
    sunday,

    StartDefineWorkHoursMonday,
    EndDefineWorkHoursMonday,
    StartDefineWorkHoursMondayLunch,
    EndDefineWorkHoursMondayLunch,

    StartDefineWorkHoursTuesday,
    EndDefineWorkHoursTuesday,
    StartDefineWorkHoursTuesdayLunch,
    EndDefineWorkHoursTuesdayLunch,

    StartDefineWorkHoursWednesday,
    EndDefineWorkHoursWednesday,
    StartDefineWorkHoursWednesdayLunch,
    EndDefineWorkHoursWednesdayLunch,

    StartDefineWorkHoursThursday,
    EndDefineWorkHoursThursday,
    StartDefineWorkHoursThursdayLunch,
    EndDefineWorkHoursThursdayLunch,

    StartDefineWorkHoursFriday,
    EndDefineWorkHoursFriday,
    StartDefineWorkHoursFridayLunch,
    EndDefineWorkHoursFridayLunch,

    StartDefineWorkHoursSaturday,
    EndDefineWorkHoursSaturday,
    StartDefineWorkHoursSaturdayLunch,
    EndDefineWorkHoursSaturdayLunch,

    StartDefineWorkHoursSunday,
    EndDefineWorkHoursSunday,
    StartDefineWorkHoursSundayLunch,
    EndDefineWorkHoursSundayLunch,
    
    ratingMessage,
    isDefault,
    isDisplay,
    isGroup,
    sendInactiveMessage,
    inactiveMessage,
    timeInactiveMessage
  });

  await AssociateWhatsappQueue(whatsapp, queueIds);

  return { whatsapp, oldDefaultWhatsapp };
};

export default UpdateWhatsAppService;

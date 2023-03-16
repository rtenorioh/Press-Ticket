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
  StartDefineWorkHoursMonday?: Date;
  EndDefineWorkHoursMonday?: Date;
  StartDefineWorkHoursMondayLunch?: Date;
  EndDefineWorkHoursMondayLunch?: Date;

  StartDefineWorkHoursTuesday?: Date;
  EndDefineWorkHoursTuesday?: Date;
  StartDefineWorkHoursTuesdayLunch?: Date;
  EndDefineWorkHoursTuesdayLunch?: Date;

  StartDefineWorkHoursWednesday?: Date;
  EndDefineWorkHoursWednesday?: Date;
  StartDefineWorkHoursWednesdayLunch?: Date;
  EndDefineWorkHoursWednesdayLunch?: Date;

  StartDefineWorkHoursThursday?: Date;
  EndDefineWorkHoursThursday?: Date;
  StartDefineWorkHoursThursdayLunch?: Date;
  EndDefineWorkHoursThursdayLunch?: Date;

  StartDefineWorkHoursFriday?: Date;
  EndDefineWorkHoursFriday?: Date;
  StartDefineWorkHoursFridayLunch?: Date;
  EndDefineWorkHoursFridayLunch?: Date;

  StartDefineWorkHoursSaturday?: Date;
  EndDefineWorkHoursSaturday?: Date;
  StartDefineWorkHoursSaturdayLunch?: Date;
  EndDefineWorkHoursSaturdayLunch?: Date;

  StartDefineWorkHoursSunday?: Date;
  EndDefineWorkHoursSunday?: Date;
  StartDefineWorkHoursSundayLunch?: Date;
  EndDefineWorkHoursSundayLunch?: Date;

  ratingMessage?: string;
  queueIds?: number[];
  isDisplay?: boolean;
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
    isDefault: Yup.boolean()
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
    isDisplay
  });

  await AssociateWhatsappQueue(whatsapp, queueIds);

  return { whatsapp, oldDefaultWhatsapp };
};

export default UpdateWhatsAppService;

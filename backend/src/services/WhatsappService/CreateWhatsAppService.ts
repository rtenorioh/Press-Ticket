import * as Yup from "yup";

import AppError from "../../errors/AppError";
import Whatsapp from "../../models/Whatsapp";
import AssociateWhatsappQueue from "./AssociateWhatsappQueue";

interface Request {
  name: string;
  queueIds?: number[];
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
  status?: string;
  isDefault?: boolean;
  isDisplay?: boolean;
}

interface Response {
  whatsapp: Whatsapp;
  oldDefaultWhatsapp: Whatsapp | null;
}

const CreateWhatsAppService = async ({
  name,
  status = "OPENING",
  queueIds = [],
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
  isDefault = false,
  isDisplay = false
}: Request): Promise<Response> => {
  const schema = Yup.object().shape({
    name: Yup.string()
      .required()
      .min(2)
      .test(
        "Check-name",
        "This whatsapp name is already used.",
        async value => {
          if (!value) return false;
          const nameExists = await Whatsapp.findOne({
            where: { name: value }
          });
          return !nameExists;
        }
      ),
    isDefault: Yup.boolean().required()
  });

  try {
    await schema.validate({ name, status, isDefault });
  } catch (err) {
    throw new AppError(err.message);
  }

  const whatsappFound = await Whatsapp.findOne();

  isDefault = !whatsappFound;

  let oldDefaultWhatsapp: Whatsapp | null = null;

  if (isDefault) {
    oldDefaultWhatsapp = await Whatsapp.findOne({
      where: { isDefault: true }
    });
    if (oldDefaultWhatsapp) {
      await oldDefaultWhatsapp.update({ isDefault: false });
    }
  }

  if (queueIds.length > 1 && !greetingMessage) {
    throw new AppError("ERR_WAPP_GREETING_REQUIRED");
  }

  const whatsapp = await Whatsapp.create(
    {
      name,
      status,
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
    },
    { include: ["queues"] }
  );

  await AssociateWhatsappQueue(whatsapp, queueIds);

  return { whatsapp, oldDefaultWhatsapp };
};

export default CreateWhatsAppService;

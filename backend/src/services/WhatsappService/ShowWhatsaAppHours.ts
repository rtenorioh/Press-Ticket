import Whatsapp from "../../models/Whatsapp";
import AppError from "../../errors/AppError";

const ShowWhatsaAppHours = async (id: string | number): Promise<Whatsapp> => {
const whatsapp = await Whatsapp.findByPk(id, {
    attributes: ["id", "name", "number", "defineWorkHours", "outOfWorkMessage", "thursday", "StartDefineWorkHoursThursday", "EndDefineWorkHoursThursday", "StartDefineWorkHoursThursdayLunch", "EndDefineWorkHoursThursdayLunch", "sunday","StartDefineWorkHoursSunday", "EndDefineWorkHoursSunday", "StartDefineWorkHoursSundayLunch", "EndDefineWorkHoursSundayLunch",  "monday", "StartDefineWorkHoursMonday", "EndDefineWorkHoursMonday", "StartDefineWorkHoursMondayLunch", "EndDefineWorkHoursMondayLunch", "tuesday", "StartDefineWorkHoursTuesday", "EndDefineWorkHoursTuesday", "StartDefineWorkHoursTuesdayLunch", "EndDefineWorkHoursTuesdayLunch", "wednesday", "StartDefineWorkHoursWednesday", "EndDefineWorkHoursWednesday", "StartDefineWorkHoursWednesdayLunch", "EndDefineWorkHoursWednesdayLunch", "friday", "StartDefineWorkHoursFriday", "EndDefineWorkHoursFriday", "StartDefineWorkHoursFridayLunch", "EndDefineWorkHoursFridayLunch", "saturday", "StartDefineWorkHoursSaturday", "EndDefineWorkHoursSaturday", "StartDefineWorkHoursSaturdayLunch", "EndDefineWorkHoursSaturdayLunch"]
  });
  
  if (!whatsapp) {
    throw new AppError("ERR_NO_WAPP_FOUND", 404);
  }
  
  return whatsapp;
}

export default ShowWhatsaAppHours;
import Personalization from "../../models/Personalization";

const listPersonalizations = async (): Promise<Personalization[]> => {
  const personalizations = await Personalization.findAll();
  return personalizations;
};

export default listPersonalizations;

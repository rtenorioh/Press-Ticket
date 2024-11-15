import Personalization from "../../models/Personalization";

interface PersonalizationData {
  theme: string;
  company?: string;
  url?: string;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundDefault?: string;
  backgroundPaper?: string;
  favico?: string | null;
  logo?: string | null;
  logoTicket?: string | null;
}

interface Response {
  isNew: boolean;
  data: Personalization;
}

const createOrUpdatePersonalization = async ({
  personalizationData,
  theme
}: {
  personalizationData: PersonalizationData;
  theme: string;
}): Promise<Response> => {
  const {
    company,
    url,
    primaryColor,
    secondaryColor,
    backgroundDefault,
    backgroundPaper,
    favico,
    logo,
    logoTicket
  } = personalizationData;

  let personalization = await Personalization.findOne({ where: { theme } });

  if (personalization) {
    await personalization.update({
      company,
      url,
      primaryColor,
      secondaryColor,
      backgroundDefault,
      backgroundPaper,
      favico,
      logo,
      logoTicket
    });

    await personalization.reload();
    return { isNew: false, data: personalization };
  }
  personalization = await Personalization.create({
    theme,
    company,
    url,
    primaryColor,
    secondaryColor,
    backgroundDefault,
    backgroundPaper,
    favico,
    logo,
    logoTicket
  });

  return { isNew: true, data: personalization };
};

export default createOrUpdatePersonalization;

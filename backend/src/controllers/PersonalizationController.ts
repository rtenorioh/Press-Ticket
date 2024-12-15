import { Request, Response } from "express";
import path from "path";
import { getIO } from "../libs/socket";
import createOrUpdatePersonalization from "../services/PersonalizationServices/CreateOrUpdatePersonalizationService";
import deletePersonalization from "../services/PersonalizationServices/DeletePersonalizationService";
import listPersonalizations from "../services/PersonalizationServices/ListPersonalizationsService";

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

export const createOrUpdateCompany = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { theme } = req.params;
    const { company, url } = req.body;

    const personalizationData = { theme, company, url };

    const personalization = await createOrUpdatePersonalization({
      personalizationData,
      theme
    });

    const io = getIO();
    io.emit("personalization", {
      action: personalization.isNew ? "create" : "update",
      personalization: personalization.data
    });

    return res.status(200).json(personalization.data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createOrUpdateLogos = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { theme } = req.params;
    const personalizationData: PersonalizationData = {
      theme
    };

    if (req.files) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (files.favico && files.favico.length > 0) {
        personalizationData.favico = path.basename(files.favico[0].path);
      }
      if (files.logo && files.logo.length > 0) {
        personalizationData.logo = path.basename(files.logo[0].path);
      }
      if (files.logoTicket && files.logoTicket.length > 0) {
        personalizationData.logoTicket = path.basename(
          files.logoTicket[0].path
        );
      }
    }

    personalizationData.theme = theme;

    const personalization = await createOrUpdatePersonalization({
      personalizationData,
      theme
    });

    const io = getIO();
    io.emit("personalization", {
      action: personalization.isNew ? "create" : "update",
      personalization: personalization.data
    });

    return res.status(200).json(personalization.data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createOrUpdateColors = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { theme } = req.params;
    const { primaryColor, secondaryColor, backgroundDefault, backgroundPaper } =
      req.body;

    const personalizationData: PersonalizationData = {
      theme,
      primaryColor,
      secondaryColor,
      backgroundDefault,
      backgroundPaper
    };

    const personalization = await createOrUpdatePersonalization({
      personalizationData,
      theme
    });

    const io = getIO();
    io.emit("personalization", {
      action: personalization.isNew ? "create" : "update",
      personalization: personalization.data
    });

    return res.status(200).json(personalization.data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const list = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const personalizations = await listPersonalizations();
    return res.status(200).json(personalizations);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { theme } = req.params;
    await deletePersonalization(theme);
    const io = getIO();
    io.emit("personalization", {
      action: "delete",
      theme
    });
    return res.status(204).send();
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

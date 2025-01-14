import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { getIO } from "../libs/socket";
import createOrUpdatePersonalization from "../services/PersonalizationServices/CreateOrUpdatePersonalizationService";
import deletePersonalization from "../services/PersonalizationServices/DeletePersonalizationService";
import listPersonalizations from "../services/PersonalizationServices/ListPersonalizationsService";

type LogoType = 'favico' | 'logo' | 'logoTicket';

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

// Definir o caminho absoluto para o diretório de uploads
const UPLOAD_PATH = path.resolve(__dirname, "..", "..", "public", "logos");

const ensureUploadPath = () => {
  if (!fs.existsSync(UPLOAD_PATH)) {
    fs.mkdirSync(UPLOAD_PATH, { recursive: true });
  }
};

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
    console.log("Recebendo requisição de upload para tema:", theme);
    console.log("Arquivos recebidos:", req.files);

    const personalizationData: PersonalizationData = {
      theme
    };

    if (req.files) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (files.favico && files.favico.length > 0) {
        personalizationData.favico = path.basename(files.favico[0].path);
        console.log("Arquivo favico processado:", personalizationData.favico);
      }
      if (files.logo && files.logo.length > 0) {
        personalizationData.logo = path.basename(files.logo[0].path);
        console.log("Arquivo logo processado:", personalizationData.logo);
      }
      if (files.logoTicket && files.logoTicket.length > 0) {
        personalizationData.logoTicket = path.basename(files.logoTicket[0].path);
        console.log("Arquivo logoTicket processado:", personalizationData.logoTicket);
      }
    }

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
    console.error("Erro no upload:", error);
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

export const deleteLogo = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { theme } = req.params;
    const logoType = req.params.logoType as 'favico' | 'logo' | 'logoTicket';
    
    if (!['favico', 'logo', 'logoTicket'].includes(logoType)) {
      return res.status(400).json({ message: "Tipo de logo inválido" });
    }

    const personalizations = await listPersonalizations();
    const currentTheme = personalizations.find(p => p.theme === theme);
    
    if (!currentTheme) {
      return res.status(404).json({ message: "Tema não encontrado" });
    }

    const currentFileName = currentTheme[logoType];
    
    if (currentFileName) {
      const filePath = path.join(__dirname, "..", "..", "public", "logos", currentFileName);
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Arquivo ${filePath} deletado com sucesso`);
        }
      } catch (err) {
        console.error(`Erro ao deletar arquivo ${filePath}:`, err);
      }
    }

    const personalizationData: PersonalizationData = {
      theme,
      [logoType]: null
    };

    const personalization = await createOrUpdatePersonalization({
      personalizationData,
      theme
    });

    const io = getIO();
    io.emit("personalization", {
      action: "update",
      personalization: personalization.data
    });

    return res.status(200).json(personalization.data);
  } catch (error) {
    console.error("Erro ao deletar logo:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const list = async (_req: Request, res: Response): Promise<Response> => {
  const personalizations = await listPersonalizations();
  return res.status(200).json(personalizations);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { theme } = req.params;
    await deletePersonalization(theme);
    return res.status(200).json({ message: "Theme deleted" });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

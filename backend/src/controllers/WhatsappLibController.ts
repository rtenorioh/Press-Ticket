import { Request, Response } from "express";
import { updateWhatsappLib } from "../services/WhatsappLibService/UpdateWhatsappLibService";
import { updateWhatsappLibFromGit } from "../services/WhatsappLibService/UpdateWhatsappLibFromGitService";
import { restartBackend } from "../services/WhatsappLibService/RestartService";

export const updateWhatsappLibrary = async (req: Request, res: Response): Promise<Response> => {
  try {
    const updateResult = await updateWhatsappLib();
    
    if (!updateResult.success) {
      return res.status(500).json(updateResult);
    }
    
    try {
      const restartResult = await restartBackend();
      
      return res.status(200).json({
        success: true,
        message: `${updateResult.message} ${restartResult.success ? restartResult.message : 'O servidor precisará ser reiniciado manualmente.'}`,
        newVersion: updateResult.newVersion,
        restartSuccess: restartResult.success,
        restartMessage: restartResult.message
      });
    } catch (restartErr) {
      return res.status(200).json({
        ...updateResult,
        restartSuccess: false,
        restartMessage: "Não foi possível reiniciar o servidor automaticamente. Por favor, reinicie o servidor manualmente."
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ 
      success: false, 
      message: "Erro ao atualizar a biblioteca whatsapp-web.js", 
      error: err.message 
    });
  }
};

export const updateWhatsappLibraryFromGit = async (req: Request, res: Response): Promise<Response> => {
  try {
    const updateResult = await updateWhatsappLibFromGit();
    
    if (!updateResult.success) {
      return res.status(500).json(updateResult);
    }
    
    try {
      const restartResult = await restartBackend();
      
      return res.status(200).json({
        success: true,
        message: `${updateResult.message} ${restartResult.success ? restartResult.message : 'O servidor precisará ser reiniciado manualmente.'}`,
        newVersion: updateResult.newVersion,
        commitsInstalled: updateResult.commitsInstalled,
        restartSuccess: restartResult.success,
        restartMessage: restartResult.message
      });
    } catch (restartErr) {
      return res.status(200).json({
        ...updateResult,
        restartSuccess: false,
        restartMessage: "Não foi possível reiniciar o servidor automaticamente. Por favor, reinicie o servidor manualmente."
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ 
      success: false, 
      message: "Erro ao atualizar a biblioteca whatsapp-web.js via Git", 
      error: err.message 
    });
  }
};

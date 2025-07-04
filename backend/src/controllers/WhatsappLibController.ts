import { Request, Response } from "express";
import { updateWhatsappLib } from "../services/WhatsappLibService/UpdateWhatsappLibService";
import { restartBackend } from "../services/WhatsappLibService/RestartService";

export const updateWhatsappLibrary = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Atualizar a biblioteca
    const updateResult = await updateWhatsappLib();
    
    if (!updateResult.success) {
      return res.status(500).json(updateResult);
    }
    
    // Se a atualização foi bem-sucedida, tentar reiniciar o servidor
    try {
      const restartResult = await restartBackend();
      
      // Retornar resultado combinado
      return res.status(200).json({
        success: true,
        message: `${updateResult.message} ${restartResult.success ? restartResult.message : 'O servidor precisará ser reiniciado manualmente.'}`,
        newVersion: updateResult.newVersion,
        restartSuccess: restartResult.success,
        restartMessage: restartResult.message
      });
    } catch (restartErr) {
      // Se falhar o reinício, ainda retornar sucesso na atualização
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

import { Request, Response, NextFunction } from "express";
import ErrorLogService from "../services/ErrorLogService";

const errorLogger = async (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extrair informações do erro
    const errorData: any = {
      source: "backend",
      message: err.message || "Erro desconhecido",
      stack: err.stack || "",
      component: req.path,
      url: req.originalUrl,
      userAgent: req.headers["user-agent"] || "",
      severity: "error"
    };

    // Adicionar informações do usuário se disponível
    if (req.user) {
      errorData.userId = req.user.id;
      // Usar o profile como username já que name não está disponível
      errorData.username = req.user.profile || "";
    }

    // Salvar o log no banco de dados
    await ErrorLogService.create(errorData);
  } catch (logError) {
    console.error("Erro ao registrar log de erro:", logError);
  }

  // Continuar com o tratamento de erro padrão
  next(err);
};

export default errorLogger;

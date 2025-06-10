import { Request, Response } from "express";
import * as Yup from "yup";
import AppError from "../errors/AppError";
import CheckWhatsAppNumberService from "../services/WbotServices/CheckWhatsAppNumberService";

interface CheckNumberRequest {
  number: string;
}

export const checkNumber = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { number } = req.body as CheckNumberRequest;

  const schema = Yup.object().shape({
    number: Yup.string()
      .required("Número é obrigatório")
      .matches(/^\d+$/, "Formato de número inválido. Apenas números são permitidos.")
  });

  try {
    await schema.validate({ number });
  } catch (err) {
    throw new AppError(err.message);
  }

  try {
    const result = await CheckWhatsAppNumberService(number);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ 
      error: true,
      message: error.message,
      number
    });
  }
};

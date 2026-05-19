import axios from "axios";
import { logger } from "../../utils/logger";

const VALIDATION_URL = "https://api.pressticket.com.br/validate-token";

interface ValidationResult {
  isValid: boolean;
  info?: {
    name: string;
    email: string;
    channels: number;
    active: boolean;
    type: "principal" | "subconta";
  };
}

class NotificameTokenValidator {
  public async validate(token: string): Promise<ValidationResult> {
    try {
      const response = await axios.post<ValidationResult>(
        VALIDATION_URL,
        { token },
        {
          timeout: 10000,
          headers: { "Content-Type": "application/json" }
        }
      );
      return response.data;
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      logger.error("NotificameTokenValidator: erro ao validar token:", errMsg);
      // Em caso de falha no endpoint de validação, permite continuar
      return { isValid: true };
    }
  }
}

export default new NotificameTokenValidator();

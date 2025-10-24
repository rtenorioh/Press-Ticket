import { getWbot } from "../../libs/wbot";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";

interface PresenceOptions {
  whatsappId: number;
  chatId: string;
  state: "composing" | "recording" | "available";
  duration?: number;
}

class PresenceService {
  /**
   * Envia indicador de presença (digitando ou gravando áudio)
   */
  public async sendPresence({
    whatsappId,
    chatId,
    state,
    duration = 5000
  }: PresenceOptions): Promise<void> {
    try {
      const wbot = await getWbot(whatsappId);
      const chat = await wbot.getChatById(chatId);

      logger.info(`[PRESENCE] Enviando indicador "${state}" para ${chatId} por ${duration}ms`);

      // Enviar estado de presença
      if (state === "composing") {
        await chat.sendStateTyping();
      } else if (state === "recording") {
        await chat.sendStateRecording();
      }
      // "available" não precisa de ação específica no whatsapp-web.js

      // Aguardar a duração especificada
      if (state !== "available" && duration > 0) {
        await new Promise(resolve => setTimeout(resolve, duration));
        logger.info(`[PRESENCE] Indicador "${state}" finalizado para ${chatId}`);
      }
    } catch (error) {
      logger.error(`[PRESENCE] Erro ao enviar presença: ${error}`);
      throw new AppError("ERR_SENDING_PRESENCE");
    }
  }

  /**
   * Simula digitação antes de enviar mensagem
   */
  public async simulateTyping(
    whatsappId: number,
    chatId: string,
    duration: number = 3000
  ): Promise<void> {
    await this.sendPresence({
      whatsappId,
      chatId,
      state: "composing",
      duration
    });
  }

  /**
   * Simula gravação de áudio antes de enviar
   */
  public async simulateRecording(
    whatsappId: number,
    chatId: string,
    duration: number = 5000
  ): Promise<void> {
    await this.sendPresence({
      whatsappId,
      chatId,
      state: "recording",
      duration
    });
  }

  /**
   * Define presença como disponível
   */
  public async setAvailable(
    whatsappId: number,
    chatId: string
  ): Promise<void> {
    await this.sendPresence({
      whatsappId,
      chatId,
      state: "available",
      duration: 0
    });
  }

  /**
   * Simula digitação com base no tamanho da mensagem
   * Calcula duração baseada em velocidade de digitação média (40 palavras/min)
   */
  public async simulateTypingByMessageLength(
    whatsappId: number,
    chatId: string,
    messageLength: number
  ): Promise<void> {
    // Velocidade média: 40 palavras/min = ~200 caracteres/min = ~3.3 caracteres/segundo
    // Mínimo 1 segundo, máximo 10 segundos
    const duration = Math.min(Math.max(messageLength / 3.3 * 1000, 1000), 10000);
    
    logger.info(`[PRESENCE] Simulando digitação por ${duration}ms para mensagem de ${messageLength} caracteres`);
    
    await this.simulateTyping(whatsappId, chatId, duration);
  }

  /**
   * Aguarda a duração da simulação de digitação
   */
  public async waitForTypingSimulation(messageLength: number): Promise<void> {
    const duration = Math.min(Math.max(messageLength / 3.3 * 1000, 1000), 10000);
    await new Promise(resolve => setTimeout(resolve, duration));
  }
}

export default new PresenceService();

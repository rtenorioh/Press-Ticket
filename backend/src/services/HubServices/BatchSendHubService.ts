import { showHubToken } from "../../helpers/showHubToken";
import { logger } from "../../utils/logger";

require("dotenv").config();
const { Client } = require("notificamehubsdk");

export interface HubBatchContent {
  type: "text" | "file";
  text?: string;
  url?: string;
  fileUrl?: string;
  filename?: string;
  fileMimeType?: string;
}

export interface HubBatchConfig {
  channel: string;
  from: string;
  message: {
    contents: HubBatchContent[];
  };
}

export interface HubBatchResult {
  id: string;
  status: string;
  channel: string;
  totalContacts: number;
}

export const BatchSendHubService = async (
  contactsCsvPath: string,
  batch: HubBatchConfig
): Promise<HubBatchResult> => {
  if (!contactsCsvPath) {
    throw new Error("Caminho do arquivo CSV de contatos é obrigatório.");
  }

  if (!batch.channel || !batch.from) {
    throw new Error("Canal e remetente (from) são obrigatórios no batch.");
  }

  if (!batch.message?.contents?.length) {
    throw new Error("O batch deve conter ao menos um conteúdo de mensagem.");
  }

  const notificameHubToken = await showHubToken();
  const client = new Client(notificameHubToken);

  logger.info(
    `Iniciando envio em lote — canal: ${batch.channel}, from: ${batch.from}, arquivo: ${contactsCsvPath}`
  );

  try {
    const response = await client.sendMessageBatch(contactsCsvPath, batch);

    let data: HubBatchResult;
    try {
      data = typeof response === "object" ? response : JSON.parse(response);
    } catch {
      data = response;
    }

    logger.info(`Envio em lote aceito pela API Hub: ${JSON.stringify(data)}`);
    return data;
  } catch (error) {
    logger.error(`Erro no envio em lote Hub: ${error}`);
    throw error;
  }
};

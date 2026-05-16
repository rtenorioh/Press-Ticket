import FormData from "form-data";
import fs from "fs";
import { createNotificameClient } from "../../libs/notificameClient";
import { showHubToken } from "../../helpers/showHubToken";
import { logger } from "../../utils/logger";

require("dotenv").config();

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

  logger.info(
    `Iniciando envio em lote — canal: ${batch.channel}, from: ${batch.from}, arquivo: ${contactsCsvPath}`
  );

  try {
    const form = new FormData();
    form.append("contacts", fs.createReadStream(contactsCsvPath), {
      filename: "contacts.csv",
      contentType: "text/csv"
    });
    form.append("channel", batch.channel);
    form.append("from", batch.from);
    form.append("message", JSON.stringify(batch.message));

    const client = createNotificameClient(notificameHubToken);
    const response = await client.post("/v1/messages/batch", form, {
      headers: form.getHeaders()
    });

    const data: HubBatchResult =
      typeof response.data === "object"
        ? response.data
        : JSON.parse(response.data);

    logger.info(`Envio em lote aceito pela API Hub: ${JSON.stringify(data)}`);
    return data;
  } catch (error) {
    logger.error(`BatchSendHubService: erro no envio em lote Hub: ${error}`);
    throw error;
  }
};

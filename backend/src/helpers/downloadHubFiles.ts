import axios from "axios";
import { writeFile } from "fs/promises";
import mime from "mime-types";
import { URL } from "url";
import { extname, join } from "path";
import { logger } from "../utils/logger";
import AppError from "../errors/AppError";

const ALLOWED_MEDIA_EXTENSIONS = new Set([
  "jpg", "jpeg", "png", "gif", "webp", "bmp",
  "mp4", "avi", "mov", "webm", "mkv",
  "mp3", "ogg", "opus", "wav", "aac", "m4a",
  "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx",
  "zip", "txt", "csv"
]);

// Block private/internal IPs to prevent SSRF
const PRIVATE_IP_PATTERN =
  /^(localhost|127\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.|169\.254\.|::1$)/i;

function validateFileUrl(rawUrl: string): string {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new AppError("URL de arquivo inválida", 400);
  }
  if (parsed.protocol !== "https:") {
    throw new AppError("Apenas URLs HTTPS são permitidas para download", 400);
  }
  if (PRIVATE_IP_PATTERN.test(parsed.hostname)) {
    throw new AppError("Host não permitido", 403);
  }
  return parsed.toString();
}

export const downloadFiles = async (url: string) => {
  try {
    const safeUrl = validateFileUrl(url);
    const { data } = await axios.get(safeUrl, {
      responseType: "arraybuffer"
    });

    const rawType = url.split("?")[0].split(".").pop()?.toLowerCase() || "";
    const type = ALLOWED_MEDIA_EXTENSIONS.has(rawType) ? rawType : "bin";

    const filename = `${new Date().getTime()}.${type}`;

    const filePath = join(__dirname, "..", "..", "public", filename);

    await writeFile(filePath, data, "base64");

    const mimeType = mime.lookup(filePath);
    const extension = extname(filePath);
    const originalname = url.split("/").pop();

    const media = {
      mimeType,
      extension,
      filename,
      data,
      originalname
    };

    return media;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error(`Erro ao processar a requisição: ${error}`);
    throw error;
  }
};

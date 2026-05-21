import axios from "axios";
import { writeFile } from "fs/promises";
import mime from "mime-types";
import { extname, join } from "path";
import { URL } from "url";
import AppError from "../errors/AppError";
import { logger } from "../utils/logger";

const ALLOWED_MEDIA_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "bmp",
  "mp4",
  "avi",
  "mov",
  "webm",
  "mkv",
  "mp3",
  "ogg",
  "opus",
  "wav",
  "aac",
  "m4a",
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "zip",
  "txt",
  "csv"
]);

// Allowlist of hosts permitted for media download from Notificame Hub
// Add new hosts here when the Hub CDN domain changes
const ALLOWED_HOSTS = new Set([
  "api.notificamehub.com",
  "notificamehub.com",
  "hub.notificame.com.br",
  "cdn.notificamehub.com",
  "media.notificamehub.com"
]);

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
  if (!ALLOWED_HOSTS.has(parsed.hostname)) {
    throw new AppError("Host não permitido", 403);
  }
  return `https://${parsed.hostname}${parsed.pathname}${parsed.search}`;
}

export const downloadFiles = async (url: string) => {
  try {
    const safeUrl = validateFileUrl(url);
    const { data } = await axios.get(safeUrl, {
      responseType: "arraybuffer"
    });

    const rawType = safeUrl.split("?")[0].split(".").pop()?.toLowerCase() || "";
    const type = ALLOWED_MEDIA_EXTENSIONS.has(rawType) ? rawType : "bin";

    const filename = `${new Date().getTime()}.${type}`;

    const filePath = join(__dirname, "..", "..", "public", filename);

    await writeFile(filePath, data, "base64");

    const mimeType = mime.lookup(filePath);
    const extension = extname(filePath);
    const originalname = safeUrl.split("/").pop();

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

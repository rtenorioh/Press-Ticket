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

// Block private/internal IPs to prevent SSRF
const PRIVATE_IP_RANGES = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^::1$/,
  /^fc[0-9a-f][0-9a-f]:/i,
  /^fd[0-9a-f][0-9a-f]:/i,
  /^0\./
];

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
  const hostname = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (!hostname) {
    throw new AppError("Host não permitido", 403);
  }
  for (const range of PRIVATE_IP_RANGES) {
    if (range.test(hostname)) {
      throw new AppError("Host não permitido", 403);
    }
  }
  // Reconstruct URL from validated components to avoid returning raw user input
  const safeUrl =
    `${parsed.protocol}//${parsed.host}` +
    `${parsed.pathname}${parsed.search}${parsed.hash}`;
  return safeUrl;
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

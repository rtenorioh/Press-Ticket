import path from "path";
import multer from "multer";

const publicFolder = path.resolve(__dirname, "..", "..", "public");
export default {
  directory: publicFolder,

  storage: multer.diskStorage({
    destination: publicFolder,
    filename(req, file, cb) {
      // file.originalname vem do cliente e pode conter "../" ou barras,
      // permitindo escrita fora de public/ (path traversal). Usar só o
      // basename e remover qualquer caractere de caminho antes de gravar.
      const safeOriginal = path
        .basename(file.originalname)
        .replace(/[/\\]/g, "_");

      const fileName = new Date().getTime() + "_" + safeOriginal;

      return cb(null, fileName);
    }
  }),

  limits: {
    fileSize: 500 * 1024 * 1024
  }
};

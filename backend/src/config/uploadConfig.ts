import { Request } from "express";
import fs from "fs";
import multer, { FileFilterCallback } from "multer";
import path from "path";

const deleteIfExists = (filePath: string) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`Arquivo ${filePath} deletado com sucesso.`);
  } else {
    console.log(`Arquivo ${filePath} não encontrado para exclusão.`);
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.resolve(
      __dirname,
      "..",
      "..",
      "..",
      "frontend",
      "public",
      "assets"
    );

    cb(null, dest);
  },
  filename: (req: Request, file, cb) => {
    const { theme } = req.params;

    let fileName = "";

    if (theme === "light") {
      if (file.fieldname === "favico") {
        fileName = "favico.ico";
      } else if (file.fieldname === "logo") {
        fileName = "logo.jpg";
      } else if (file.fieldname === "logoTicket") {
        fileName = "logoTicket.jpg";
      }
    } else if (theme === "dark") {
      if (file.fieldname === "favico") {
        fileName = "favicoDark.ico";
      } else if (file.fieldname === "logo") {
        fileName = "logoDark.jpg";
      } else if (file.fieldname === "logoTicket") {
        fileName = "logoTicketDark.jpg";
      }
    }

    const filePath = path.resolve(
      __dirname,
      "..",
      "..",
      "..",
      "frontend",
      "public",
      "assets",
      fileName
    );
    deleteIfExists(filePath);
    cb(null, fileName);
  }
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/x-icon"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Formato de arquivo inválido. Apenas .jpg, .png e .ico são permitidos."
      )
    );
  }
};

const uploadConfig = multer({
  storage,
  fileFilter
});

export default uploadConfig;

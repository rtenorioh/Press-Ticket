import { Request } from "express";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";

const UPLOAD_PATH = path.resolve(__dirname, "..", "..", "public", "logos");

if (!fs.existsSync(UPLOAD_PATH)) {
  fs.mkdirSync(UPLOAD_PATH, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_PATH);
  },
  filename: (req: Request, file, cb) => {
    try {
      const { theme } = req.params;
      if (!theme || (theme !== 'light' && theme !== 'dark')) {
        return cb(new Error("Theme parameter must be 'light' or 'dark'"), "");
      }

      const timestamp = Date.now();
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      let fileName = "";

      if (file.fieldname === "favico") {
        fileName = theme === "dark" ? `favicoDark${ext}` : `favico${ext}`;
      } else if (file.fieldname === "logo") {
        fileName = theme === "dark" ? `logoDark${ext}` : `logo${ext}`;
      } else if (file.fieldname === "logoTicket") {
        fileName = theme === "dark" ? `logoTicketDark${ext}` : `logoTicket${ext}`;
      } else {
        return cb(new Error(`Invalid field name: ${file.fieldname}`), "");
      }

      const filePath = path.join(UPLOAD_PATH, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      cb(null, fileName);
    } catch (error) {
      console.error("Error in filename generation:", error);
      cb(error, "");
    }
  }
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const allowedMimes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/x-icon",
    "image/vnd.microsoft.icon"
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type."));
  }
};

const uploadConfig = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

export default uploadConfig;

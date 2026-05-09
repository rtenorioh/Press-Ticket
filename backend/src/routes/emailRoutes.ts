import express from "express";
import multer from "multer";
import isAuth from "../middleware/isAuth";
import uploadConfig from "../config/upload";
import * as EmailController from "../controllers/EmailController";

const emailRoutes = express.Router();
const upload = multer(uploadConfig);

emailRoutes.get("/emails", isAuth, EmailController.index);
emailRoutes.get("/emails/counts", isAuth, EmailController.countFolders);
emailRoutes.get("/emails/:id", isAuth, EmailController.show);
emailRoutes.post("/emails", isAuth, EmailController.store);
emailRoutes.post("/emails/attachment", isAuth, upload.single("file"), EmailController.uploadAttachment);
emailRoutes.put("/emails/:id", isAuth, EmailController.update);
emailRoutes.delete("/emails/:id", isAuth, EmailController.destroy);

export default emailRoutes;

import express from "express";
import isAuth from "../middleware/isAuth";
import * as EmailController from "../controllers/EmailController";

const emailRoutes = express.Router();

emailRoutes.get("/emails", isAuth, EmailController.index);
emailRoutes.get("/emails/counts", isAuth, EmailController.countFolders);
emailRoutes.get("/emails/:id", isAuth, EmailController.show);
emailRoutes.post("/emails", isAuth, EmailController.store);
emailRoutes.put("/emails/:id", isAuth, EmailController.update);
emailRoutes.delete("/emails/:id", isAuth, EmailController.destroy);

export default emailRoutes;

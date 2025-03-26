import express from "express";
import multer from "multer";
import uploadConfig from "../config/upload";

import * as ApiController from "../controllers/ApiController";
import isApiToken from "../middleware/isApiToken";
import isAuthApi from "../middleware/isAuthApi";

const upload = multer(uploadConfig);

const ApiRoutes = express.Router();

ApiRoutes.post("/send", isAuthApi, upload.array("medias"), ApiController.index);

ApiRoutes.post("/v1/send", isApiToken('create:messages'), upload.array("medias"), ApiController.index);

export default ApiRoutes;
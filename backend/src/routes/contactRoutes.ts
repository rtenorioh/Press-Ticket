import express from "express";
import isApiToken from "../middleware/isApiToken";
import isAuth from "../middleware/isAuth";

import * as ContactController from "../controllers/ContactController";
import * as ImportPhoneContactsController from "../controllers/ImportPhoneContactsController";

const contactRoutes = express.Router();

contactRoutes.get("/contacts", isAuth, ContactController.index);
contactRoutes.get("/contacts/:contactId", isAuth, ContactController.show);
contactRoutes.post("/contacts", isAuth, ContactController.store);
contactRoutes.post("/v1/contacts", isApiToken('create:contacts'), ContactController.store);
contactRoutes.post("/contact", isAuth, ContactController.getContact);
contactRoutes.put("/contacts/:contactId", isAuth, ContactController.update);
contactRoutes.delete("/contacts/:contactId", isAuth, ContactController.remove);

contactRoutes.post("/contacts/import", isAuth, ImportPhoneContactsController.store);

export default contactRoutes;
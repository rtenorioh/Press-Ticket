import express from "express";
import isApiToken from "../middleware/isApiToken";
import isAuth from "../middleware/isAuth";

import * as ContactController from "../controllers/ContactController";
import * as ImportPhoneContactsController from "../controllers/ImportPhoneContactsController";

const contactRoutes = express.Router();

contactRoutes.get("/contacts", isAuth, ContactController.index);
contactRoutes.get("/contacts/:contactId", isAuth, ContactController.show);
contactRoutes.post("/contacts", isAuth, ContactController.store);
contactRoutes.post("/contact", isAuth, ContactController.getContact);
contactRoutes.put("/contacts/:contactId", isAuth, ContactController.update);
contactRoutes.delete("/contacts/:contactId", isAuth, ContactController.remove);

contactRoutes.get("/v1/contacts", isApiToken('read:contacts'), ContactController.index);
contactRoutes.get("/v1/contacts/:contactId", isApiToken('read:contacts'), ContactController.show);
contactRoutes.post("/v1/contacts", isApiToken('create:contacts'), ContactController.store);
contactRoutes.post("/v1/contact", isApiToken('create:contacts'), ContactController.getContact);
contactRoutes.put("/v1/contacts/:contactId", isApiToken('update:contacts'), ContactController.update);
contactRoutes.delete("/v1/contacts/:contactId", isApiToken('delete:contacts'), ContactController.remove);

contactRoutes.post("/contacts/import", isAuth, ImportPhoneContactsController.store);

export default contactRoutes;
import express from "express";
import isAuth from "../middleware/isAuth";

import * as ContactController from "../controllers/ContactController";
import * as ImportPhoneContactsController from "../controllers/ImportPhoneContactsController";

const contactRoutes = express.Router();

contactRoutes.get("/contacts", isAuth, ContactController.index);
contactRoutes.get("/contacts/export", isAuth, ContactController.exportContacts);
contactRoutes.get("/contacts/blocked", isAuth, ContactController.listBlockedContacts);
contactRoutes.get("/contacts/:contactId/block-status", isAuth, ContactController.getBlockStatus);
contactRoutes.get("/contacts/:contactId/about", isAuth, ContactController.getAbout);
contactRoutes.get("/contacts/:contactId/common-groups", isAuth, ContactController.getCommonGroups);
contactRoutes.post("/contacts/:contactId/refresh-group-pic", isAuth, ContactController.refreshGroupProfilePic);
contactRoutes.get("/contacts/:contactId", isAuth, ContactController.show);
contactRoutes.post("/contacts", isAuth, ContactController.store);
contactRoutes.post("/contact", isAuth, ContactController.getContact);
contactRoutes.post("/contacts/:contactId/block", isAuth, ContactController.blockContact);
contactRoutes.post("/contacts/:contactId/unblock", isAuth, ContactController.unblockContact);
contactRoutes.put("/contacts/:contactId", isAuth, ContactController.update);
contactRoutes.delete("/contacts/:contactId", isAuth, ContactController.remove);
contactRoutes.delete("/contacts", isAuth, ContactController.removeAll);

contactRoutes.post("/contacts/import", isAuth, ImportPhoneContactsController.store);

export default contactRoutes;
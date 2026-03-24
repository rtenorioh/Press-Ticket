import { Router } from "express";
import multer from "multer";
import uploadConfig from "../config/upload";
import isAuth from "../middleware/isAuth";
import * as GroupController from "../controllers/GroupController";

const groupRoutes = Router();

const upload = multer(uploadConfig);

// Participantes
groupRoutes.post("/groups/:groupId/participants/add", isAuth, GroupController.addParticipants);
groupRoutes.post("/groups/:groupId/participants/remove", isAuth, GroupController.removeParticipants);
groupRoutes.post("/groups/:groupId/participants/promote", isAuth, GroupController.promoteParticipants);
groupRoutes.post("/groups/:groupId/participants/demote", isAuth, GroupController.demoteParticipants);
groupRoutes.get("/groups/:groupId/participants", isAuth, GroupController.listParticipants);

// Convite
groupRoutes.get("/groups/:groupId/invite", isAuth, GroupController.getInvite);
groupRoutes.post("/groups/:groupId/invite/revoke", isAuth, GroupController.revokeInvite);

// Permissões
groupRoutes.post("/groups/:groupId/settings/memberAddMode", isAuth, GroupController.setMemberAddMode);
groupRoutes.post("/groups/:groupId/settings/announcement", isAuth, GroupController.setAnnouncement);
groupRoutes.post("/groups/:groupId/settings/restrict", isAuth, GroupController.setRestrict);

// Info
groupRoutes.get("/groups/:groupId/info", isAuth, GroupController.getInfo);
groupRoutes.post("/groups/:groupId/subject", isAuth, GroupController.setSubject);
groupRoutes.post("/groups/:groupId/description", isAuth, GroupController.setDescription);
groupRoutes.post("/groups/:groupId/picture", isAuth, upload.single("file"), GroupController.setPicture);
groupRoutes.delete("/groups/:groupId/picture", isAuth, GroupController.deletePicture);

// Membership Requests
groupRoutes.get("/groups/:groupId/membership/requests", isAuth, GroupController.listMembershipRequests);
groupRoutes.post("/groups/:groupId/membership/approve", isAuth, GroupController.approveMembershipRequests);
groupRoutes.post("/groups/:groupId/membership/reject", isAuth, GroupController.rejectMembershipRequests);

// Sair
groupRoutes.post("/groups/:groupId/leave", isAuth, GroupController.leaveGroup);

export default groupRoutes;

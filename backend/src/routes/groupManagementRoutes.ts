import express from "express";
import isAuth from "../middleware/isAuth";
import * as GroupManagementController from "../controllers/GroupManagementController";

const groupManagementRoutes = express.Router();

groupManagementRoutes.post(
  "/whatsapp/:whatsappId/groups",
  isAuth,
  GroupManagementController.createGroup
);

groupManagementRoutes.get(
  "/whatsapp/:whatsappId/groups",
  isAuth,
  GroupManagementController.listGroups
);

groupManagementRoutes.get(
  "/whatsapp/:whatsappId/groups/:groupId",
  isAuth,
  GroupManagementController.getGroupInfo
);

groupManagementRoutes.put(
  "/whatsapp/:whatsappId/groups/:groupId/name",
  isAuth,
  GroupManagementController.updateGroupName
);

groupManagementRoutes.put(
  "/whatsapp/:whatsappId/groups/:groupId/description",
  isAuth,
  GroupManagementController.updateGroupDescription
);

groupManagementRoutes.post(
  "/whatsapp/:whatsappId/groups/:groupId/participants/add",
  isAuth,
  GroupManagementController.addParticipants
);

groupManagementRoutes.post(
  "/whatsapp/:whatsappId/groups/:groupId/participants/remove",
  isAuth,
  GroupManagementController.removeParticipants
);

groupManagementRoutes.post(
  "/whatsapp/:whatsappId/groups/:groupId/participants/promote",
  isAuth,
  GroupManagementController.promoteParticipants
);

groupManagementRoutes.post(
  "/whatsapp/:whatsappId/groups/:groupId/participants/demote",
  isAuth,
  GroupManagementController.demoteParticipants
);

groupManagementRoutes.post(
  "/whatsapp/:whatsappId/groups/:groupId/leave",
  isAuth,
  GroupManagementController.leaveGroup
);

groupManagementRoutes.get(
  "/whatsapp/:whatsappId/groups/:groupId/invite-link",
  isAuth,
  GroupManagementController.getGroupInviteLink
);

groupManagementRoutes.post(
  "/whatsapp/:whatsappId/groups/:groupId/invite-link/revoke",
  isAuth,
  GroupManagementController.revokeGroupInviteLink
);

groupManagementRoutes.put(
  "/whatsapp/:whatsappId/groups/:groupId/settings",
  isAuth,
  GroupManagementController.updateGroupSettings
);

export default groupManagementRoutes;

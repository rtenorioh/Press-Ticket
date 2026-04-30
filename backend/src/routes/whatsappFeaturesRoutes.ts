import { Router } from "express";
import * as WhatsAppFeaturesController from "../controllers/WhatsAppFeaturesController";
import isAuth from "../middleware/isAuth";

const whatsappFeaturesRoutes = Router();

// Forward
whatsappFeaturesRoutes.post(
  "/wa-features/forward",
  isAuth,
  WhatsAppFeaturesController.forwardNative
);

// Search
whatsappFeaturesRoutes.get(
  "/wa-features/search",
  isAuth,
  WhatsAppFeaturesController.searchMessages
);

// Invites
whatsappFeaturesRoutes.post(
  "/wa-features/invite/accept",
  isAuth,
  WhatsAppFeaturesController.acceptInvite
);
whatsappFeaturesRoutes.get(
  "/wa-features/invite/info",
  isAuth,
  WhatsAppFeaturesController.getInviteInfo
);

// Location
whatsappFeaturesRoutes.post(
  "/wa-features/:ticketId/location",
  isAuth,
  WhatsAppFeaturesController.sendLocation
);

// Chat Management
whatsappFeaturesRoutes.post(
  "/wa-features/chat/seen",
  isAuth,
  WhatsAppFeaturesController.sendSeen
);
whatsappFeaturesRoutes.post(
  "/wa-features/chat/archive",
  isAuth,
  WhatsAppFeaturesController.archiveChat
);
whatsappFeaturesRoutes.post(
  "/wa-features/chat/unarchive",
  isAuth,
  WhatsAppFeaturesController.unarchiveChat
);
whatsappFeaturesRoutes.post(
  "/wa-features/chat/pin",
  isAuth,
  WhatsAppFeaturesController.pinChat
);
whatsappFeaturesRoutes.post(
  "/wa-features/chat/unpin",
  isAuth,
  WhatsAppFeaturesController.unpinChat
);
whatsappFeaturesRoutes.post(
  "/wa-features/chat/mute",
  isAuth,
  WhatsAppFeaturesController.muteChat
);
whatsappFeaturesRoutes.post(
  "/wa-features/chat/unmute",
  isAuth,
  WhatsAppFeaturesController.unmuteChat
);
whatsappFeaturesRoutes.post(
  "/wa-features/chat/mark-unread",
  isAuth,
  WhatsAppFeaturesController.markUnread
);
whatsappFeaturesRoutes.get(
  "/wa-features/chat/messages",
  isAuth,
  WhatsAppFeaturesController.fetchMessages
);
whatsappFeaturesRoutes.post(
  "/wa-features/chat/clear",
  isAuth,
  WhatsAppFeaturesController.clearMessages
);
whatsappFeaturesRoutes.get(
  "/wa-features/chat/info",
  isAuth,
  WhatsAppFeaturesController.getChatInfo
);
whatsappFeaturesRoutes.get(
  "/wa-features/chats",
  isAuth,
  WhatsAppFeaturesController.getChats
);

// Labels
whatsappFeaturesRoutes.get(
  "/wa-features/labels",
  isAuth,
  WhatsAppFeaturesController.getLabels
);
whatsappFeaturesRoutes.get(
  "/wa-features/labels/by-id",
  isAuth,
  WhatsAppFeaturesController.getLabelById
);
whatsappFeaturesRoutes.get(
  "/wa-features/labels/chat",
  isAuth,
  WhatsAppFeaturesController.getChatLabels
);
whatsappFeaturesRoutes.get(
  "/wa-features/labels/chats-by-label",
  isAuth,
  WhatsAppFeaturesController.getChatsByLabel
);
whatsappFeaturesRoutes.post(
  "/wa-features/labels/change",
  isAuth,
  WhatsAppFeaturesController.changeChatLabels
);

// Profile
whatsappFeaturesRoutes.post(
  "/wa-features/profile/status",
  isAuth,
  WhatsAppFeaturesController.setStatus
);
whatsappFeaturesRoutes.post(
  "/wa-features/profile/display-name",
  isAuth,
  WhatsAppFeaturesController.setDisplayName
);
whatsappFeaturesRoutes.post(
  "/wa-features/profile/picture",
  isAuth,
  WhatsAppFeaturesController.setProfilePicture
);
whatsappFeaturesRoutes.delete(
  "/wa-features/profile/picture",
  isAuth,
  WhatsAppFeaturesController.removeProfilePicture
);
whatsappFeaturesRoutes.get(
  "/wa-features/profile/wweb-version",
  isAuth,
  WhatsAppFeaturesController.getWWebVersion
);
whatsappFeaturesRoutes.post(
  "/wa-features/profile/presence-unavailable",
  isAuth,
  WhatsAppFeaturesController.setPresenceUnavailable
);
whatsappFeaturesRoutes.post(
  "/wa-features/profile/presence-available",
  isAuth,
  WhatsAppFeaturesController.setPresenceAvailable
);

// Contact Actions
whatsappFeaturesRoutes.get(
  "/wa-features/contact/about",
  isAuth,
  WhatsAppFeaturesController.getContactAbout
);
whatsappFeaturesRoutes.get(
  "/wa-features/contact/info",
  isAuth,
  WhatsAppFeaturesController.getContactInfo
);
whatsappFeaturesRoutes.post(
  "/wa-features/contact/block",
  isAuth,
  WhatsAppFeaturesController.blockContact
);
whatsappFeaturesRoutes.post(
  "/wa-features/contact/unblock",
  isAuth,
  WhatsAppFeaturesController.unblockContact
);
whatsappFeaturesRoutes.get(
  "/wa-features/contact/blocked",
  isAuth,
  WhatsAppFeaturesController.getBlockedContacts
);
whatsappFeaturesRoutes.get(
  "/wa-features/contact/common-groups",
  isAuth,
  WhatsAppFeaturesController.getCommonGroups
);

// Group Membership Requests
whatsappFeaturesRoutes.get(
  "/wa-features/group/membership-requests",
  isAuth,
  WhatsAppFeaturesController.getGroupMembershipRequests
);
whatsappFeaturesRoutes.post(
  "/wa-features/group/membership-requests/approve",
  isAuth,
  WhatsAppFeaturesController.approveGroupMembershipRequests
);
whatsappFeaturesRoutes.post(
  "/wa-features/group/membership-requests/reject",
  isAuth,
  WhatsAppFeaturesController.rejectGroupMembershipRequests
);

// Pin/Unpin Messages
whatsappFeaturesRoutes.post(
  "/wa-features/message/pin",
  isAuth,
  WhatsAppFeaturesController.pinMessage
);
whatsappFeaturesRoutes.post(
  "/wa-features/message/unpin",
  isAuth,
  WhatsAppFeaturesController.unpinMessage
);

// Message Info
whatsappFeaturesRoutes.get(
  "/wa-features/message/:messageId/info",
  isAuth,
  WhatsAppFeaturesController.getMessageInfo
);
whatsappFeaturesRoutes.get(
  "/wa-features/message/:messageId/reactions",
  isAuth,
  WhatsAppFeaturesController.getMessageReactions
);
whatsappFeaturesRoutes.get(
  "/wa-features/message/:messageId/poll-votes",
  isAuth,
  WhatsAppFeaturesController.getPollVotes
);

// Star/Unstar
whatsappFeaturesRoutes.post(
  "/wa-features/message/star",
  isAuth,
  WhatsAppFeaturesController.starMessage
);
whatsappFeaturesRoutes.post(
  "/wa-features/message/unstar",
  isAuth,
  WhatsAppFeaturesController.unstarMessage
);

// Pinned Messages
whatsappFeaturesRoutes.get(
  "/wa-features/message/pinned",
  isAuth,
  WhatsAppFeaturesController.getPinnedMessages
);
whatsappFeaturesRoutes.get(
  "/wa-features/message/check-pinned",
  isAuth,
  WhatsAppFeaturesController.checkMessagePinned
);

export default whatsappFeaturesRoutes;

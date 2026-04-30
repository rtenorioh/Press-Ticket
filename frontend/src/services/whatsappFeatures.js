import api from "./api";

const WhatsAppFeaturesService = {
  // Forward
  forwardNative: (messageId, targetChatId, ticketId) =>
    api.post("/wa-features/forward", { messageId, targetChatId, ticketId }).then(r => r.data),

  // Search
  searchMessages: (whatsappId, query, { chatId, page, limit } = {}) =>
    api.get("/wa-features/search", { params: { whatsappId, query, chatId, page, limit } }).then(r => r.data),

  // Invite
  acceptInvite: (whatsappId, inviteCode) =>
    api.post("/wa-features/invite/accept", { whatsappId, inviteCode }).then(r => r.data),
  getInviteInfo: (whatsappId, inviteCode) =>
    api.get("/wa-features/invite/info", { params: { whatsappId, inviteCode } }).then(r => r.data),

  // Location
  sendLocation: (ticketId, latitude, longitude, description, address) =>
    api.post(`/wa-features/${ticketId}/location`, { latitude, longitude, description, address }).then(r => r.data),

  // Chat Management
  sendSeen: (whatsappId, chatId) =>
    api.post("/wa-features/chat/seen", { whatsappId, chatId }).then(r => r.data),
  archiveChat: (whatsappId, chatId) =>
    api.post("/wa-features/chat/archive", { whatsappId, chatId }).then(r => r.data),
  unarchiveChat: (whatsappId, chatId) =>
    api.post("/wa-features/chat/unarchive", { whatsappId, chatId }).then(r => r.data),
  pinChat: (whatsappId, chatId, ticketId) =>
    api.post("/wa-features/chat/pin", { whatsappId, chatId, ticketId }).then(r => r.data),
  unpinChat: (whatsappId, chatId, ticketId) =>
    api.post("/wa-features/chat/unpin", { whatsappId, chatId, ticketId }).then(r => r.data),
  muteChat: (whatsappId, chatId, unmuteDate, ticketId) =>
    api.post("/wa-features/chat/mute", { whatsappId, chatId, unmuteDate, ticketId }).then(r => r.data),
  unmuteChat: (whatsappId, chatId, ticketId) =>
    api.post("/wa-features/chat/unmute", { whatsappId, chatId, ticketId }).then(r => r.data),
  markUnread: (whatsappId, chatId) =>
    api.post("/wa-features/chat/mark-unread", { whatsappId, chatId }).then(r => r.data),
  fetchMessages: (whatsappId, chatId, limit) =>
    api.get("/wa-features/chat/messages", { params: { whatsappId, chatId, limit } }).then(r => r.data),
  clearMessages: (whatsappId, chatId) =>
    api.post("/wa-features/chat/clear", { whatsappId, chatId }).then(r => r.data),
  getChatInfo: (whatsappId, chatId, ticketId) =>
    api.get("/wa-features/chat/info", { params: { whatsappId, chatId, ticketId } }).then(r => r.data),
  getChats: (whatsappId) =>
    api.get("/wa-features/chats", { params: { whatsappId } }).then(r => r.data),

  // Labels
  getLabels: (whatsappId) =>
    api.get("/wa-features/labels", { params: { whatsappId } }).then(r => r.data),
  getLabelById: (whatsappId, labelId) =>
    api.get("/wa-features/labels/by-id", { params: { whatsappId, labelId } }).then(r => r.data),
  getChatLabels: (whatsappId, chatId) =>
    api.get("/wa-features/labels/chat", { params: { whatsappId, chatId } }).then(r => r.data),
  getChatsByLabel: (whatsappId, labelId) =>
    api.get("/wa-features/labels/chats-by-label", { params: { whatsappId, labelId } }).then(r => r.data),
  changeChatLabels: (whatsappId, chatId, labelIds) =>
    api.post("/wa-features/labels/change", { whatsappId, chatId, labelIds }).then(r => r.data),

  // Profile
  setStatus: (whatsappId, status) =>
    api.post("/wa-features/profile/status", { whatsappId, status }).then(r => r.data),
  setDisplayName: (whatsappId, name) =>
    api.post("/wa-features/profile/display-name", { whatsappId, name }).then(r => r.data),
  setProfilePicture: (whatsappId, mediaPath) =>
    api.post("/wa-features/profile/picture", { whatsappId, mediaPath }).then(r => r.data),
  removeProfilePicture: (whatsappId) =>
    api.delete("/wa-features/profile/picture", { data: { whatsappId } }).then(r => r.data),
  getWWebVersion: (whatsappId) =>
    api.get("/wa-features/profile/wweb-version", { params: { whatsappId } }).then(r => r.data),
  setPresenceUnavailable: (whatsappId) =>
    api.post("/wa-features/profile/presence-unavailable", { whatsappId }).then(r => r.data),
  setPresenceAvailable: (whatsappId) =>
    api.post("/wa-features/profile/presence-available", { whatsappId }).then(r => r.data),

  // Contact Actions
  getContactAbout: (whatsappId, contactId) =>
    api.get("/wa-features/contact/about", { params: { whatsappId, contactId } }).then(r => r.data),
  getContactInfo: (whatsappId, contactId) =>
    api.get("/wa-features/contact/info", { params: { whatsappId, contactId } }).then(r => r.data),
  blockContact: (whatsappId, contactId) =>
    api.post("/wa-features/contact/block", { whatsappId, contactId }).then(r => r.data),
  unblockContact: (whatsappId, contactId) =>
    api.post("/wa-features/contact/unblock", { whatsappId, contactId }).then(r => r.data),
  getBlockedContacts: (whatsappId) =>
    api.get("/wa-features/contact/blocked", { params: { whatsappId } }).then(r => r.data),
  getCommonGroups: (whatsappId, contactId) =>
    api.get("/wa-features/contact/common-groups", { params: { whatsappId, contactId } }).then(r => r.data),

  // Group Membership Requests
  getGroupMembershipRequests: (whatsappId, groupId) =>
    api.get("/wa-features/group/membership-requests", { params: { whatsappId, groupId } }).then(r => r.data),
  approveGroupMembershipRequests: (whatsappId, groupId, requesterIds) =>
    api.post("/wa-features/group/membership-requests/approve", { whatsappId, groupId, requesterIds }).then(r => r.data),
  rejectGroupMembershipRequests: (whatsappId, groupId, requesterIds) =>
    api.post("/wa-features/group/membership-requests/reject", { whatsappId, groupId, requesterIds }).then(r => r.data),

  // Pin/Unpin Messages
  pinMessage: (messageId, duration) =>
    api.post("/wa-features/message/pin", { messageId, duration }).then(r => r.data),
  unpinMessage: (messageId) =>
    api.post("/wa-features/message/unpin", { messageId }).then(r => r.data),

  // Message Info
  getMessageInfo: (messageId) =>
    api.get(`/wa-features/message/${messageId}/info`).then(r => r.data),
  getMessageReactions: (messageId) =>
    api.get(`/wa-features/message/${messageId}/reactions`).then(r => r.data),
  getPollVotes: (messageId) =>
    api.get(`/wa-features/message/${messageId}/poll-votes`).then(r => r.data),

  // Star/Unstar
  starMessage: (messageId) =>
    api.post("/wa-features/message/star", { messageId }).then(r => r.data),
  unstarMessage: (messageId) =>
    api.post("/wa-features/message/unstar", { messageId }).then(r => r.data),

  // Pinned Messages
  getPinnedMessages: (whatsappId, chatId) =>
    api.get("/wa-features/message/pinned", { params: { whatsappId, chatId } }).then(r => r.data),
  checkMessagePinned: (whatsappId, chatId, messageId) =>
    api.get("/wa-features/message/check-pinned", { params: { whatsappId, chatId, messageId } }).then(r => r.data),
};

export default WhatsAppFeaturesService;

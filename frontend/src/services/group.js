import api from "./api";

const enc = (id) => encodeURIComponent(id);

const GroupService = {
  getInfo: (groupId) => api.get(`/groups/${enc(groupId)}/info`).then(r => r.data),
  listParticipants: (groupId) => api.get(`/groups/${enc(groupId)}/participants`).then(r => r.data),
  addParticipants: (groupId, participantIds, options) =>
    api.post(`/groups/${enc(groupId)}/participants/add`, { participantIds, options }).then(r => r.data),
  removeParticipants: (groupId, participantIds) =>
    api.post(`/groups/${enc(groupId)}/participants/remove`, { participantIds }).then(r => r.data),
  promoteParticipants: (groupId, participantIds) =>
    api.post(`/groups/${enc(groupId)}/participants/promote`, { participantIds }).then(r => r.data),
  demoteParticipants: (groupId, participantIds) =>
    api.post(`/groups/${enc(groupId)}/participants/demote`, { participantIds }).then(r => r.data),
  getInvite: (groupId) => api.get(`/groups/${enc(groupId)}/invite`).then(r => r.data),
  revokeInvite: (groupId) => api.post(`/groups/${enc(groupId)}/invite/revoke`).then(r => r.data),
  setMemberAddMode: (groupId, adminsOnly) => api.post(`/groups/${enc(groupId)}/settings/memberAddMode`, { adminsOnly }).then(r => r.data),
  setAnnouncement: (groupId, adminsOnly) => api.post(`/groups/${enc(groupId)}/settings/announcement`, { adminsOnly }).then(r => r.data),
  setRestrict: (groupId, adminsOnly) => api.post(`/groups/${enc(groupId)}/settings/restrict`, { adminsOnly }).then(r => r.data),
  setSubject: (groupId, subject) => api.post(`/groups/${enc(groupId)}/subject`, { subject }).then(r => r.data),
  setDescription: (groupId, description) => api.post(`/groups/${enc(groupId)}/description`, { description }).then(r => r.data),
  setPicture: (groupId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/groups/${enc(groupId)}/picture`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data);
  },
  deletePicture: (groupId) => api.delete(`/groups/${enc(groupId)}/picture`).then(r => r.data),
  listRequests: (groupId) => api.get(`/groups/${enc(groupId)}/membership/requests`).then(r => r.data),
  approveRequests: (groupId, options) => api.post(`/groups/${enc(groupId)}/membership/approve`, { options }).then(r => r.data),
  rejectRequests: (groupId, options) => api.post(`/groups/${enc(groupId)}/membership/reject`, { options }).then(r => r.data),
  leave: (groupId) => api.post(`/groups/${enc(groupId)}/leave`).then(r => r.data),
};

export default GroupService;

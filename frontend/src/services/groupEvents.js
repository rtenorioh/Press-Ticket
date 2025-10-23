import api from "./api";

const GroupEventsService = {
  list: (params) => {
    const query = new URLSearchParams();
    if (params?.whatsappId) query.append('whatsappId', params.whatsappId);
    if (params?.groupId) query.append('groupId', params.groupId);
    if (params?.eventType) query.append('eventType', params.eventType);
    if (params?.limit) query.append('limit', params.limit);
    if (params?.offset) query.append('offset', params.offset);
    
    return api.get(`/group-events?${query.toString()}`).then(r => r.data);
  },

  getById: (eventId) => api.get(`/group-events/${eventId}`).then(r => r.data),

  delete: (eventId) => api.delete(`/group-events/${eventId}`).then(r => r.data),

  deleteOld: (days = 30) => api.post('/group-events/cleanup', { days }).then(r => r.data),

  getGroupStats: (groupId) => api.get(`/group-events/stats/group/${groupId}`).then(r => r.data),

  getWhatsappStats: (whatsappId) => api.get(`/group-events/stats/whatsapp/${whatsappId}`).then(r => r.data),
};

export default GroupEventsService;

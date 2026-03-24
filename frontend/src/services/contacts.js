import api from "./api";

const ContactService = {
  refreshGroupProfilePic: async (contactId, whatsappId) => {
    try {
      const { data } = await api.post(`/contacts/${contactId}/refresh-group-pic`, null, {
        params: { whatsappId }
      });
      return data;
    } catch (error) {
      console.error("[ContactService] Erro ao atualizar foto do grupo:", error);
      throw error;
    }
  }
};

export default ContactService;

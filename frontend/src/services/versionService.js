import api from "./api";

export const getVersionInfo = async () => {
  const { data } = await api.get("/version");
  return data;
};

export const updateWhatsappLib = async () => {
  const { data } = await api.post("/whatsapp-lib/update");
  return data;
};

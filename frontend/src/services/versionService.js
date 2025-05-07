import api from "./api";

export const getVersionInfo = async () => {
  const { data } = await api.get("/version");
  return data;
};

import api from "./api";

export const getVersionInfo = async () => {
  const { data } = await api.get("/version");
  return data;
};

export const updateWhatsappLib = async () => {
  const { data } = await api.post("/whatsapp-lib/update");
  return data;
};

export const updateWhatsappLibFromGit = async () => {
  const { data } = await api.post("/whatsapp-lib/update-git");
  return data;
};

export const getReleaseNotes = async (version) => {
  try {
    const response = await fetch(`https://api.github.com/repos/pedroslopez/whatsapp-web.js/releases/tags/v${version}`);
    if (response.ok) {
      const data = await response.json();
      return data;
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar release notes:', error);
    return null;
  }
};

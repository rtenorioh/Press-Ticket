import { systemVersion } from "../../config/version";
import axios from "axios";

interface VersionInfo {
  currentVersion: string;
  latestVersion: string | null;
  needsUpdate: boolean;
}

const fetchLatestVersion = async (): Promise<string | null> => {
  try {
    const response = await axios.get(
      "https://api.github.com/repos/rtenorioh/Press-Ticket/releases/latest"
    );
    return response.data.tag_name;
  } catch (error) {
    console.error("Erro ao buscar a versão mais recente no GitHub:", error);
    return null;
  }
};

export const getVersionInfo = async (): Promise<VersionInfo> => {
  const latestVersion = await fetchLatestVersion();
  
  const needsUpdate = latestVersion 
    ? systemVersion.localeCompare(latestVersion, undefined, { numeric: true, sensitivity: 'base' }) < 0
    : false;

  return {
    currentVersion: systemVersion,
    latestVersion,
    needsUpdate
  };
};

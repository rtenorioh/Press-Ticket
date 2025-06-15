import { systemVersion } from "../../config/version";
import axios from "axios";
import fs from "fs";
import path from "path";

interface VersionInfo {
  currentVersion: string;
  latestVersion: string | null;
  needsUpdate: boolean;
  whatsappLibVersion: string | null;
  whatsappLibLatestVersion: string | null;
  whatsappLibNeedsUpdate: boolean;
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

const getWhatsappLibVersion = (): string | null => {
  try {
    const packageJsonPath = path.resolve(__dirname, "../../../package.json");
    const packageJsonContent = fs.readFileSync(packageJsonPath, "utf8");
    const packageJson = JSON.parse(packageJsonContent);
    
    const version = packageJson.dependencies["whatsapp-web.js"]?.replace("^", "") || null;
    return version;
  } catch (error) {
    console.error("Erro ao ler a versão da biblioteca whatsapp-web.js:", error);
    return null;
  }
};

const fetchWhatsappLibLatestVersion = async (): Promise<string | null> => {
  try {
    const response = await axios.get(
      "https://api.github.com/repos/pedroslopez/whatsapp-web.js/releases"
    );
    
    const stableReleases = response.data.filter((release: any) => !release.prerelease);
    
    if (stableReleases.length > 0) {
      return stableReleases[0].tag_name.replace("v", "");
    }
    
    return null;
  } catch (error) {
    console.error("Erro ao buscar a versão mais recente da biblioteca whatsapp-web.js:", error);
    return null;
  }
};

export const getVersionInfo = async (): Promise<VersionInfo> => {
  const latestVersion = await fetchLatestVersion();
  const whatsappLibVersion = getWhatsappLibVersion();
  const whatsappLibLatestVersion = await fetchWhatsappLibLatestVersion();
  
  const needsUpdate = latestVersion 
    ? systemVersion.localeCompare(latestVersion, undefined, { numeric: true, sensitivity: 'base' }) < 0
    : false;
    
  const whatsappLibNeedsUpdate = whatsappLibVersion && whatsappLibLatestVersion
    ? whatsappLibVersion.localeCompare(whatsappLibLatestVersion, undefined, { numeric: true, sensitivity: 'base' }) < 0
    : false;

  return {
    currentVersion: systemVersion,
    latestVersion,
    needsUpdate,
    whatsappLibVersion,
    whatsappLibLatestVersion,
    whatsappLibNeedsUpdate
  };
};

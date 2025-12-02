import { systemVersion } from "../../config/version";
import axios from "axios";
import fs from "fs";
import path from "path";

interface GitCommit {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
}

interface VersionInfo {
  currentVersion: string;
  latestVersion: string | null;
  needsUpdate: boolean;
  whatsappLibVersion: string | null;
  whatsappLibLatestVersion: string | null;
  whatsappLibNeedsUpdate: boolean;
  whatsappLibLatestReleaseDate: string | null;
  whatsappLibGitCommits: GitCommit[];
  whatsappLibHasGitUpdates: boolean;
  whatsappLibGitCommitsCount: number;
}

const fetchLatestVersion = async (): Promise<string | null> => {
  try {
    const headers: any = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Press-Ticket'
    };
    
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    try {
      const response = await axios.get(
        "https://api.github.com/repos/rtenorioh/Press-Ticket/releases/latest",
        { headers }
      );

      return response.data.tag_name;
    } catch (releaseError: any) {
      const tagsResponse = await axios.get(
        "https://api.github.com/repos/rtenorioh/Press-Ticket/tags",
        { headers, params: { per_page: 1 } }
      );
      
      if (tagsResponse.data && tagsResponse.data.length > 0) {
        const latestTag = tagsResponse.data[0].name;
        return latestTag;
      }
      
      
      return null;
    }
  } catch (error: any) {
    if (error.response) {
      console.error("[VERSION] Erro na API do GitHub:", {
        status: error.response.status,
        message: error.response.data?.message,
        rateLimit: {
          limit: error.response.headers['x-ratelimit-limit'],
          remaining: error.response.headers['x-ratelimit-remaining'],
          reset: error.response.headers['x-ratelimit-reset']
        }
      });
    } else {
      console.error("[VERSION] Erro ao buscar versão no GitHub:", error.message);
    }
    return null;
  }
};

const getWhatsappLibVersion = (): string | null => {
  try {
    const packageJsonPath = path.resolve(__dirname, "../../../node_modules/whatsapp-web.js/package.json");
    const packageJsonContent = fs.readFileSync(packageJsonPath, "utf8");
    const packageJson = JSON.parse(packageJsonContent);
    
    const version = packageJson.version || null;
    return version;
  } catch (error) {
    console.error("Erro ao ler a versão da biblioteca whatsapp-web.js:", error);
    return null;
  }
};

interface WhatsappLibVersionInfo {
  version: string | null;
  releaseDate: string | null;
}

const fetchWhatsappLibLatestVersion = async (): Promise<WhatsappLibVersionInfo> => {
  try {
    const response = await axios.get(
      "https://api.github.com/repos/pedroslopez/whatsapp-web.js/releases"
    );
    
    const stableReleases = response.data.filter((release: any) => !release.prerelease);
    
    if (stableReleases.length > 0) {
      return {
        version: stableReleases[0].tag_name.replace("v", ""),
        releaseDate: stableReleases[0].published_at
      };
    }
    
    return {
      version: null,
      releaseDate: null
    };
  } catch (error) {
    console.error("Erro ao buscar a versão mais recente da biblioteca whatsapp-web.js:", error);
    return {
      version: null,
      releaseDate: null
    };
  }
};

const fetchWhatsappLibGitCommits = async (currentVersion: string | null): Promise<GitCommit[]> => {
  try {
    if (!currentVersion) {
      return [];
    }

    const commitsResponse = await axios.get(
      "https://api.github.com/repos/pedroslopez/whatsapp-web.js/commits",
      {
        params: {
          sha: "main",
          per_page: 50
        }
      }
    );

    const releasesResponse = await axios.get(
      "https://api.github.com/repos/pedroslopez/whatsapp-web.js/releases"
    );

    const stableReleases = releasesResponse.data.filter((release: any) => !release.prerelease);
    const currentRelease = stableReleases.find((release: any) => 
      release.tag_name === `v${currentVersion}` || release.tag_name === currentVersion
    );

    if (!currentRelease) {
      return [];
    }

    const releaseDate = new Date(currentRelease.published_at);
    const commitsAfterRelease = commitsResponse.data.filter((commit: any) => {
      const commitDate = new Date(commit.commit.author.date);
      return commitDate > releaseDate;
    });

    return commitsAfterRelease.map((commit: any) => ({
      sha: commit.sha.substring(0, 7),
      message: commit.commit.message.split('\n')[0],
      author: commit.commit.author.name,
      date: commit.commit.author.date,
      url: commit.html_url
    }));
  } catch (error) {
    console.error("Erro ao buscar commits do Git:", error);
    return [];
  }
};

export const getVersionInfo = async (): Promise<VersionInfo> => {  
  const latestVersion = await fetchLatestVersion();
  const whatsappLibVersion = getWhatsappLibVersion();
  const whatsappLibInfo = await fetchWhatsappLibLatestVersion();
  const whatsappLibLatestVersion = whatsappLibInfo.version;
  
  const needsUpdate = latestVersion 
    ? systemVersion.localeCompare(latestVersion, undefined, { numeric: true, sensitivity: 'base' }) < 0
    : false;
  
  const whatsappLibNeedsUpdate = whatsappLibVersion && whatsappLibLatestVersion
    ? whatsappLibVersion.localeCompare(whatsappLibLatestVersion, undefined, { numeric: true, sensitivity: 'base' }) < 0
    : false;

  const whatsappLibGitCommits = await fetchWhatsappLibGitCommits(whatsappLibVersion);
  const whatsappLibGitCommitsCount = whatsappLibGitCommits.length;
  const whatsappLibHasGitUpdates = whatsappLibGitCommitsCount > 0;

  return {
    currentVersion: systemVersion,
    latestVersion,
    needsUpdate,
    whatsappLibVersion,
    whatsappLibLatestVersion,
    whatsappLibNeedsUpdate,
    whatsappLibLatestReleaseDate: whatsappLibInfo.releaseDate,
    whatsappLibGitCommits,
    whatsappLibHasGitUpdates,
    whatsappLibGitCommitsCount
  };
};

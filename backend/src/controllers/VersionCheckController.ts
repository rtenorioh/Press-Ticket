import { Request, Response } from "express";
import { exec } from "child_process";
import { promisify } from "util";
import os from "os";
import axios from "axios";
import path from "path";
import fs from "fs";
import { logger } from "../utils/logger";
import { systemVersion } from "../config/version";

const execAsync = promisify(exec);

const PROJECT_ROOT = path.resolve(__dirname, "../../../");

interface GitCommit {
  sha: string;
  fullSha: string;
  message: string;
  author: string;
  date: string;
  url: string;
}

const getLocalGitSha = async (): Promise<string | null> => {
  try {
    const { stdout } = await execAsync("git rev-parse HEAD", { cwd: PROJECT_ROOT });
    return stdout.trim();
  } catch {
    logger.warn("Não foi possível obter o SHA do git local");
    return null;
  }
};

const buildGithubHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "Press-Ticket",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
};

export const checkVersion = async (req: Request, res: Response): Promise<Response> => {
  try {
    const localGitSha = await getLocalGitSha();
    const headers = buildGithubHeaders();

    const { data: release } = await axios.get(
      "https://api.github.com/repos/rtenorioh/Press-Ticket/releases/latest",
      { headers, timeout: 15000 }
    );

    const latestReleaseTag: string = release.tag_name;
    const latestReleaseDate: string = release.published_at;
    const latestReleaseName: string = release.name;

    const { data: comparison } = await axios.get(
      `https://api.github.com/repos/rtenorioh/Press-Ticket/compare/${latestReleaseTag}...HEAD`,
      { headers, timeout: 15000 }
    );

    const commitsBehind: number = comparison.ahead_by ?? 0;

    const pendingCommits: GitCommit[] = [...(comparison.commits ?? [])]
      .reverse()
      .map((commit: any) => ({
        sha: commit.sha.substring(0, 7),
        fullSha: commit.sha,
        message: commit.commit.message.split("\n")[0],
        author: commit.commit.author.name,
        date: commit.commit.author.date,
        url: commit.html_url,
      }));

    return res.status(200).json({
      localVersion: systemVersion,
      localGitSha: localGitSha ? localGitSha.substring(0, 7) : null,
      latestReleaseTag,
      latestReleaseDate,
      latestReleaseName,
      commitsBehind,
      pendingCommits,
      upToDate: commitsBehind === 0,
      isLinux: os.platform() === "linux",
      platform: os.platform(),
    });
  } catch (err: any) {
    logger.error(`Erro ao verificar versão: ${err.message}`);
    return res.status(500).json({ error: "Erro ao verificar versão do sistema" });
  }
};

export const runSystemUpdate = async (req: Request, res: Response): Promise<Response> => {
  try {
    const updateScriptPath = path.join(PROJECT_ROOT, "UPDATE.sh");

    if (!fs.existsSync(updateScriptPath)) {
      return res.status(404).json({ error: "Script UPDATE.sh não encontrado" });
    }

    const { stdout, stderr } = await execAsync(`bash "${updateScriptPath}"`, {
      cwd: PROJECT_ROOT,
      maxBuffer: 100 * 1024 * 1024,
      timeout: 30 * 60 * 1000,
    });

    return res.status(200).json({ success: true, stdout, stderr });
  } catch (err: any) {
    logger.error(`Erro ao executar UPDATE.sh: ${err.message}`);
    return res.status(500).json({
      success: false,
      error: err.message,
      stdout: err.stdout || "",
      stderr: err.stderr || "",
    });
  }
};

import { Request, Response } from "express";
import { exec, spawn } from "child_process";
import { promisify } from "util";
import fs from "fs";
import os from "os";
import path from "path";
import axios from "axios";
import { logger } from "../utils/logger";
import { systemVersion } from "../config/version";
import { getIO } from "../libs/socket";

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
  const token = (process.env.GITHUB_TOKEN ?? "").trim();
  if (token && token !== "undefined") {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

export const checkVersion = async (_req: Request, res: Response): Promise<Response> => {
  logger.info("[version-check] Iniciando verificação de versão...");

  // 1. SHA local via git
  const localGitSha = await getLocalGitSha();
  logger.info(`[version-check] SHA local: ${localGitSha ?? "indisponível"}`);

  const headers = buildGithubHeaders();
  // [DIAG] remova estas 2 linhas após confirmar que funciona
  console.log("[version-check] GITHUB_TOKEN presente:", !!process.env.GITHUB_TOKEN, "| Auth header presente:", !!headers.Authorization);
  console.log("[version-check] Headers enviados:", { ...headers, Authorization: headers.Authorization ? "Bearer ***" : undefined });

  // 2. Última release do GitHub
  let latestReleaseTag: string | null = null;
  let latestReleaseDate: string | null = null;
  let latestReleaseName: string | null = null;

  try {
    logger.info("[version-check] Consultando GitHub releases/latest...");
    const { data: release } = await axios.get(
      "https://api.github.com/repos/rtenorioh/Press-Ticket/releases/latest",
      { headers, timeout: 15000 }
    );
    latestReleaseTag = release.tag_name ?? null;
    latestReleaseDate = release.published_at ?? null;
    latestReleaseName = release.name ?? null;
    logger.info(`[version-check] Release mais recente: ${latestReleaseTag}`);
  } catch (err: any) {
    const status = err?.response?.status;
    const body = JSON.stringify(err?.response?.data)?.substring(0, 300);
    // [DIAG] remova esta linha após confirmar que funciona
    console.error("[version-check] GitHub releases falhou — status:", status, "| body:", body, "| mensagem:", err.message);
    logger.error(`[version-check] Falha ao obter release do GitHub (HTTP ${status ?? "sem resposta"}): ${err.message}`);
  }

  // 3. Commits pendentes (compare tag...HEAD no GitHub)
  let commitsBehind = 0;
  let pendingCommits: GitCommit[] = [];

  if (latestReleaseTag) {
    try {
      logger.info(`[version-check] Comparando ${latestReleaseTag}...HEAD no GitHub...`);
      const { data: comparison } = await axios.get(
        `https://api.github.com/repos/rtenorioh/Press-Ticket/compare/${latestReleaseTag}...HEAD`,
        { headers, timeout: 15000 }
      );
      commitsBehind = comparison.ahead_by ?? 0;
      pendingCommits = [...(comparison.commits ?? [])]
        .reverse()
        .map((commit: any) => ({
          sha: commit.sha.substring(0, 7),
          fullSha: commit.sha,
          message: commit.commit.message.split("\n")[0],
          author: commit.commit.author.name,
          date: commit.commit.author.date,
          url: commit.html_url,
        }));
      logger.info(`[version-check] Commits pendentes: ${commitsBehind}`);
    } catch (err: any) {
      const status = err?.response?.status;
      logger.error(`[version-check] Falha ao comparar commits (HTTP ${status ?? "sem resposta"}): ${err.message}`);
    }
  }

  logger.info("[version-check] Respondendo com dados disponíveis.");

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
    githubAvailable: latestReleaseTag !== null,
  });
};

export const runSystemUpdate = async (req: Request, res: Response): Promise<Response> => {
  try {
    const io = getIO();
    const { updateOS = false, updateBrowser = false, sudoPassword = "" } = req.body;

    const projectName = path.basename(PROJECT_ROOT);
    const backendPath = path.join(PROJECT_ROOT, "backend");
    const frontendPath = path.join(PROJECT_ROOT, "frontend");

    // senha sudo para `sudo -S` + respostas para os prompts interativos do script
    const stdinInput = [
      sudoPassword,
      updateOS ? "s" : "n",
      "n",                       // Node.js: nunca atualiza (hardcoded)
      updateBrowser ? "s" : "n",
    ].join("\n") + "\n";

    setImmediate(() => {
      // script salvo na raiz do projeto: dirname "$0" retornará PROJECT_ROOT,
      // permitindo que o UPDATE.sh derive todos os caminhos internos corretamente
      const scriptPath = path.join(PROJECT_ROOT, `pressticket-update-${Date.now()}.sh`);

      io.emit("systemUpdateLog", {
        type: "stdout",
        message: `📁 Diretório detectado: ${PROJECT_ROOT} (${projectName})\n`,
      });
      io.emit("systemUpdateLog", { type: "stdout", message: "Baixando script de atualização...\n" });

      const download = spawn(
        "curl",
        ["-sSL", "-o", scriptPath, "https://update.pressticket.com.br"],
        { shell: false, cwd: PROJECT_ROOT }
      );

      download.on("close", (dlCode: number | null) => {
        if (dlCode !== 0) {
          io.emit("systemUpdateLog", {
            type: "error",
            message: "❌ Falha ao baixar o script de atualização.",
          });
          return;
        }

        try {
          fs.chmodSync(scriptPath, "755");
        } catch {
          io.emit("systemUpdateLog", {
            type: "error",
            message: "❌ Falha ao definir permissões do script.",
          });
          return;
        }

        io.emit("systemUpdateLog", { type: "stdout", message: "Script baixado. Iniciando...\n" });

        // Nota: o UPDATE.sh usa /tmp/backend/ internamente para verificar a versão atual antes de
        // sobrescrever os arquivos. Isso é comportamento esperado do script, não erro do controller.
        let hasError = false;

        const update = spawn("sudo", ["-S", "bash", scriptPath], {
          shell: false,
          cwd: PROJECT_ROOT,
          env: {
            ...process.env,
            DEBIAN_FRONTEND: "noninteractive",
            CI: "true",
            PROJECT_NAME: projectName,
            APP_NAME: projectName,
            BACKEND_PATH: backendPath,
            FRONTEND_PATH: frontendPath,
          },
        });

        update.stdin.write(stdinInput);
        update.stdin.end();

        update.stdout.on("data", (data: Buffer) => {
          const lines = data.toString().split("\n");
          const filtered = lines.filter((line: string) => {
            const trimmed = line.trim();
            if (trimmed === "s" || trimmed === "n" || trimmed === "^@") return false;
            return true;
          });
          const message = filtered.join("\n").trim();
          if (message) {
            io.emit("systemUpdateLog", { type: "stdout", message });
          }
        });

        update.stderr.on("data", (data: Buffer) => {
          const message = data.toString();
          const lower = message.toLowerCase();
          if (lower.includes("erro:") || lower.includes("error:")) {
            hasError = true;
          }
          const filtered = message
            .split("\n")
            .filter((line: string) =>
              !line.includes("[sudo] password") &&
              !line.includes("password for") &&
              line.trim() !== ""
            )
            .join("\n")
            .trim();
          if (filtered) {
            io.emit("systemUpdateLog", { type: "stderr", message: filtered });
          }
        });

        update.on("close", (exitCode: number | null) => {
          try { fs.unlinkSync(scriptPath); } catch {}
          if (exitCode === 0 && !hasError) {
            io.emit("systemUpdateLog", {
              type: "success",
              message: "✅ Atualização concluída com sucesso! Reinicie a página.",
            });
          } else if (exitCode === 0 && hasError) {
            io.emit("systemUpdateLog", {
              type: "warning",
              message: "⚠️ Atualização concluída com avisos. Verifique os itens marcados em laranja acima.",
            });
          } else {
            io.emit("systemUpdateLog", {
              type: "error",
              message: `❌ Processo encerrado com código ${exitCode}`,
            });
          }
        });
      });
    });

    return res.status(202).json({ success: true, message: "Atualização iniciada" });
  } catch (err: any) {
    logger.error(`Erro ao executar atualização: ${err.message}`);
    return res.status(500).json({ success: false, error: err.message });
  }
};

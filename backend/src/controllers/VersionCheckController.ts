import { Request, Response } from "express";
import { exec, spawn, execSync } from "child_process";
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

    const osAnswer      = updateOS      ? "s" : "n";
    const browserAnswer = updateBrowser ? "s" : "n";

    setImmediate(async () => {
      // verifica se expect está instalado; instala automaticamente se necessário
      let expectAvailable = false;
      try {
        execSync("which expect", { stdio: "ignore" });
        expectAvailable = true;
      } catch {
        expectAvailable = false;
      }

      if (!expectAvailable) {
        const installExpect = (): Promise<void> =>
          new Promise((resolve, reject) => {
            io.emit("systemUpdateLog", {
              type: "warning",
              message: "⚙️ Instalando dependência 'expect'... Aguarde.",
            });

            const install = spawn("sudo", ["-S", "apt-get", "install", "-y", "expect"], {
              shell: false,
            });

            install.stdin.write(`${sudoPassword}\n`);
            install.stdin.end();

            install.stdout.on("data", (data: Buffer) => {
              const line = data.toString().trim();
              if (line) io.emit("systemUpdateLog", { type: "stdout", message: line });
            });

            install.stderr.on("data", (data: Buffer) => {
              const filtered = data.toString()
                .split("\n")
                .filter((l: string) =>
                  !l.includes("[sudo] password") &&
                  !l.includes("password for") &&
                  l.trim() !== ""
                )
                .join("\n")
                .trim();
              if (filtered) io.emit("systemUpdateLog", { type: "stderr", message: filtered });
            });

            install.on("close", (code: number | null) => {
              if (code === 0) {
                io.emit("systemUpdateLog", {
                  type: "stdout",
                  message: "✅ 'expect' instalado com sucesso. Prosseguindo com a atualização...",
                });
                resolve();
              } else {
                reject(new Error(`Instalação do expect falhou com código ${code}`));
              }
            });

            install.on("error", (err: Error) => reject(err));
          });

        try {
          await installExpect();
        } catch (err: any) {
          io.emit("systemUpdateLog", {
            type: "error",
            message: `❌ Falha ao instalar 'expect': ${err.message}. Execute manualmente: sudo apt-get install -y expect`,
          });
          return;
        }
      }

      const ts = Date.now();
      const scriptPath = path.join(PROJECT_ROOT, `pressticket-update-${ts}.sh`);
      const expectScriptPath = path.join(PROJECT_ROOT, `pressticket-expect-${ts}.exp`);

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

        let scriptContent: string;
        try {
          scriptContent = fs.readFileSync(scriptPath, "utf-8");
        } catch {
          io.emit("systemUpdateLog", { type: "error", message: "❌ Falha ao ler o script baixado." });
          return;
        }

        // Patch 1: redireciona /dev/tty → /dev/stdin para que stdin.write() funcione
        scriptContent = scriptContent.replace(/\/dev\/tty/g, "/dev/stdin");

        // Patch 2: corrige bug no PM2 — UPDATE.sh recalcula SCRIPT_DIR com /.., quebrando o path do .env
        scriptContent = scriptContent.replace(
          /SCRIPT_DIR=\$\(cd "\$\(dirname "\$0"\)\/\.\." && pwd\)/g,
          'SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)'
        );

        // Patch 3: garante remoção de NODE_ENV do .env do frontend antes do build
        // (Vite 6 não suporta NODE_ENV em .env — este patch reforça o comportamento
        //  mesmo em versões do UPDATE.sh que ainda injetam NODE_ENV=production)
        scriptContent = scriptContent.replace(
          /(sudo rm -rf build 2>&1 \| tee -a "\$LOG_FILE"\n)npm run build/,
          "$1if grep -q '^NODE_ENV=' .env 2>/dev/null; then sed -i '/^NODE_ENV=/d' .env; fi\nnpm run build"
        );

        // gera script expect com as respostas para cada prompt interativo do UPDATE.sh
        // os valores sensíveis são passados via variáveis de ambiente (não gravados no script)
        const expectScript = [
          "#!/usr/bin/expect -f",
          "set timeout 600",
          "",
          "set scriptPath   $env(UPDATE_SCRIPT_PATH)",
          "set sudoPass     $env(UPDATE_SUDO_PASSWORD)",
          "set osAns        $env(UPDATE_OS_ANSWER)",
          "set chromeAns    $env(UPDATE_BROWSER_ANSWER)",
          "",
          "spawn sudo bash $scriptPath",
          "",
          "expect {",
          "    -re {[Pp]assword.*:} {",
          "        send -- [format \"%s\\r\" $sudoPass]",
          "        exp_continue",
          "    }",
          "    \"sistema operacional\" {",
          "        send -- [format \"%s\\r\" $osAns]",
          "        exp_continue",
          "    }",
          "    \"Node.js\" {",
          "        send -- \"n\\r\"",
          "        exp_continue",
          "    }",
          "    \"Chrome\" {",
          "        send -- [format \"%s\\r\" $chromeAns]",
          "        exp_continue",
          "    }",
          "    eof",
          "}",
        ].join("\n");

        try {
          fs.writeFileSync(scriptPath, scriptContent);
          fs.chmodSync(scriptPath, "755");
          fs.writeFileSync(expectScriptPath, expectScript);
          fs.chmodSync(expectScriptPath, "700");
        } catch {
          io.emit("systemUpdateLog", { type: "error", message: "❌ Falha ao preparar o script." });
          return;
        }

        io.emit("systemUpdateLog", { type: "stdout", message: "📝 Script preparado. Iniciando...\n" });

        let hasError = false;

        const update = spawn("expect", [expectScriptPath], {
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
            UPDATE_SCRIPT_PATH: scriptPath,
            UPDATE_SUDO_PASSWORD: sudoPassword,
            UPDATE_OS_ANSWER: osAnswer,
            UPDATE_BROWSER_ANSWER: browserAnswer,
          },
        });

        update.stdout.on("data", (data: Buffer) => {
          const lines = data.toString().split("\n");
          lines.forEach((line: string) => {
            const trimmed = line.trim();
            if (!trimmed || trimmed === "s" || trimmed === "n" || trimmed === "^@") return;
            if (trimmed.includes("RESTART PM2")) {
              io.emit("systemUpdateLog", {
                type: "warning",
                message: "⏳ Reiniciando os serviços PM2... O sistema ficará indisponível por alguns instantes. Aguarde.",
              });
            }
            io.emit("systemUpdateLog", { type: "stdout", message: trimmed });
          });
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
          try { fs.unlinkSync(expectScriptPath); } catch {}
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

import { access, readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryDirectory = resolve(appDirectory, "..");
const backendDirectory = resolve(appDirectory, "backend");
const apiPort = Number(process.env.MODELMIND_API_PORT ?? "8000");
if (!Number.isInteger(apiPort) || apiPort < 1 || apiPort > 65535) {
  throw new Error("MODELMIND_API_PORT must be a valid TCP port.");
}
const apiUrl = `http://127.0.0.1:${apiPort}`;
const jupyterUrl =
  process.env.NEXT_PUBLIC_JUPYTER_URL ?? "http://127.0.0.1:8899";
const jupyterAddress = new URL(jupyterUrl);
const isLocalJupyter = ["127.0.0.1", "localhost"].includes(
  jupyterAddress.hostname,
);
const jupyterPort = Number(jupyterAddress.port || "8899");
const platformScript =
  process.platform === "win32"
    ? resolve(repositoryDirectory, "scripts", "start-platform.ps1")
    : resolve(repositoryDirectory, "scripts", "start-platform.sh");
const pythonExecutable =
  process.platform === "win32"
    ? resolve(repositoryDirectory, ".venv", "Scripts", "python.exe")
    : resolve(repositoryDirectory, ".venv", "bin", "python");
const mode = process.argv[2] ?? "dev";
const runWebsite = mode !== "companion";

async function isJupyterRunning() {
  try {
    const response = await fetch(`http://127.0.0.1:${jupyterPort}/api`, {
      redirect: "manual",
      signal: AbortSignal.timeout(1500),
    });

    if (response.status === 302) {
      return response.headers.get("location")?.startsWith("/login") ?? false;
    }

    if (response.ok) {
      const body = await response.json();
      return typeof body?.version === "string";
    }

    return response.status === 401;
  } catch {
    return false;
  }
}

async function isBackendRunning() {
  try {
    const response = await fetch(`${apiUrl}/health`, {
      signal: AbortSignal.timeout(1500),
    });
    if (!response.ok) {
      return false;
    }

    const body = await response.json();
    return body?.status === "healthy";
  } catch {
    return false;
  }
}

async function waitForService(name, isRunning, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await isRunning()) {
      return;
    }
    await new Promise(resolveDelay => setTimeout(resolveDelay, 1000));
  }
  throw new Error(`${name} did not become ready before the startup timeout.`);
}

async function readLocalOriginSetting() {
  if (process.env.MODELMIND_WEB_ORIGINS) {
    return process.env.MODELMIND_WEB_ORIGINS;
  }

  try {
    const envFile = await readFile(
      resolve(repositoryDirectory, ".env"),
      "utf8",
    );
    for (const line of envFile.split(/\r?\n/)) {
      const match = line.match(/^\s*MODELMIND_WEB_ORIGINS\s*=\s*(.*?)\s*$/);
      if (!match) {
        continue;
      }
      const value = match[1].replace(/^(['"])(.*)\1$/, "$2").trim();
      if (value) {
        return value;
      }
    }
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
  return undefined;
}

function startChild(command, args, options) {
  const child = spawn(command, args, { stdio: "inherit", ...options });
  children.add(child);
  child.once("error", error => {
    console.error(`Could not start ${command}:`, error);
    stop(1);
  });
  child.once("close", (code, signal) => {
    children.delete(child);
    if (!stopping) {
      console.error(
        `${command} exited ${signal ? `after ${signal}` : `with code ${code}`}.`,
      );
      stop(code || 1);
    } else if (children.size === 0) {
      process.exit(exitCode);
    }
  });
  return child;
}

const children = new Set();
let stopping = false;
let exitCode = 0;

function stop(code = 0) {
  if (stopping) {
    return;
  }
  stopping = true;
  exitCode = code;
  for (const child of children) {
    child.kill("SIGTERM");
  }
  const forceExit = setTimeout(() => {
    for (const child of children) {
      child.kill("SIGKILL");
    }
    process.exit(exitCode);
  }, 5000);
  forceExit.unref();
}

process.on("SIGINT", () => stop(0));
process.on("SIGTERM", () => stop(0));

try {
  if (!isLocalJupyter) {
    console.log(
      `Using the configured Jupyter server at ${jupyterUrl}; local startup skipped.`,
    );
  } else if (await isJupyterRunning()) {
    console.log(`Using the existing Jupyter server at ${jupyterUrl}.`);
  } else {
    let canStartPlatform = false;
    try {
      await access(platformScript);
      canStartPlatform = true;
    } catch {
      console.log("Local platform script not found; skipping local JupyterLab.");
    }

    if (canStartPlatform) {
      console.log(`Starting JupyterLab at ${jupyterUrl}.`);
      try {
        if (process.platform === "win32") {
          startChild(
            "powershell.exe",
            [
              "-NoProfile",
              "-ExecutionPolicy",
              "Bypass",
              "-File",
              platformScript,
              "-Port",
              String(jupyterPort),
            ],
            {
              cwd: repositoryDirectory,
              env: {
                ...process.env,
                MODELMIND_JUPYTER_PORT: String(jupyterPort),
              },
            },
          );
        } else {
          startChild("bash", [platformScript], {
            cwd: repositoryDirectory,
            env: {
              ...process.env,
              MODELMIND_JUPYTER_PORT: String(jupyterPort),
              PORT: String(jupyterPort),
            },
          });
        }
        await waitForService("JupyterLab", isJupyterRunning, 30 * 1000);
      } catch (err) {
        console.warn("Could not start JupyterLab (continuing with web app):", err?.message ?? err);
      }
    }
  }

  if (await isBackendRunning()) {
    console.log(`Using the existing local ModelMind API at ${apiUrl}.`);
  } else {
    let canStartPython = false;
    try {
      await access(pythonExecutable);
      canStartPython = true;
    } catch {
      console.log("Python virtual environment not found; skipping local ModelMind Python API.");
    }

    if (canStartPython) {
      try {
        const localOrigins = await readLocalOriginSetting();
        console.log(`Starting the local ModelMind API at ${apiUrl}.`);
        startChild(
          pythonExecutable,
          [
            "-m",
            "uvicorn",
            "main:app",
            "--host",
            "127.0.0.1",
            "--port",
            String(apiPort),
          ],
          {
            cwd: backendDirectory,
            env: {
              ...process.env,
              ...(localOrigins ? { MODELMIND_WEB_ORIGINS: localOrigins } : {}),
              MODELMIND_API_PORT: String(apiPort),
              MODELMIND_JUPYTER_PORT: String(jupyterPort),
            },
          },
        );
        await waitForService("ModelMind API", isBackendRunning, 30 * 1000);
      } catch (err) {
        console.warn("Could not start ModelMind Python API (continuing with web app):", err?.message ?? err);
      }
    }
  }

  if (runWebsite) {
    const nextCli = resolve(
      appDirectory,
      "node_modules",
      "next",
      "dist",
      "bin",
      "next",
    );
    startChild(process.execPath, [nextCli, mode], {
      cwd: appDirectory,
    });
  } else {
    console.log("Local notebook services are ready. Press Ctrl+C to stop them.");
  }
} catch (error) {
  console.error("Could not start the local ModelMind services:", error);
  stop(1);
}

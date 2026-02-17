import { spawn } from "node:child_process";
import consola from "consola";
import { acquireLock, releaseLock } from "./lock.js";

async function run(cmd) {
  consola.debug(`Running: ${cmd.join(" ")}`);

  return new Promise((resolve, reject) => {
    const p = spawn(cmd[0], cmd.slice(1), {
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    p.stdout.on("data", (d) => {
      stdout += d.toString();
    });

    p.stderr.on("data", (d) => {
      stderr += d.toString();
    });

    p.on("close", (code) => {
      if (code !== 0) {
        consola.error(stderr);
        reject(new Error(`Command failed: ${cmd.join(" ")}`));
      } else {
        resolve(stdout);
      }
    });
  });
}

async function hasFlakeChanged() {
  const output = await run([
    "git",
    "status",
    "--porcelain",
    "flake.lock",
  ]);

}

async function main() {
  consola.info("Nix update bot started");

  await acquireLock();

  try {
    consola.start("Running arch update");
    await run(["sudo", "pacman", "--Syu"]);
    consola.success("arch update finished");
  }
};

main().catch((err) => {
  consola.fatal(err);
  process.exit(1);
});


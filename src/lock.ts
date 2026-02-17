import fs from "fs";
import consola from "consola";

const LOCK_FILE = ".nix-bot.lock";

export async function acquireLock() {
  try {
    await fs.writeFile(
      LOCK_FILE,
      Date.now().toString(),
      { flag: "wx" } // 既に存在したらエラー
    );
  } catch (err) {
    if (err.code === "EEXIST") {
      consola.error("Bot already running.");
      process.exit(1);
    }
    throw err;
  }
}

export async function releaseLock() {
  try {
    await fs.unlink(LOCK_FILE);
  } catch {}
}

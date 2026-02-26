import * as fs from "fs";
import * as path from "path";

const LOCK_FILE = path.join(process.cwd(), ".updater.lock");

export function isLocked(): boolean {
  try {
    return fs.existsSync(LOCK_FILE);
  } catch {
    return false;
  }
}

export function createLock(): void {
  fs.writeFileSync(LOCK_FILE, Date.now().toString());
}

export function removeLock(): void {
  try {
    fs.unlinkSync(LOCK_FILE);
  } catch {
    // ignore
  }
}

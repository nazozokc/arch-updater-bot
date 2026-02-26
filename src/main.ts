import * as child_process from "child_process";
import * as console from "console";

function runCommand(command: string): Promise<boolean> {
  return new Promise((resolve) => {
    console.log(`Running: ${command}`);
    console.log("---");

    const child = child_process.exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        resolve(false);
        return;
      }
      resolve(true);
    });

    child.stdout?.on("data", (data) => {
      process.stdout.write(data);
    });

    child.stderr?.on("data", (data) => {
      process.stderr.write(data);
    });

    child.on("close", (code) => {
      if (code === 0) {
        console.log(`Command succeeded with code ${code}`);
      } else {
        console.error(`Command failed with code ${code}`);
        resolve(false);
      }
    });
  });
}

async function checkCommandExists(command: string): Promise<boolean> {
  return new Promise((resolve) => {
    child_process.exec(`command -v ${command} >/dev/null 2>&1`, (error) => {
      resolve(error === null);
    });
  });
}

async function main(): Promise<void> {
  console.log("Starting Arch Linux updater...");

  const pacmanExists = await checkCommandExists("pacman");
  if (!pacmanExists) {
    console.log("command not found: pacman");
    console.log("Done.");
    return;
  }

  const yayExists = await checkCommandExists("yay");

  // Run sudo pacman -Syu
  const pacmanSuccess = await runCommand("sudo pacman -Syu");
  if (!pacmanSuccess) {
    console.error("pacman update failed");
    console.log("Done.");
    return;
  }

  // Run yay -Syu if yay exists
  if (yayExists) {
    const yaySuccess = await runCommand("yay -Syu");
    if (!yaySuccess) {
      console.error("yay update failed");
      console.log("Done.");
      return;
    }
  } else {
    console.log("command not found: yay");
  }

  console.log("Done.");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

const { existsSync, rmSync } = require("fs");
const { spawn } = require("child_process");
const path = require("path");

const nextDir = path.join(process.cwd(), ".next");
const extraArgs = process.argv.slice(2);

if (existsSync(nextDir)) {
  rmSync(nextDir, { recursive: true, force: true });
  console.log("Cleared .next cache");
}

const isWindows = process.platform === "win32";
const command = isWindows ? "cmd.exe" : "npm";
const args = isWindows ? ["/c", "npm", "run", "dev", "--", ...extraArgs] : ["run", "dev", "--", ...extraArgs];
const child = spawn(command, args, {
  stdio: "inherit",
  shell: false,
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});

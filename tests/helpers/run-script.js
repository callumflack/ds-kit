import { spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, symlinkSync, writeFileSync } from "node:fs";
import { rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

const repoRoot = resolve(dirname(new URL(import.meta.url).pathname), "../..");

export function createFixtureWorkspace(fixturePath) {
  const workspace = mkdtempSync(join(tmpdir(), "ds-kit-verify-"));

  cpSync(fixturePath, workspace, { recursive: true });
  writeFileSync(
    join(workspace, "package.json"),
    JSON.stringify({ private: true }, null, 2)
  );
  symlinkSync(join(repoRoot, "node_modules"), join(workspace, "node_modules"));

  return {
    workspace,
    cleanup: async () => rm(workspace, { force: true, recursive: true }),
  };
}

export function runScript(scriptRelativePath, cwd) {
  const result = spawnSync(
    process.execPath,
    [join(repoRoot, scriptRelativePath)],
    {
      cwd,
      encoding: "utf8",
    }
  );

  return {
    code: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
  };
}

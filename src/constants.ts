import path from "node:path";

/** If running from a compiled binary, assume that the binary is in the "dist" directory. */
export const PROJECT_ROOT = isCompiled()
  ? path.resolve(path.dirname(process.execPath), "..")
  : path.resolve(import.meta.dirname, "..");

function isCompiled(): boolean {
  const binaryName = path.basename(process.execPath);

  // Check for both "bun" and "bun.exe".
  return !binaryName.toLowerCase().startsWith("bun");
}

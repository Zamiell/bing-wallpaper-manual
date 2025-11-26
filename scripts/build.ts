import { buildScript, compileToSingleFileWithBun } from "complete-node";

await buildScript(import.meta.dirname, async (packageRoot) => {
  await compileToSingleFileWithBun(packageRoot, "bun-windows-x64");
});

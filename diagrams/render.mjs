// Build-time only. The handbook serves the exported SVGs without a runtime.
// Usage: node diagrams/render.mjs [path/to/renderer-dom/dist/index.js]
import { readdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const renderer = process.argv[2]
  ? pathToFileURL(resolve(process.argv[2])).href
  : "@markdy/renderer-dom";
const { exportDiagramAsVectorSvg } = await import(renderer);
const directory = new URL("./", import.meta.url);

for (const file of (await readdir(directory)).filter((file) => file.endsWith(".markdy")).sort()) {
  const source = await readFile(new URL(file, directory), "utf8");
  const svg = exportDiagramAsVectorSvg(source);
  await writeFile(new URL(file.replace(/\.markdy$/, ".svg"), directory), svg);
  console.log(`Rendered ${file}`);
}

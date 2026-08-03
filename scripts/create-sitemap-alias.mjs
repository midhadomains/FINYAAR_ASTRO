import { copyFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const source = fileURLToPath(new URL("../dist/sitemap-0.xml", import.meta.url));
const destination = fileURLToPath(new URL("../dist/sitemap.xml", import.meta.url));

try {
  await copyFile(source, destination);
  console.log("Created dist/sitemap.xml from dist/sitemap-0.xml.");
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
  console.warn("dist/sitemap-0.xml was not generated; skipping sitemap.xml alias.");
}

import { readFile, rename, unlink } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const source = fileURLToPath(new URL("../dist/sitemap-0.xml", import.meta.url));
const destination = fileURLToPath(new URL("../dist/sitemap.xml", import.meta.url));

const index = fileURLToPath(new URL("../dist/sitemap-index.xml", import.meta.url));
const indexXml = await readFile(index, "utf8");
// Never silently drop URLs if the site grows beyond a single sitemap.
if ((indexXml.match(/<sitemap>/g) ?? []).length !== 1) {
  throw new Error("Single sitemap output requires exactly one generated sitemap. Revisit sitemap splitting before deploying.");
}
await rename(source, destination);
await unlink(index);
console.log("Created dist/sitemap.xml with all page URLs; removed the sitemap index.");

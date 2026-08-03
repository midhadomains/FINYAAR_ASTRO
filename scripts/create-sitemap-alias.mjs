import { copyFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const source = fileURLToPath(new URL("../dist/sitemap-0.xml", import.meta.url));
const destination = fileURLToPath(new URL("../dist/sitemap.xml", import.meta.url));

await copyFile(source, destination);

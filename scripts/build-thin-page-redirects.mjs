import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
const root = new URL("../", import.meta.url);
const actions = JSON.parse(readFileSync(new URL("src/data/thin-page-actions.json", root), "utf8"));
const built = (url) => existsSync(fileURLToPath(new URL(`dist${url}index.html`, root)));
const lines = ["# Generated from Appendix A. Pending redirects activate only when their dictionary page is built."];
let pending = 0;
for (const item of actions) {
  if (!item.target) continue;
  if (!built(item.target)) {
    if (item.action === "redirect") throw new Error(`Missing required redirect target: ${item.target}`);
    pending++;
    continue;
  }
  lines.push(`${item.url} ${item.target} 301`, `${item.url.slice(0, -1)} ${item.target} 301`);
}
const categoryPillars = JSON.parse(readFileSync(new URL("src/data/category-pillars.json", root), "utf8"));
for (const [category, pillar] of Object.entries(categoryPillars)) {
  const source = `/dictionary/category/${category}/`;
  const target = `/${pillar}/`;
  if (!built(target)) throw new Error(`Missing pillar redirect target: ${target}`);
  if (built(source)) throw new Error(`Retired category page still built: ${source}`);
  lines.push(`${source} ${target} 301`, `${source.slice(0, -1)} ${target} 301`);
}
writeFileSync(new URL("dist/_redirects", root), lines.join("\n") + "\n");
console.log(`URL cleanup: ${(lines.length - 1) / 2} redirects, ${pending} awaiting dictionary publication.`);

import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
const actions = JSON.parse(readFileSync("src/data/thin-page-actions.json", "utf8"));
const sitemap = readFileSync("dist/sitemap.xml", "utf8");
const redirects = readFileSync("dist/_redirects", "utf8");
const built = (url) => existsSync(join("dist", url, "index.html"));
assert.equal(actions.length, 104);
for (const [action, count] of Object.entries({ redirect: 37, "pending-redirect": 14, keep: 9, remove: 44 })) {
  assert.equal(actions.filter((item) => item.action === action).length, count);
}
for (const item of actions) {
  assert.equal(built(item.url), item.action === "keep", `Build: ${item.url}`);
  assert.equal(sitemap.includes(`${item.url}</loc>`), item.action === "keep", `Sitemap: ${item.url}`);
  if (item.target) {
    const active = built(item.target);
    if (item.action === "redirect") assert.ok(active, `Missing target ${item.target}`);
    for (const source of [item.url, item.url.slice(0, -1)]) {
      assert.equal(redirects.includes(`${source} ${item.target} 301\n`), active, `Redirect: ${source}`);
    }
  } else assert.ok(!redirects.includes(item.url));
}
const removed = new Set(actions.filter((item) => item.action !== "keep").map((item) => item.url.replace(/\/$/, "")));
function checkLinks(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) checkLinks(path);
    else if (path.endsWith(".html")) {
      const html = readFileSync(path, "utf8");
      for (const match of html.matchAll(/href=["']([^"']+)["']/g)) {
        const url = new URL(match[1], "https://www.finyaar.com");
        if (url.hostname === "www.finyaar.com") assert.ok(!removed.has(url.pathname.replace(/\/$/, "")), `Stale link in ${path}: ${match[1]}`);
      }
    }
  }
}
checkLinks("dist");
assert.ok(existsSync("dist/404.html"));
console.log("PASS: all 104 Appendix A actions, redirect destinations, sitemap inclusion, 404 artifact, and internal links.");

const categoryPillars = JSON.parse(readFileSync("src/data/category-pillars.json", "utf8"));
assert.equal(Object.keys(categoryPillars).length, 14);
assert.ok(!sitemap.includes("/dictionary/category/"));
assert.ok(!readFileSync("dist/internal/keyword-map.csv", "utf8").includes("/dictionary/category/"));
for (const [category, pillar] of Object.entries(categoryPillars)) {
  const source = `/dictionary/category/${category}/`;
  const target = `/${pillar}/`;
  assert.ok(!built(source));
  assert.ok(built(target));
  assert.ok(sitemap.includes(`${target}</loc>`));
  for (const path of [source, source.slice(0, -1)]) assert.ok(redirects.includes(`${path} ${target} 301\n`));
}
function checkCategoryReferences(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) checkCategoryReferences(path);
    else if (path.endsWith(".html")) assert.ok(!readFileSync(path, "utf8").includes("/dictionary/category/"), `Retired category reference: ${path}`);
  }
}
checkCategoryReferences("dist");
console.log("PASS: 14 category redirects, pillar destinations, and no retired category URLs in HTML, schema, sitemap, or keyword map.");

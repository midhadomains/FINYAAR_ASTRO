import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
const dates = JSON.parse(readFileSync("src/data/content-dates.json", "utf8"));
let schemaCount = 0;
for (const [path, expected] of Object.entries(dates)) {
  const html = readFileSync(join("dist", path, "index.html"), "utf8");
  assert.equal((html.match(/data-content-byline/g) ?? []).length, 1, path);
  assert.match(html, /href="\/about\/"[^>]*rel="author"[^>]*>FinYaar Team<\/a>/, path);
  assert.ok(html.includes(`datetime="${expected.dateModified}"`), path);
  assert.ok(html.includes("Last updated:"), path);
  function walk(value) {
    if (!value || typeof value !== "object") return;
    if (["Article", "DefinedTerm"].includes(value["@type"])) {
      schemaCount++;
      const entry = dates[new URL(value.url).pathname];
      assert.ok(entry, value.url);
      assert.equal(value.author?.["@type"], "Organization", path);
      assert.equal(value.author?.name, "FinYaar", path);
      assert.ok(value.author?.["@id"].endsWith("/#organization"), path);
      assert.equal(value.datePublished, entry.datePublished, path);
      assert.equal(value.dateModified, entry.dateModified, path);
      assert.ok(Date.parse(value.datePublished) <= Date.parse(value.dateModified), path);
    }
    for (const child of Object.values(value)) walk(child);
  }
  for (const match of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) walk(JSON.parse(match[1]));
}
assert.ok(schemaCount > 0);
console.log(`PASS: ${Object.keys(dates).length} visible bylines and ${schemaCount} Article/DefinedTerm schemas with matching author and dates.`);

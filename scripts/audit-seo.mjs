import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const dist = join(process.cwd(), "dist");

function filesIn(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? filesIn(path) : [path];
  });
}

function decode(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));
}

function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"' && quoted && text[index + 1] === '"') { cell += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { row.push(cell); cell = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[index + 1] === "\n") index += 1;
      row.push(cell); if (row.some(Boolean)) rows.push(row); row = []; cell = "";
    } else cell += char;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [headers, ...data] = rows;
  return data.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}

const targets = parseCsv(readFileSync(join(dist, "internal", "keyword-map.csv"), "utf8"));
const byUrl = new Map(targets.map((target) => [target.url, target]));
const errors = [];
const htmlFiles = filesIn(dist).filter((path) => path.endsWith(`${sep}index.html`));
const publicUrls = new Set(htmlFiles.map((file) => {
  const local = relative(dist, file).split(sep).join("/");
  return local === "index.html" ? "/" : `/${local.replace(/index\.html$/, "")}`;
}));
const incoming = new Map([...publicUrls].map((url) => [url, 0]));

for (const file of htmlFiles) {
  const local = relative(dist, file).split(sep).join("/");
  const url = local === "index.html" ? "/" : `/${local.replace(/index\.html$/, "")}`;
  const target = byUrl.get(url);
  const html = readFileSync(file, "utf8");
  if (!target) { errors.push(`${url}: missing keyword-map target`); continue; }

  const title = decode(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.replace(/<[^>]+>/g, "").trim() ?? "");
  const description = decode(html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1] ?? "");
  const h1 = decode(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, "").trim() ?? "");
  const bodyText = decode((html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
  const first100 = bodyText.split(/\s+/).slice(0, 100).join(" ").toLowerCase();
  const keyword = target.primary_keyword.toLowerCase();

  if (!title || title.length > 60) errors.push(`${url}: title length is ${title.length}, expected 1–60`);
  if (description.length < 150 || description.length > 160) errors.push(`${url}: meta description length is ${description.length}, expected 150–160`);
  if (!title.toLowerCase().includes(keyword)) errors.push(`${url}: primary keyword missing from title`);
  if (!h1.toLowerCase().includes(keyword)) errors.push(`${url}: primary keyword missing from H1`);
  if (!first100.includes(keyword)) errors.push(`${url}: primary keyword missing from first 100 words`);
  if (!html.includes('"@type":"FAQPage"')) errors.push(`${url}: FAQPage schema missing`);
  if (!html.includes('id="faq"')) errors.push(`${url}: visible FAQ block missing`);
  if (!html.includes('aria-label="Breadcrumb"')) errors.push(`${url}: visible breadcrumb navigation missing`);
  if (!html.includes('"@type":"BreadcrumbList"')) errors.push(`${url}: BreadcrumbList schema missing`);

  if (target.page_type === "pillar" && !html.includes("data-cluster-link")) errors.push(`${url}: pillar has no tagged cluster links`);
  if (target.page_type === "cluster" && !html.includes("data-pillar-link")) errors.push(`${url}: cluster has no link up to its pillar`);
  if (target.page_type === "dictionary-term") {
    const relatedCount = (html.match(/data-related-term/g) ?? []).length;
    if (relatedCount < 3 || relatedCount > 6) errors.push(`${url}: expected 3–6 related terms, found ${relatedCount}`);
    if (!html.includes('"@type":"DefinedTerm"')) errors.push(`${url}: DefinedTerm schema missing`);
    if (!html.includes('"@type":"DefinedTermSet"')) errors.push(`${url}: DefinedTermSet reference missing`);
  }
  if (target.page_type === "dictionary-index" && !html.includes('"@type":"DefinedTermSet"')) errors.push(`${url}: DefinedTermSet schema missing`);
  if (["cluster", "pillar"].includes(target.page_type) && !html.includes('"@type":"Article"')) errors.push(`${url}: Article schema missing`);
  if (html.includes('data-page-kind="how-to"') && !html.includes('"@type":"HowTo"')) errors.push(`${url}: HowTo schema missing`);
  if (url === "/") {
    if (!html.includes('"@type":"Organization"')) errors.push(`${url}: Organization schema missing`);
    if (!html.includes('"@type":"WebSite"')) errors.push(`${url}: WebSite schema missing`);
    if (!html.includes('"@type":"SearchAction"')) errors.push(`${url}: sitelinks SearchAction missing`);
  }
  if (["/cfa/", "/frm/"].includes(url) && !html.includes('"@type":"Course"')) errors.push(`${url}: educational Course schema missing`);

  for (const match of html.matchAll(/<a\b[^>]*href=["']([^"'#?]+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const href = match[1];
    const anchor = decode(match[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()).toLowerCase();
    if (["click here", "here"].includes(anchor)) errors.push(`${url}: generic anchor text “${anchor}”`);
    if (!href.startsWith("/") || href.startsWith("//")) continue;
    const cleanHref = href.split("#")[0].split("?")[0];
    const targetUrl = cleanHref === "/" ? "/" : `${cleanHref.replace(/\/$/, "")}/`;
    if (incoming.has(targetUrl)) incoming.set(targetUrl, incoming.get(targetUrl) + 1);
  }

  for (const image of html.match(/<img\b[^>]*>/gi) ?? []) {
    if (!/\balt="[^"]+"/i.test(image)) errors.push(`${url}: image has missing or empty alt text`);
    if (!/\bloading="lazy"/i.test(image)) errors.push(`${url}: image is not lazy-loaded`);
    if (!/\bwidth=/i.test(image) || !/\bheight=/i.test(image)) errors.push(`${url}: image dimensions are missing`);
  }
}

for (const [url, count] of incoming) {
  if (url !== "/" && count === 0) errors.push(`${url}: orphan page with no incoming internal link`);
}

const dictionaryIndex = readFileSync(join(dist, "dictionary", "index.html"), "utf8");
for (const target of targets.filter(({ page_type }) => page_type === "dictionary-term")) {
  if (!dictionaryIndex.includes(`href="${target.url.replace(/\/$/, "")}"`) && !dictionaryIndex.includes(`href="${target.url}"`)) {
    errors.push(`${target.url}: missing from the dictionary A–Z index`);
  }
}

const duplicateKeywords = targets.filter((target, index) =>
  targets.findIndex((candidate) => candidate.primary_keyword.toLowerCase() === target.primary_keyword.toLowerCase()) !== index,
);
if (duplicateKeywords.length) errors.push(`Duplicate primary keywords: ${duplicateKeywords.map(({ primary_keyword }) => primary_keyword).join(", ")}`);

if (errors.length) {
  console.error(`SEO audit failed with ${errors.length} issue(s):\n${errors.join("\n")}`);
  process.exit(1);
}

console.log(`SEO audit passed: ${htmlFiles.length} pages, on-page metadata, breadcrumbs/schema, hub-and-spoke links, 3–6 related terms, A–Z coverage, no orphans, descriptive anchors, and image attributes.`);

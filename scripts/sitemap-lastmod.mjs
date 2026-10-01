import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Source files containing the page's content, not site-wide styles or templates.
export function contentSources(pathname, root = process.cwd()) {
  const path = decodeURIComponent(pathname).replace(/^\/+|\/+$/g, '');
  if (path.startsWith('dictionary/') && path.split('/').length === 2) {
    return [`src/data/dictionary-lessons/${path.split('/')[1]}-lesson-body.html`, 'src/data/finyaar-dictionary-metadata.json'];
  }
  const direct = path ? `src/pages/${path}.astro` : 'src/pages/index.astro';
  const index = `src/pages/${path}/index.astro`;
  const page = existsSync(resolve(root, direct)) ? direct : existsSync(resolve(root, index)) ? index : undefined;
  if (page) {
    const sources = [page];
    if (['', 'dictionary', 'sitemap'].includes(path)) sources.push('src/data/finyaar-dictionary-metadata.json');
    if (['', 'topics', 'sitemap'].includes(path)) sources.push('src/lib/pillars.ts');
    return sources;
  }
  if (path.split('/').length === 2) return ['src/lib/pillars.ts', 'src/components/FinanceCalculator.astro'];
  return ['src/data/topic-content.json', 'src/lib/pillars.ts'];
}

/** Use committed content dates; never build time, filesystem mtime, or a global override. */
export function createSitemapLastmod({ root = process.cwd() } = {}) {
  const dates = new Map();
  const sourceDates = new Map();
  const git = (args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  let fullHistory = false;
  try { fullHistory = git(['rev-parse', '--is-shallow-repository']) === 'false'; } catch { /* Use explicit per-page dates below. */ }
  const metadataPath = resolve(root, 'src/data/content-dates.json');
  const metadata = existsSync(metadataPath) ? JSON.parse(readFileSync(metadataPath, 'utf8')) : {};

  return (url) => {
    const pathname = new URL(url).pathname;
    const key = `/${pathname.split('/').filter(Boolean).join('/')}/`.replace('//', '/');
    if (!dates.has(key)) {
      const committed = [];
      if (fullHistory) {
        for (const source of contentSources(pathname, root)) {
          if (!sourceDates.has(source)) {
            let date;
            try { date = git(['log', '-1', '--format=%cI', '--', source]); } catch { /* Require a recorded date below. */ }
            sourceDates.set(source, date && Number.isFinite(Date.parse(date)) ? Date.parse(date) : undefined);
          }
          const date = sourceDates.get(source);
          if (date !== undefined) committed.push(date);
        }
      }
      // A shallow clone cannot reliably tell when a file last changed. The checked-in
      // per-page editorial date is an explicit fallback, not the checkout/HEAD date.
      const fallback = Date.parse(metadata[key]?.dateModified);
      const timestamp = committed.length ? Math.max(...committed) : fallback;
      if (!Number.isFinite(timestamp)) throw new Error(`No content change date for ${key}. Fetch full Git history or add its dateModified to src/data/content-dates.json.`);
      dates.set(key, new Date(timestamp).toISOString());
    }
    return dates.get(key);
  };
}

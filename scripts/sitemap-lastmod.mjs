import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

/** Resolve stable source-change dates, rather than stamping every build as new. */
export function createSitemapLastmod() {
  const dates = new Map();

  return (/** @type {string} */ url) => {
    const path = decodeURIComponent(new URL(url).pathname).replace(/^\/+|\/+$/g, '');
    let page = path ? `src/pages/${path}.astro` : 'src/pages/index.astro';
    if (!existsSync(page)) {
      const index = `src/pages/${path}/index.astro`;
      if (existsSync(index)) page = index;
      else if (path.startsWith('dictionary/category/')) page = 'src/pages/dictionary/category/[category].astro';
      else if (path.startsWith('dictionary/')) page = 'src/pages/dictionary/[slug].astro';
      else if (path.includes('/')) page = 'src/pages/[topic]/[article].astro';
      else page = 'src/pages/[slug].astro';
    }

    if (!dates.has(page)) {
      // Shared templates and data can change the rendered content of these pages.
      // Git dates are conservative: a shared-data change may affect multiple URLs.
      let date = process.env.SITEMAP_LASTMOD;
      if (!date) {
        try {
          date = execFileSync('git', [
            'log', '-1', '--format=%cI', '--', page,
            'src/components', 'src/lib', 'src/data',
          ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
        } catch {
          throw new Error('Sitemap lastmod requires Git history or SITEMAP_LASTMOD set to the content update date.');
        }
      }
      if (!date || Number.isNaN(Date.parse(date))) {
        throw new Error(`No valid sitemap lastmod for ${page}. Set SITEMAP_LASTMOD to an ISO content update date.`);
      }
      dates.set(page, new Date(date).toISOString());
    }
    return dates.get(page);
  };
}

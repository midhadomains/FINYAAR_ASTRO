import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { createSitemapLastmod } from './sitemap-lastmod.mjs';
const root = mkdtempSync(join(tmpdir(), 'finyaar-lastmod-'));
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const write = (file, text) => { mkdirSync(dirname(join(root, file)), { recursive: true }); writeFileSync(join(root, file), text); };
const commit = (date) => {
  git('add', '.');
  execFileSync('git', ['-c', 'user.name=Lastmod Test', '-c', 'user.email=test@example.invalid', '-c', 'commit.gpgsign=false', 'commit', '-m', 'fixture'], {
    cwd: root, env: { ...process.env, GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date }, stdio: 'pipe',
  });
};
git('init');
write('src/data/dictionary-lessons/alpha-lesson-body.html', 'Alpha');
write('src/data/dictionary-lessons/beta-lesson-body.html', 'Beta');
write('src/data/finyaar-dictionary-metadata.json', '{}');
write('src/pages/about.astro', 'About');
commit('2025-01-01T00:00:00Z');
write('src/data/dictionary-lessons/alpha-lesson-body.html', 'Alpha updated');
commit('2025-02-01T00:00:00Z');
write('src/components/SiteHeader.astro', 'Shared design change');
commit('2025-03-01T00:00:00Z');
const url = (path) => `https://www.finyaar.com${path}`;
let resolveDate = createSitemapLastmod({ root });
assert.equal(resolveDate(url('/dictionary/alpha/')), '2025-02-01T00:00:00.000Z');
assert.equal(resolveDate(url('/dictionary/beta/')), '2025-01-01T00:00:00.000Z');
assert.equal(resolveDate(url('/about/')), '2025-01-01T00:00:00.000Z');
assert.equal(createSitemapLastmod({ root })(url('/dictionary/alpha/')), resolveDate(url('/dictionary/alpha/')));
write('src/data/finyaar-dictionary-metadata.json', '{"changed":true}');
commit('2025-04-01T00:00:00Z');
resolveDate = createSitemapLastmod({ root });
assert.equal(resolveDate(url('/dictionary/alpha/')), '2025-04-01T00:00:00.000Z');
assert.equal(resolveDate(url('/about/')), '2025-01-01T00:00:00.000Z');
write('src/data/content-dates.json', JSON.stringify({ '/dictionary/alpha/': { dateModified: '2025-04-01T00:00:00Z' } }));
write('.git/shallow', git('rev-parse', 'HEAD').trim() + '\n');
assert.equal(createSitemapLastmod({ root })(url('/dictionary/alpha/')), '2025-04-01T00:00:00.000Z');
assert.throws(() => createSitemapLastmod({ root })(url('/about/')), /No content change date/);
const xml = readFileSync('dist/sitemap.xml', 'utf8');
const actual = createSitemapLastmod();
// Verify every emitted URL also builds with the checked-in dates in a shallow clone.
const editorialDates = JSON.parse(readFileSync('src/data/content-dates.json', 'utf8'));
write('src/data/content-dates.json', JSON.stringify(editorialDates));
const shallowDate = createSitemapLastmod({ root });
let count = 0;
for (const match of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
  const loc = match[1].match(/<loc>(.*?)<\/loc>/)[1];
  const lastmod = match[1].match(/<lastmod>(.*?)<\/lastmod>/)[1];
  assert.equal(lastmod, actual(loc), loc);
  assert.equal(shallowDate(loc), new Date(editorialDates[new URL(loc).pathname].dateModified).toISOString(), `Shallow-history fallback: ${loc}`);
  count++;
}
assert.ok(count > 0);
console.log(`PASS: independent lesson dates, metadata changes, unrelated changes, rebuild stability, shallow-history fallback, and ${count} sitemap dates.`);

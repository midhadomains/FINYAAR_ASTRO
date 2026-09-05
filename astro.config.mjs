// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';
import { createSitemapLastmod } from './scripts/sitemap-lastmod.mjs';

// https://astro.build/config
const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const { SITE_URL } = loadEnv(mode, process.cwd(), '');
const getLastmod = createSitemapLastmod();

export default defineConfig({
  site: SITE_URL || 'https://www.finyaar.com',
  integrations: [sitemap({
    filter: (page) => !page.includes('/internal/'),
    serialize: (item) => ({ ...item, lastmod: getLastmod(item.url) }),
  })],
  vite: {
    plugins: [tailwindcss()]
  }
});

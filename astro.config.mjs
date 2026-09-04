// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';

// https://astro.build/config
const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const { SITE_URL } = loadEnv(mode, process.cwd(), '');

export default defineConfig({
  site: SITE_URL || 'https://www.finyaar.com',
  integrations: [sitemap({ filter: (page) => !page.includes('/internal/') })],
  vite: {
    plugins: [tailwindcss()]
  }
});

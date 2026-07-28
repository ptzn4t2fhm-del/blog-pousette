// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// À remplacer si un nom de domaine personnalisé est acheté plus tard
const SITE_URL = 'https://blog-pousette.vercel.app';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  integrations: [sitemap()],
});

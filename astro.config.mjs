// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// IMPORTANT: remplacer par le vrai domaine une fois acheté
const SITE_URL = 'https://votre-domaine.fr';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  integrations: [sitemap()],
});

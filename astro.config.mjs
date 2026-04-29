import { defineConfig } from 'astro/config';
import { rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

// Pages that exist for local PDF generation only and should not ship in production builds.
const DEV_ONLY_ROUTES = ['cover-letter'];

export default defineConfig({
  site: 'https://lauranaccarato.com',
  integrations: [
    {
      name: 'exclude-dev-only-routes',
      hooks: {
        'astro:build:done': ({ dir }) => {
          const distDir = fileURLToPath(dir);
          for (const route of DEV_ONLY_ROUTES) {
            rmSync(join(distDir, route), { recursive: true, force: true });
            rmSync(join(distDir, `${route}.html`), { force: true });
          }
        },
      },
    },
  ],
});

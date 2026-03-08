import { existsSync } from 'node:fs';
import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: '.env', quiet: true, override: true });

const authFile = 'playwright/.auth/user.json';

export default defineConfig({
  retries: 1,
  use: {
    storageState: existsSync(authFile) ? authFile : undefined,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});

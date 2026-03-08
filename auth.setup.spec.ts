import { mkdir } from 'node:fs/promises';
import { test, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

test('authenticate and save session state', async ({ page, context }) => {
  test.setTimeout(300_000);

  await page.goto('https://cloud.consigno.com/login');

  const email = process.env.EMAIL?.trim();
  const emailInput = page.getByRole('textbox', { name: 'Email address' });
  const newProjectButton = page.getByRole('button', { name: /New project|Nouveau projet/i });

  if (email) {
    await emailInput.fill(email);
  }

  console.log('Complete the login manually in the opened browser window. The session will be saved once the dashboard appears.');

  await expect(newProjectButton).toBeVisible({ timeout: 300_000 });

  await mkdir('playwright/.auth', { recursive: true });
  await context.storageState({ path: authFile });
});

import { test, expect } from '@playwright/test';

test.describe('ConsignO Cloud – critical signature workflow', () => {
  test('Create and configure signature project', async ({ page }) => {
    test.setTimeout(180_000);

    const email = process.env.EMAIL?.trim();
    const password = process.env.PASSWORD?.trim();
    const contactPattern = new RegExp(email?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') ?? '', 'i');

    if (!email || !password) {
      throw new Error('Missing EMAIL or PASSWORD in environment variables.');
    }

    if (/^your\.email@example\.com$/i.test(email)) {
      throw new Error('EMAIL is still set to the placeholder value in .env. Update .env and rerun the test.');
    }

    const newProjectButton = page.getByRole('button', { name: /New project|Nouveau projet/i });
    const signInButton = page.getByRole('button', { name: /Sign in|Se connecter/i });
    const projectName = `Playwright Project ${Date.now()}`;
    const waitForLandingPage = async () =>
      Promise.race([
        newProjectButton.waitFor({ state: 'visible', timeout: 15_000 }).then(() => 'dashboard' as const),
        signInButton.waitFor({ state: 'visible', timeout: 15_000 }).then(() => 'login' as const),
      ]).catch(() => 'timeout' as const);

    const pickContact = async (which: 'first' | 'last') => {
      const contact = page.getByText(contactPattern)[which]();
      await contact.click();
    };

    const loginIfNeeded = async () => {
      const state = await waitForLandingPage();
      if (state === 'dashboard') {
        return;
      }

      if (state === 'timeout') {
        throw new Error('Initial page did not reach either the login form or dashboard within 15s.');
      }

      const emailInput = page.getByRole('textbox', { name: 'Email address' });
      const passwordInput = page.locator('input[type="password"]');
      const loginError = page.getByText(/Wrong credentials|Identifiants invalides/i);
      const rateLimitError = page.getByText(/Too many connection attempts|Please try again in an hour/i);

      await expect(signInButton).toBeVisible();
      await emailInput.fill(email);
      await passwordInput.fill(password);

      await Promise.all([
        page.waitForLoadState('networkidle').catch(() => undefined),
        signInButton.click(),
      ]);

      const postLoginState = await Promise.race([
        newProjectButton.waitFor({ state: 'visible', timeout: 15_000 }).then(() => 'dashboard' as const),
        loginError.waitFor({ state: 'visible', timeout: 15_000 }).then(() => 'invalid_credentials' as const),
        rateLimitError.waitFor({ state: 'visible', timeout: 15_000 }).then(() => 'rate_limited' as const),
      ]).catch(() => 'timeout' as const);

      if (postLoginState === 'dashboard') {
        return;
      }

      if (postLoginState === 'invalid_credentials') {
        throw new Error('Login failed: ConsignO Cloud returned "Wrong credentials". Check EMAIL and PASSWORD in .env or create a saved session with `npm run auth`.');
      }

      if (postLoginState === 'rate_limited') {
        throw new Error('Login blocked: ConsignO Cloud returned "Too many connection attempts. Please try again in an hour." Wait for the lockout window to expire before retrying or use a saved session with `npm run auth`.');
      }

      throw new Error('Login did not reach the dashboard within 15s. Check whether the account needs MFA, a tenant selection step, updated selectors, or use a saved session with `npm run auth`.');
    };

    // Open login page. When storageState is present, the app should redirect to the dashboard.
    await page.goto('https://cloud.consigno.com/login');
    await loginIfNeeded();

    await expect(newProjectButton).toBeVisible();
    const closeBlockingOverlay = async () => {
      const overlay = page.locator('.fancybox-overlay.fancybox-overlay-fixed');
      if (await overlay.isVisible().catch(() => false)) {
        await page.keyboard.press('Escape');
        await overlay.waitFor({ state: 'hidden', timeout: 5_000 }).catch(async () => {
          const closeAction = page.getByRole('link', { name: /Close|Cancel/i }).first();
          if (await closeAction.isVisible().catch(() => false)) {
            await closeAction.click();
          }
        });
      }
    };

    // Open project editor.
    const projectNameInput = page.getByRole('textbox', { name: 'Project name' });
    await newProjectButton.click();
    await closeBlockingOverlay();
    const editorOpened = await projectNameInput.isVisible().catch(() => false);
    if (!editorOpened) {
      await page.goto('https://cloud.consigno.com/#/workflow/create');
    }
    await expect(projectNameInput).toBeVisible({ timeout: 20_000 });

    await projectNameInput.fill(projectName);

    // Keep the default expiration date to avoid date-picker overlay flakiness.

    // Upload document
    await page.setInputFiles('input[type="file"]', 'tests/financial_inventory_report-8.pdf');

    await expect(page.getByRole('button', { name: 'Signers', exact: true })).toBeVisible();

    // Add signer
    await page.getByRole('button', { name: 'Signers', exact: true }).click();
    await pickContact('first');
    await page.getByRole('button', { name: 'Add', exact: true }).click();

    // Add text field
    await page.getByRole('button', { name: 'Text field', exact: true }).click();
    await page.getByRole('textbox', { name: 'Label' }).fill('Approval note');
    await page.getByRole('button', { name: 'Assign owner' }).click();
    await pickContact('last');
    await page.getByRole('button', { name: 'Assign' }).click();

    // Set signing order
    await page.getByRole('button', { name: 'Set the order' }).click();
    await page.getByRole('link', { name: 'Apply' }).click();

    // Launch project
    await page.getByRole('button', { name: /Launch|Launch and Sign/i }).click();
    await page.getByRole('link', { name: 'Close' }).click();

    // Save project
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(projectNameInput).toHaveValue(projectName);

    // Log out to end the flow in a clean state.
    await page.locator('#user_menu').click();
    await page.locator('#user-menu-logout').click();
    await expect(page.getByRole('button', { name: /Sign in|Se connecter/i })).toBeVisible({ timeout: 20_000 });

  });
});

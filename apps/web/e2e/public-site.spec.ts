import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const PUBLIC_PAGES = [
  { path: '/', heading: /keep track of what matters/i },
  { path: '/features', heading: /features/i },
  { path: '/how-it-works', heading: /how it works/i },
  { path: '/pricing', heading: /pricing/i },
  { path: '/privacy', heading: /privacy/i },
  { path: '/faq', heading: /questions/i },
] as const;

test.describe('a visitor browsing the public website without an account', () => {
  for (const { path, heading } of PUBLIC_PAGES) {
    test(`${path} shows its page and passes WCAG 2.2 AA checks`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }

  test('reaches every public page from the navigation', async ({ page }) => {
    await page.goto('/');
    for (const name of ['Features', 'How it works', 'Pricing', 'Privacy', 'FAQ']) {
      await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name }).click();
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    }
  });

  test('has no horizontal scrolling at any screen size', async ({ page }) => {
    await page.goto('/');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('shows placeholder screenshots of the app', async ({ page }) => {
    await page.goto('/features');
    await expect(page.getByRole('img', { name: /placeholder screenshot/i }).first()).toBeVisible();
  });

  test('is sent to sign up when choosing to get started', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Get started' }).first().click();
    await expect(page).toHaveURL(/\/sign-up$/);
  });

  test('is sent to sign in when trying to open the app', async ({ page }) => {
    await page.goto('/app');
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('sets no cookies', async ({ page, context }) => {
    await page.goto('/');
    expect(await context.cookies()).toEqual([]);
  });
});

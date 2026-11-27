import { expect, test, type Page } from '@playwright/test';
import { expectNoAccessibilityViolations } from './support/accessibility';
import { signUpAndEnterApp } from './support/session';

const PRECISION = 'How well do you know this date?';

async function startNewVehicle(page: Page, name: string): Promise<void> {
  await page.getByRole('link', { name: 'Assets & Possessions' }).click();
  await page.getByRole('link', { name: 'Add a vehicle' }).click();
  await page.getByLabel('Name').fill(name);
}

test.describe('Key dates', () => {
  test('a user gives one date as a month and marks another missing, then finds both on their attention list', async ({
    page,
  }) => {
    await signUpAndEnterApp(page);
    await startNewVehicle(page, 'Family car');

    await page.getByLabel(PRECISION).nth(0).selectOption('month');
    await page.getByLabel('Registration expires').fill('2027-06');
    await expect(page.getByText(/sometime in June 2027/)).toBeVisible();
    await page.getByLabel(PRECISION).nth(1).selectOption('missing');
    await expect(page.getByText('date missing', { exact: true })).toBeVisible();
    await expectNoAccessibilityViolations(page);
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Family car');
    await expect(page.getByRole('heading', { name: 'Important dates' })).toBeVisible();
    await expect(page.getByText('June 2027', { exact: true })).toBeVisible();
    await expectNoAccessibilityViolations(page);

    await page.goto('/app');
    await expect(page.getByRole('heading', { name: 'Needs your attention' })).toBeVisible();
    await expect(page.getByText('Next inspection due is missing.')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Add it' })).toBeVisible();
    await expectNoAccessibilityViolations(page);
  });

  test('a user sees a date that looks like a typo before it is saved, and chooses what to do', async ({
    page,
  }) => {
    await signUpAndEnterApp(page);
    await startNewVehicle(page, 'Old banger');

    await page.getByLabel('Registration expires').fill('2205-06-30');
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    await expect(page.getByRole('alert').filter({ hasText: 'look like a typo' })).toContainText(
      'Registration expires is a very long way off.',
    );
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('New vehicle');
    await expectNoAccessibilityViolations(page);

    await page.getByLabel('Registration expires').fill('2027-06-30');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Old banger');
    await expect(page.getByText('Jun 30, 2027')).toBeVisible();
  });

  test('a user who knows a date looks wrong can save it as given', async ({ page }) => {
    await signUpAndEnterApp(page);
    await startNewVehicle(page, 'Vintage car');

    await page.getByLabel('Registration expires').fill('2205-06-30');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await page.getByRole('button', { name: 'Save as given' }).click();

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Vintage car');
    await expect(page.getByText('Jun 30, 2205')).toBeVisible();
  });
});

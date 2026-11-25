import { expect, test, type Page } from '@playwright/test';
import { expectNoAccessibilityViolations } from './support/accessibility';
import { signUpAndEnterApp } from './support/session';

/** The record page's history, as the user reads it. */
function historyOf(page: Page) {
  return page.getByRole('list', { name: 'History' }).getByRole('listitem');
}

test.describe('a vehicle in Assets & Possessions', () => {
  test('a user adds their car, finds it in Assets, edits it and archives it', async ({ page }) => {
    await signUpAndEnterApp(page);

    await page.getByRole('link', { name: 'Assets & Possessions' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Assets & Possessions');
    await expect(page.getByText('Nothing here yet.')).toBeVisible();
    await expectNoAccessibilityViolations(page);

    await page.getByRole('link', { name: 'Add a vehicle' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('New vehicle');
    await expectNoAccessibilityViolations(page);
    await page.getByLabel('Name').fill('Family car');
    await page.getByLabel('Make').fill('Toyota');
    await page.getByLabel('Model').fill('Corolla');
    await page.getByLabel('Year').fill('2019');
    await page.getByLabel('Registration expires').fill('2027-06-30');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Family car');
    await expect(page.getByText('Vehicle · Owned')).toBeVisible();
    await expect(page.getByText('Corolla')).toBeVisible();
    await expect(page.getByText('Jun 30, 2027')).toBeVisible();
    await expect(historyOf(page)).toHaveText([/Created by you/]);
    await expectNoAccessibilityViolations(page);

    await page.getByRole('link', { name: 'Edit' }).click();
    await expect(page.getByLabel('Model')).toHaveValue('Corolla');
    await page.getByLabel('Model').fill('Yaris');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Yaris')).toBeVisible();
    await expect(historyOf(page)).toHaveText([/Created by you/, /Edited by you/]);

    await page.getByRole('link', { name: 'Assets & Possessions' }).click();
    await expect(page.getByRole('link', { name: 'Family car' })).toBeVisible();
    await page.getByRole('link', { name: 'Family car' }).click();

    await page.getByRole('button', { name: 'Archive' }).click();
    await expect(page.getByText('Archived', { exact: true })).toBeVisible();
    await expect(historyOf(page)).toHaveText([/Created/, /Edited/, /Archived by you/]);
    await expectNoAccessibilityViolations(page);

    await page.getByRole('link', { name: 'Assets & Possessions' }).click();
    await expect(page.getByText('Nothing here yet.')).toBeVisible();
    await page.getByRole('link', { name: 'Show archived' }).click();
    await expect(page.getByRole('link', { name: 'Family car' })).toBeVisible();
    await expectNoAccessibilityViolations(page);
  });

  test('a user is told plainly when a field holds something it cannot', async ({ page }) => {
    await signUpAndEnterApp(page);
    await page.getByRole('link', { name: 'Assets & Possessions' }).click();
    await page.getByRole('link', { name: 'Add a vehicle' }).click();

    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Give it a name.')).toBeVisible();
    await expect(page.getByLabel('Name')).toHaveAttribute('aria-invalid', 'true');
  });
});

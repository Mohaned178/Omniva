import { expect, test, type Page } from '@playwright/test';
import { expectNoAccessibilityViolations } from './support/accessibility';
import { signUpAndEnterApp } from './support/session';

const DAY_MS = 24 * 60 * 60 * 1000;
/** The worker checks every second here, and email goes out in real time. */
const REMINDER_TIMEOUT_MS = 30_000;

/** A day this many days from today, as a date input takes it. */
function dayFromToday(days: number): string {
  return new Date(Date.now() + days * DAY_MS).toISOString().slice(0, 10);
}

async function addVehicle(page: Page, name: string, registrationExpiresOn: string): Promise<void> {
  await page.getByRole('link', { name: 'Assets & Possessions' }).click();
  await page.getByRole('link', { name: 'Add a vehicle' }).click();
  await page.getByLabel('Name').fill(name);
  await page.getByLabel('Registration expires').fill(registrationExpiresOn);
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(name);
}

test.describe('Reminders', () => {
  test('a user sees the reminder Omniva will set for each date, changes it, and finds it on the record', async ({
    page,
  }) => {
    await signUpAndEnterApp(page);
    await page.getByRole('link', { name: 'Assets & Possessions' }).click();
    await page.getByRole('link', { name: 'Add a vehicle' }).click();
    await page.getByLabel('Name').fill('Family car');
    await page.getByLabel('Registration expires').fill(dayFromToday(90));

    const reminders = page.getByLabel('Remind me');
    await expect(reminders.nth(0)).toHaveValue('30');
    await expect(reminders.nth(1)).toHaveValue('30');
    await reminders.nth(0).selectOption({ label: '7 days before' });
    await reminders.nth(1).selectOption({ label: 'No reminder' });
    await expectNoAccessibilityViolations(page);
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Family car');
    await expect(page.getByText('Reminder: 7 days before')).toBeVisible();
    await expectNoAccessibilityViolations(page);
  });

  test('a user sees a reminder on their attention list, marks one handled and snoozes another', async ({
    page,
  }) => {
    await signUpAndEnterApp(page);
    // Both reminders, 30 days before by default, are due at once: the first is urgent.
    await addVehicle(page, 'Runabout', dayFromToday(3));
    await addVehicle(page, 'Tourer', dayFromToday(20));

    await page.goto('/app');
    const runabout = page.getByRole('listitem').filter({ hasText: 'Runabout' });
    const tourer = page.getByRole('listitem').filter({ hasText: 'Tourer' });
    await expect(async () => {
      await page.reload();
      await expect(runabout.getByText('Reminder sent by email')).toBeVisible({ timeout: 1000 });
      await expect(tourer.getByText('Reminder', { exact: true })).toBeVisible({ timeout: 1000 });
    }).toPass({ timeout: REMINDER_TIMEOUT_MS });
    await expectNoAccessibilityViolations(page);

    await runabout.getByRole('button', { name: 'Handled' }).click();
    await expect(runabout).toBeHidden();
    await tourer.getByRole('button', { name: 'Snooze for a week' }).click();
    await expect(tourer).toBeHidden();
    await expect(page.getByText('Nothing needs your attention right now.')).toBeVisible();
  });
});

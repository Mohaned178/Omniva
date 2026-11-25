import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';
import { expectNoAccessibilityViolations } from './support/accessibility';
import { verificationLinkFor } from './support/mail';

const PASSWORD = 'correct horse battery staple';

test.describe('signing up', () => {
  test('a visitor signs up, verifies their email and lands in the app, then signs out and back in', async ({
    page,
  }) => {
    const email = `${randomUUID()}@example.test`;

    await page.goto('/sign-up');
    await expectNoAccessibilityViolations(page);
    await page.getByLabel('Email address').fill(email);
    await page.getByLabel('Password').fill(PASSWORD);
    await page.getByRole('button', { name: 'Sign up' }).click();

    await expect(page.getByRole('heading', { name: 'Check your email' })).toBeVisible();
    await expectNoAccessibilityViolations(page);

    await page.goto(await verificationLinkFor(email));
    await expect(page).toHaveURL(/\/app$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('You’re signed in');
    await expect(page.getByText(email)).toBeVisible();
    await expectNoAccessibilityViolations(page);

    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect(page).toHaveURL(/\/sign-in$/);
    await page.goto('/app');
    await expect(page).toHaveURL(/\/sign-in$/);

    await page.getByLabel('Email address').fill(email);
    await page.getByLabel('Password').fill(PASSWORD);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/\/app$/);
  });

  test('a visitor is told plainly when the email address or password is wrong', async ({
    page,
  }) => {
    await page.goto('/sign-in');
    await page.getByLabel('Email address').fill(`${randomUUID()}@example.test`);
    await page.getByLabel('Password').fill(PASSWORD);
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Next.js keeps an empty route announcer with the alert role, so match by the message.
    await expect(
      page.getByRole('alert').filter({
        hasText: 'That email address and password don’t match. Check them and try again.',
      }),
    ).toBeVisible();
    await expectNoAccessibilityViolations(page);
  });

  test('a visitor is told when the password is too short, before anything is sent', async ({
    page,
  }) => {
    await page.goto('/sign-up');
    await page.getByLabel('Email address').fill(`${randomUUID()}@example.test`);
    await page.getByLabel('Password').fill('short');
    await page.getByRole('button', { name: 'Sign up' }).click();

    await expect(page.getByText('Use at least 10 characters.')).toBeVisible();
    await expect(page.getByLabel('Password')).toHaveAttribute('aria-invalid', 'true');
  });
});

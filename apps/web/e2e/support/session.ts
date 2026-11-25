import { randomUUID } from 'node:crypto';
import { expect, type Page } from '@playwright/test';
import { verificationLinkFor } from './mail';

export const PASSWORD = 'correct horse battery staple';

/** Signs a new visitor up, verifies their email and lands them in the app; returns the address. */
export async function signUpAndEnterApp(page: Page): Promise<string> {
  const email = `${randomUUID()}@example.test`;
  await page.goto('/sign-up');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign up' }).click();
  await expect(page.getByRole('heading', { name: 'Check your email' })).toBeVisible();
  await page.goto(await verificationLinkFor(email));
  await expect(page).toHaveURL(/\/app$/);
  return email;
}

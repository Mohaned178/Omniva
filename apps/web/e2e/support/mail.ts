import { expect } from '@playwright/test';

/** Mailpit catches the email Omniva sends; it matches docker-compose.yml and CI. */
const MAILPIT_API_URL = process.env.TEST_MAILPIT_API_URL ?? 'http://localhost:58025';

interface MailpitMessageList {
  readonly messages: readonly { readonly ID: string }[];
}

/** Waits for the verification email to the address and returns the link inside it. */
export async function verificationLinkFor(email: string): Promise<string> {
  const query = new URLSearchParams({ query: `to:"${email}"` });
  let messageId: string | undefined;
  await expect
    .poll(
      async () => {
        const response = await fetch(`${MAILPIT_API_URL}/api/v1/search?${query.toString()}`);
        const list = (await response.json()) as MailpitMessageList;
        messageId = list.messages[0]?.ID;
        return messageId;
      },
      { timeout: 15_000 },
    )
    .toBeDefined();

  const response = await fetch(`${MAILPIT_API_URL}/api/v1/message/${messageId ?? ''}`);
  const { Text } = (await response.json()) as { readonly Text: string };
  const link = /https?:\/\/\S+\/verify-email\?token=\S+/.exec(Text)?.[0];
  if (!link) throw new Error('The verification email has no link');
  return link;
}

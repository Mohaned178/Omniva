import { setTimeout as sleep } from 'node:timers/promises';
import { MAILPIT_API_URL } from './test-environment.js';

export interface CaughtMessage {
  readonly subject: string;
  readonly to: readonly string[];
}

export interface CaughtMessageWithBody extends CaughtMessage {
  readonly text: string;
}

interface MailpitSummary {
  readonly ID: string;
  readonly Subject: string;
  readonly To: readonly { readonly Address: string }[];
}

interface MailpitMessageList {
  readonly messages: readonly MailpitSummary[];
}

interface MailpitMessage {
  readonly Subject: string;
  readonly To: readonly { readonly Address: string }[];
  readonly Text: string;
}

/** Email goes out from the worker, so a test waits for it in wall-clock time. */
const DEFAULT_WAIT_MS = 15_000;
const POLL_INTERVAL_MS = 200;

/** Reads the email Omniva sent, as captured by Mailpit. */
export class MailCatcher {
  async clear(): Promise<void> {
    await this.request('DELETE', '/api/v1/messages');
  }

  async messages(): Promise<readonly CaughtMessage[]> {
    const list = (await (
      await this.request('GET', '/api/v1/messages')
    ).json()) as MailpitMessageList;
    return list.messages.map(toCaughtMessage);
  }

  /** Every message sent to the address so far, newest first. */
  async messagesTo(address: string): Promise<readonly CaughtMessage[]> {
    const query = new URLSearchParams({ query: `to:"${address}"` });
    const list = (await (
      await this.request('GET', `/api/v1/search?${query.toString()}`)
    ).json()) as MailpitMessageList;
    return list.messages.map(toCaughtMessage);
  }

  /** Waits until a message to the address arrives, then returns the newest one in full. */
  async waitForMessageTo(
    address: string,
    timeoutMs = DEFAULT_WAIT_MS,
  ): Promise<CaughtMessageWithBody> {
    const query = new URLSearchParams({ query: `to:"${address}"` });
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const list = (await (
        await this.request('GET', `/api/v1/search?${query.toString()}`)
      ).json()) as MailpitMessageList;
      const [newest] = list.messages;
      if (newest) return this.message(newest.ID);
      await sleep(POLL_INTERVAL_MS);
    }
    throw new Error(`No email reached ${address} within ${String(timeoutMs)} ms`);
  }

  private async message(id: string): Promise<CaughtMessageWithBody> {
    const message = (await (
      await this.request('GET', `/api/v1/message/${id}`)
    ).json()) as MailpitMessage;
    return { ...toCaughtMessage(message), text: message.Text };
  }

  private async request(method: 'GET' | 'DELETE', path: string): Promise<Response> {
    const response = await fetch(`${MAILPIT_API_URL}${path}`, { method });
    if (!response.ok) throw new Error(`Mailpit ${method} failed with ${String(response.status)}`);
    return response;
  }
}

function toCaughtMessage(message: Pick<MailpitSummary, 'Subject' | 'To'>): CaughtMessage {
  return {
    subject: message.Subject,
    to: message.To.map((recipient) => recipient.Address),
  };
}

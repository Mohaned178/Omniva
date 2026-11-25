import { MAILPIT_API_URL } from './test-environment.js';

export interface CaughtMessage {
  readonly subject: string;
  readonly to: readonly string[];
}

interface MailpitMessageList {
  readonly messages: readonly {
    readonly Subject: string;
    readonly To: readonly { readonly Address: string }[];
  }[];
}

/** Reads the email Omniva sent, as captured by Mailpit. */
export class MailCatcher {
  async clear(): Promise<void> {
    await this.request('DELETE');
  }

  async messages(): Promise<readonly CaughtMessage[]> {
    const response = await this.request('GET');
    const list = (await response.json()) as MailpitMessageList;
    return list.messages.map((message) => ({
      subject: message.Subject,
      to: message.To.map((recipient) => recipient.Address),
    }));
  }

  private async request(method: 'GET' | 'DELETE'): Promise<Response> {
    const response = await fetch(`${MAILPIT_API_URL}/api/v1/messages`, { method });
    if (!response.ok) throw new Error(`Mailpit ${method} failed with ${String(response.status)}`);
    return response;
  }
}

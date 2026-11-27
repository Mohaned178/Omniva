import type { AppConfig } from '../../../src/platform/config/app-config.js';
import { EmailSender, type EmailMessage } from '../../../src/platform/email/email-sender.js';
import { SmtpEmailSender } from '../../../src/platform/email/smtp-email-sender.js';

/** A send the test is holding open, as if the mail server were slow to answer. */
export interface HeldSend {
  /** Resolves once the worker is in the middle of the send. */
  readonly reached: Promise<void>;
  /** Lets the message through to the mail server. */
  deliver(): void;
  /** Ends the send without the mail server ever accepting the message. */
  fail(): void;
}

type Step =
  | { readonly kind: 'fail' }
  | {
      readonly kind: 'hold';
      readonly markReached: () => void;
      readonly outcome: Promise<'deliver' | 'fail'>;
    };

/**
 * Sends email to Mailpit like the real sender, except where a test has scripted a fault for
 * the next message to an address: the mail provider refusing it, or a send left hanging.
 */
export class ScriptedEmailSender extends EmailSender {
  private readonly real: SmtpEmailSender;
  private readonly steps = new Map<string, Step[]>();
  private readonly attempts = new Map<string, readonly string[]>();

  constructor(config: AppConfig) {
    super();
    this.real = new SmtpEmailSender(config);
  }

  /** The next message to the address fails, as a mail provider's error would. */
  failNextSendTo(address: string): void {
    this.script(address, { kind: 'fail' });
  }

  /** The next message to the address waits, mid-send, until the test lets it go or fail. */
  holdNextSendTo(address: string): HeldSend {
    let markReached = (): void => undefined;
    let settle = (_outcome: 'deliver' | 'fail'): void => undefined;
    const reached = new Promise<void>((resolve) => {
      markReached = resolve;
    });
    const outcome = new Promise<'deliver' | 'fail'>((resolve) => {
      settle = resolve;
    });
    this.script(address, { kind: 'hold', markReached, outcome });
    return {
      reached,
      deliver: () => {
        settle('deliver');
      },
      fail: () => {
        settle('fail');
      },
    };
  }

  /** The subject of every attempt to send to the address, in order, failed ones included. */
  attemptsTo(address: string): readonly string[] {
    return this.attempts.get(address) ?? [];
  }

  async send(message: EmailMessage): Promise<void> {
    this.attempts.set(message.to, [...this.attemptsTo(message.to), message.subject]);
    const step = this.steps.get(message.to)?.shift();
    if (step === undefined) return this.real.send(message);
    if (step.kind === 'fail') throw new Error('The mail provider refused the message');
    step.markReached();
    if ((await step.outcome) === 'fail') {
      throw new Error('The connection closed before the mail server accepted the message');
    }
    return this.real.send(message);
  }

  private script(address: string, step: Step): void {
    this.steps.set(address, [...(this.steps.get(address) ?? []), step]);
  }
}

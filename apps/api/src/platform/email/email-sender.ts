export interface EmailMessage {
  readonly to: string;
  readonly subject: string;
  readonly text: string;
  /**
   * Identifies the message itself, the same on every attempt to send it, so a mail system that
   * receives it twice can tell it is one message (the Message-ID header).
   */
  readonly messageId?: string;
}

/**
 * Sends one email. Mailpit catches it locally and in tests; Mailgun delivers it in deployed
 * environments (spec, Operations). Also the DI token.
 */
export abstract class EmailSender {
  abstract send(message: EmailMessage): Promise<void>;
}

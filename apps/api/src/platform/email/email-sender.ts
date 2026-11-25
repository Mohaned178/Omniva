export interface EmailMessage {
  readonly to: string;
  readonly subject: string;
  readonly text: string;
}

/**
 * Sends one email. Mailpit catches it locally and in tests; Mailgun delivers it in deployed
 * environments (spec, Operations). Also the DI token.
 */
export abstract class EmailSender {
  abstract send(message: EmailMessage): Promise<void>;
}

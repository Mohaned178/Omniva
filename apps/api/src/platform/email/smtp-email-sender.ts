import { Injectable, type OnModuleDestroy } from '@nestjs/common';
import { createTransport, type Transporter } from 'nodemailer';
import { AppConfig } from '../config/app-config.js';
import { EmailSender, type EmailMessage } from './email-sender.js';

/**
 * How long a send may wait on the mail server. A reminder is sent inside the transaction that
 * records it (ADR 0012), so a send must end, in success or failure, well before that
 * transaction's own time limit.
 */
const CONNECTION_TIMEOUT_MS = 10_000;
const GREETING_TIMEOUT_MS = 10_000;
const SOCKET_TIMEOUT_MS = 20_000;

/** Sends email over SMTP, which is how Mailpit receives it. */
@Injectable()
export class SmtpEmailSender extends EmailSender implements OnModuleDestroy {
  private readonly transport: Transporter;

  constructor(private readonly config: AppConfig) {
    super();
    this.transport = createTransport({
      url: config.smtpUrl,
      connectionTimeout: CONNECTION_TIMEOUT_MS,
      greetingTimeout: GREETING_TIMEOUT_MS,
      socketTimeout: SOCKET_TIMEOUT_MS,
    });
  }

  async send(message: EmailMessage): Promise<void> {
    await this.transport.sendMail({ from: this.config.mailFrom, ...message });
  }

  onModuleDestroy(): void {
    this.transport.close();
  }
}

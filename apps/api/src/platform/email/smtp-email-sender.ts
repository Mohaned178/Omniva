import { Injectable, type OnModuleDestroy } from '@nestjs/common';
import { createTransport, type Transporter } from 'nodemailer';
import { AppConfig } from '../config/app-config.js';
import { EmailSender, type EmailMessage } from './email-sender.js';

/** Sends email over SMTP, which is how Mailpit receives it. */
@Injectable()
export class SmtpEmailSender extends EmailSender implements OnModuleDestroy {
  private readonly transport: Transporter;

  constructor(private readonly config: AppConfig) {
    super();
    this.transport = createTransport(config.smtpUrl);
  }

  async send(message: EmailMessage): Promise<void> {
    await this.transport.sendMail({ from: this.config.mailFrom, ...message });
  }

  onModuleDestroy(): void {
    this.transport.close();
  }
}

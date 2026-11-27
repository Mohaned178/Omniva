import { createHash } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { isoDayOf, type DatedKeyDate } from '@omniva/domain-rules';
import { UserEmailAddresses } from '../identity/user-email-addresses.js';
import { AppConfig } from '../platform/config/app-config.js';
import { EmailSender } from '../platform/email/email-sender.js';
import { WorkspaceMembers } from '../workspaces/workspace-members.js';
import { reminderEmail } from './reminder-email.js';

/** The web app's page for a record, which the email links to. */
const RECORD_PAGE_PATH = '/app/records/';
const MESSAGE_ID_HASH_LENGTH = 32;

/** One urgent reminder to send: which due notice it is, and what its email says. */
export interface UrgentReminder {
  readonly recordId: string;
  readonly fieldKey: string;
  readonly daysBefore: number;
  readonly recordTitle: string;
  readonly keyDate: DatedKeyDate;
  readonly daysLeft: number;
}

/** Emails urgent reminders to the members of the workspace they belong to. */
@Injectable()
export class ReminderEmails {
  constructor(
    private readonly members: WorkspaceMembers,
    private readonly addresses: UserEmailAddresses,
    private readonly email: EmailSender,
    private readonly config: AppConfig,
  ) {}

  /** Where the workspace's reminders go: each member's verified address. */
  async recipientsOf(workspaceId: string): Promise<readonly string[]> {
    const addresses: string[] = [];
    for (const userId of await this.members.userIdsOf(workspaceId)) {
      const address = await this.addresses.addressOf(userId);
      if (address !== undefined) addresses.push(address);
    }
    return addresses;
  }

  /**
   * Sends the reminder to each recipient. The caller records the delivery in the same
   * transaction, so a failure here leaves it to be retried. A personal workspace has one
   * member; when shared workspaces come (stage 2), each member's email needs a delivery of its
   * own, or a failure for one would resend to the others.
   */
  async send(recipients: readonly string[], reminder: UrgentReminder): Promise<void> {
    const recordUrl = new URL(
      `${RECORD_PAGE_PATH}${encodeURIComponent(reminder.recordId)}`,
      this.config.webOrigin,
    ).toString();
    for (const to of recipients) {
      await this.email.send(
        reminderEmail({
          to,
          recordTitle: reminder.recordTitle,
          keyDate: reminder.keyDate,
          daysLeft: reminder.daysLeft,
          recordUrl,
          messageId: this.messageIdOf(reminder, to),
        }),
      );
    }
  }

  /**
   * Derived from the due notice's unique key, never from content, so every attempt at it
   * carries the same Message-ID.
   */
  private messageIdOf(reminder: UrgentReminder, to: string): string {
    const key = [
      reminder.recordId,
      reminder.fieldKey,
      isoDayOf(reminder.keyDate.day),
      String(reminder.daysBefore),
      to,
    ].join(':');
    const hash = createHash('sha256').update(key).digest('hex').slice(0, MESSAGE_ID_HASH_LENGTH);
    return `<reminder.${hash}@${new URL(this.config.webOrigin).hostname}>`;
  }
}

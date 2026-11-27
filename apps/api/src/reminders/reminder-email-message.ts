import { distanceInWords, type DatedKeyDate } from '@omniva/domain-rules';
import type { EmailMessage } from '../platform/email/email-sender.js';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

/** An urgent reminder, as its email tells it. */
export interface ReminderEmailContent {
  readonly to: string;
  readonly recordTitle: string;
  readonly keyDate: DatedKeyDate;
  /** Whole days from today to the date; a month-only date counts from its first day. */
  readonly daysLeft: number;
  /** The record's page in the web app. */
  readonly recordUrl: string;
  /** The same for every attempt at this reminder, so a mail system can spot a repeat. */
  readonly messageId: string;
}

/**
 * The email for an urgent reminder, in plain words (spec D46). Emails are English only for now,
 * as the verification email is; the web app's translations come to them with Arabic.
 */
export function reminderEmailMessage(content: ReminderEmailContent): EmailMessage {
  return {
    to: content.to,
    subject: `Reminder: ${content.recordTitle}`,
    text: [
      `${content.recordTitle} has an important date ${whenOf(content.keyDate, content.daysLeft)}.`,
      '',
      `See it in Omniva: ${content.recordUrl}`,
      '',
      'It stays on your list of what needs your attention until you mark it handled.',
    ].join('\n'),
    messageId: content.messageId,
  };
}

/** "in 5 days, on 6 March 2027", "today, 6 March 2027" or "sometime in March 2027". */
function whenOf({ precision, day }: DatedKeyDate, daysLeft: number): string {
  const month = MONTH_NAMES[day.month - 1] ?? String(day.month);
  if (precision === 'month') return `sometime in ${month} ${String(day.year)}`;
  const onDay = `${String(day.day)} ${month} ${String(day.year)}`;
  const distance = distanceInWords(daysLeft);
  if (distance.unit === 'today') return `today, ${onDay}`;
  const unit = distance.count === 1 ? distance.unit.slice(0, -1) : distance.unit;
  return `in ${String(distance.count)} ${unit}, on ${onDay}`;
}

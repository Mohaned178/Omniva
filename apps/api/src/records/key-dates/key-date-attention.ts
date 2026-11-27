import { Injectable } from '@nestjs/common';
import {
  ATTENTION_LOOKAHEAD_DAYS,
  ATTENTION_LOOKBACK_DAYS,
  calendarDateOf,
  dayNumberOf,
} from '@omniva/domain-rules';
import type { KeyDateAttentionList } from '@omniva/schemas';
import type { WorkspaceAccess } from '../../identity/workspace-access.js';
import { Clock } from '../../platform/clock/clock.js';
import { ScopedDatabase } from '../../platform/database/scoped-database.js';

const MILLISECONDS_PER_DAY = 86_400_000;
const ISO_DAY_LENGTH = 10;

/**
 * The attention list's Key dates (spec D44, D124): what is coming up and what is missing,
 * read only from the Key-date collection. Records that are archived are put away, so their
 * dates stay off the list.
 */
@Injectable()
export class KeyDateAttention {
  constructor(
    private readonly database: ScopedDatabase,
    private readonly clock: Clock,
  ) {}

  async list(access: WorkspaceAccess): Promise<KeyDateAttentionList> {
    const today = calendarDateOf(this.clock.now());
    const todayNumber = dayNumberOf(today);
    const dayStart = new Date(Date.UTC(today.year, today.month - 1, today.day));
    const from = new Date(dayStart.getTime() - ATTENTION_LOOKBACK_DAYS * MILLISECONDS_PER_DAY);
    const to = new Date(dayStart.getTime() + ATTENTION_LOOKAHEAD_DAYS * MILLISECONDS_PER_DAY);
    const keyDates = await this.database.$scopedTransaction(access, (transaction) =>
      transaction.keyDate.findMany({
        where: {
          workspaceId: access.workspaceId,
          record: { isArchived: false },
          OR: [{ precision: 'missing' }, { date: { gte: from, lte: to } }],
        },
        orderBy: [{ date: 'asc' }, { id: 'asc' }],
        select: {
          fieldKey: true,
          precision: true,
          date: true,
          record: { select: { id: true, title: true, typeKey: true } },
        },
      }),
    );

    const upcoming: KeyDateAttentionList['upcoming'][number][] = [];
    const missing: KeyDateAttentionList['missing'][number][] = [];
    for (const { fieldKey, precision, date, record } of keyDates) {
      const item = {
        recordId: record.id,
        recordTitle: record.title,
        typeKey: record.typeKey,
        fieldKey,
      };
      if (precision === 'missing' || date === null) {
        missing.push(item);
      } else {
        upcoming.push({
          ...item,
          precision,
          date: date.toISOString().slice(0, ISO_DAY_LENGTH),
          daysUntil: Math.round(date.getTime() / MILLISECONDS_PER_DAY) - todayNumber,
        });
      }
    }
    return { upcoming, missing };
  }
}

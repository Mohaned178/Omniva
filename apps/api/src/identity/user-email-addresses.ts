import { Injectable } from '@nestjs/common';
import { DatabaseClient } from '../platform/database/database-client.js';

/**
 * Where to email a user, for Omniva's own messages to them such as reminders. Users are
 * Identity's own table and belong to no workspace (ADR 0016).
 */
@Injectable()
export class UserEmailAddresses {
  constructor(private readonly database: DatabaseClient) {}

  /** The user's verified address; undefined when they are gone or have not verified it yet. */
  async addressOf(userId: string): Promise<string | undefined> {
    const user = await this.database.user.findUnique({
      where: { id: userId },
      select: { email: true, emailVerified: true },
    });
    return user?.emailVerified === true ? user.email : undefined;
  }
}

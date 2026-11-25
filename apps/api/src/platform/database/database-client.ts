import { Injectable, type OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';
import { AppConfig } from '../config/app-config.js';

/**
 * The role every connection switches to as it opens, created by the
 * `application_database_role` migration. It cannot bypass row-level security, so PostgreSQL
 * enforces workspace isolation on every query the application makes (ADR 0009).
 */
const APPLICATION_ROLE = 'omniva_app';

/** The Prisma client. It connects on first query, so nothing touches the database at import. */
@Injectable()
export class DatabaseClient extends PrismaClient implements OnModuleDestroy {
  constructor(config: AppConfig) {
    super({
      adapter: new PrismaPg({
        connectionString: config.databaseUrl,
        options: `-c role=${APPLICATION_ROLE}`,
      }),
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  /** Resolves when PostgreSQL answers a trivial query; rejects otherwise. */
  async ping(): Promise<void> {
    await this.$queryRaw`SELECT 1`;
  }
}

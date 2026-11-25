import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { Redis } from 'ioredis';
import { AppConfig } from '../config/app-config.js';

const CONNECT_TIMEOUT_MS = 1000;
const PING_TIMEOUT_MS = 1000;

/**
 * Redis (Valkey) for rate limits, session lookups and non-personal cache only (ADR 0020).
 * Redis is disposable: a failed connection is logged and retried, never fatal, and commands
 * fail fast instead of queueing while it is away.
 */
@Injectable()
export class RedisClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisClient.name);
  private readonly connection: Redis;

  constructor(config: AppConfig) {
    this.connection = new Redis(config.redisUrl, {
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      connectTimeout: CONNECT_TIMEOUT_MS,
    });
    this.connection.on('error', (error: Error) => {
      this.logger.warn(`Redis unavailable: ${error.message}`);
    });
  }

  onModuleInit(): void {
    this.connection.connect().catch(() => {
      // Reported through the 'error' event; ioredis keeps retrying in the background.
    });
  }

  onModuleDestroy(): void {
    this.connection.disconnect();
  }

  /** Resolves when Redis answers within a second; rejects otherwise. */
  async ping(): Promise<void> {
    await Promise.race([this.connection.ping(), rejectAfter(PING_TIMEOUT_MS)]);
  }
}

function rejectAfter(milliseconds: number): Promise<never> {
  return new Promise((_resolve, reject) => {
    setTimeout(() => {
      reject(new Error(`timed out after ${String(milliseconds)} ms`));
    }, milliseconds).unref();
  });
}

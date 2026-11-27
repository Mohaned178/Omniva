import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { setTimeout as sleep } from 'node:timers/promises';
import type { DynamicModule, INestApplication, Type } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { createApiClient, type ApiClient } from '@omniva/api-client';
import type { OpenAPIObject } from '@nestjs/swagger';
import { ApiModule } from '../../../src/api.module.js';
import { configureApi } from '../../../src/configure-api.js';
import { buildOpenApiDocument } from '../../../src/openapi/build-openapi-document.js';
import type { AppConfig } from '../../../src/platform/config/app-config.js';
import { Clock } from '../../../src/platform/clock/clock.js';
import { DatabaseClient } from '../../../src/platform/database/database-client.js';
import { EmailSender } from '../../../src/platform/email/email-sender.js';
import { JobQueue } from '../../../src/platform/jobs/job-queue.js';
import type { RecordChangeNotification } from '../../../src/records/change-notifications/record-change-notification.js';
import { RECORD_CHANGE_QUEUE } from '../../../src/records/change-notifications/record-change-queue.js';
import { ReminderDueCheck } from '../../../src/reminders/reminder-due-check.js';
import { ScopedDatabase } from '../../../src/platform/database/scoped-database.js';
import { WorkerModule } from '../../../src/worker.module.js';
import { ControllableClock } from './controllable-clock.js';
import { withDatabaseAdmin } from './database-admin.js';
import { MailCatcher } from './mail-catcher.js';
import { testConfig } from './test-environment.js';
import { Visitor } from './visitor.js';

const HARNESS_START = new Date('2027-03-01T09:00:00.000Z');
/** The worker passes change notifications on within a poll or two; this is far beyond that. */
const RECORD_CHANGES_TIMEOUT_MS = 15_000;
const RECORD_CHANGES_POLL_MS = 100;

export interface HarnessOptions {
  /** Environment overrides, for example pointing Redis at an address where nothing listens. */
  readonly environment?: Readonly<Record<string, string>>;
  /** Extra modules mounted in the API, such as test-only probe endpoints. */
  readonly apiModules?: readonly Type[];
  /** Extra modules mounted in the worker, such as test-only subscribers to record changes. */
  readonly workerModules?: readonly Type[];
  /** Sends the worker's email in place of the real sender, such as one that injects faults. */
  readonly workerEmailSender?: EmailSender;
}

/** A further worker process, as during a deploy when the old and new workers overlap. */
export interface AnotherWorker {
  remindersChecked(): Promise<void>;
  stop(): Promise<void>;
}

/**
 * Omniva running for real: the API on a free port and the worker, against real PostgreSQL
 * and Redis, sharing one controllable clock, with Mailpit catching outgoing email.
 */
export class OmnivaHarness {
  readonly mail = new MailCatcher();
  private worker: TestingModule | undefined;

  private constructor(
    readonly api: ApiClient,
    readonly clock: ControllableClock,
    private readonly config: AppConfig,
    private readonly apiApp: INestApplication,
    private readonly apiUrl: string,
    private readonly workerOptions: Pick<HarnessOptions, 'workerModules' | 'workerEmailSender'>,
  ) {}

  static async start(options: HarnessOptions = {}): Promise<OmnivaHarness> {
    const clock = new ControllableClock(HARNESS_START);
    const config = testConfig(options.environment);

    const apiApp = (
      await compile([ApiModule.forRoot(config), ...(options.apiModules ?? [])], { clock })
    ).createNestApplication({ logger: false });
    configureApi(apiApp, config);
    await apiApp.listen(0, '127.0.0.1');
    const { port } = (apiApp.getHttpServer() as Server).address() as AddressInfo;

    const apiUrl = `http://127.0.0.1:${String(port)}`;
    const harness = new OmnivaHarness(
      createApiClient(apiUrl),
      clock,
      config,
      apiApp,
      apiUrl,
      options,
    );
    await harness.startWorker();
    await harness.mail.clear();
    return harness;
  }

  /** A new person using Omniva through the web app, with no session yet. */
  visitor(): Visitor {
    return new Visitor(this.apiUrl, this.config.webOrigin);
  }

  /** The API's OpenAPI document, built from the running application's routes. */
  openApiDocument(): OpenAPIObject {
    return buildOpenApiDocument(this.apiApp);
  }

  /**
   * The API's own scoped database access, for tests that bypass the application gate to prove
   * PostgreSQL refuses other workspaces' rows by itself (ADR 0018).
   */
  scopedDatabase(): ScopedDatabase {
    return this.apiApp.get(ScopedDatabase);
  }

  /** The API's own database connection with no scope at all, as a forgetful query would use it. */
  unscopedDatabase(): DatabaseClient {
    return this.apiApp.get(DatabaseClient);
  }

  /**
   * Waits until the worker has passed on every record change notification queued so far, so
   * what derives from records, such as the reminder schedule, has caught up.
   */
  async recordChangesPassedOn(): Promise<void> {
    const deadline = Date.now() + RECORD_CHANGES_TIMEOUT_MS;
    while ((await pendingJobs(RECORD_CHANGE_QUEUE)) > 0) {
      if (Date.now() > deadline) throw new Error('Record changes were not passed on in time');
      await sleep(RECORD_CHANGES_POLL_MS);
    }
  }

  /**
   * Queues a record change notification again, as when pg-boss delivers a job a second time
   * (it delivers at least once).
   */
  async queueRecordChangeAgain(notification: RecordChangeNotification): Promise<void> {
    await this.apiApp.get(JobQueue).send(RECORD_CHANGE_QUEUE, notification);
  }

  /**
   * Runs one full reminder check in the worker after any in progress, and waits for it: the
   * worker also checks on its own timer, so this only makes "has it checked since?" certain.
   */
  async remindersChecked(): Promise<void> {
    if (!this.worker) throw new Error('The worker is not running');
    await remindersCheckedIn(this.worker);
  }

  async startWorker(): Promise<void> {
    if (this.worker) return;
    this.worker = await this.newWorker(this.workerOptions.workerEmailSender);
  }

  /** A second worker beside the first, sending its email with the real sender. */
  async startAnotherWorker(): Promise<AnotherWorker> {
    const worker = await this.newWorker(undefined);
    return {
      remindersChecked: () => remindersCheckedIn(worker),
      stop: () => worker.close(),
    };
  }

  async stopWorker(): Promise<void> {
    await this.worker?.close();
    this.worker = undefined;
  }

  async stop(): Promise<void> {
    await this.stopWorker();
    await this.apiApp.close();
  }

  private async newWorker(emailSender: EmailSender | undefined): Promise<TestingModule> {
    const worker = await compile(
      [WorkerModule.forRoot(this.config), ...(this.workerOptions.workerModules ?? [])],
      { clock: this.clock, emailSender },
    );
    worker.useLogger(false);
    await worker.init();
    return worker;
  }
}

async function remindersCheckedIn(worker: TestingModule): Promise<void> {
  await worker.get(ReminderDueCheck, { strict: false }).runNow();
}

/** Jobs on the queue not yet done, read straight from pg-boss's table. */
async function pendingJobs(queue: string): Promise<number> {
  return withDatabaseAdmin(async (admin) => {
    const { rows } = await admin.query<{ pending: number }>(
      `SELECT count(*)::int AS pending FROM pgboss.job
       WHERE name = $1 AND state IN ('created', 'retry', 'active')`,
      [queue],
    );
    return rows[0]?.pending ?? 0;
  });
}

interface Overrides {
  readonly clock: Clock;
  readonly emailSender?: EmailSender | undefined;
}

function compile(
  modules: readonly (DynamicModule | Type)[],
  { clock, emailSender }: Overrides,
): Promise<TestingModule> {
  const builder = Test.createTestingModule({ imports: [...modules] })
    .overrideProvider(Clock)
    .useValue(clock);
  return (
    emailSender === undefined
      ? builder
      : builder.overrideProvider(EmailSender).useValue(emailSender)
  ).compile();
}

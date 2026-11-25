import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
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
import { ScopedDatabase } from '../../../src/platform/database/scoped-database.js';
import { WorkerModule } from '../../../src/worker.module.js';
import { ControllableClock } from './controllable-clock.js';
import { MailCatcher } from './mail-catcher.js';
import { testConfig } from './test-environment.js';
import { Visitor } from './visitor.js';

const HARNESS_START = new Date('2027-03-01T09:00:00.000Z');

export interface HarnessOptions {
  /** Environment overrides, for example pointing Redis at an address where nothing listens. */
  readonly environment?: Readonly<Record<string, string>>;
  /** Extra modules mounted in the API, such as test-only probe endpoints. */
  readonly apiModules?: readonly Type[];
  /** Extra modules mounted in the worker, such as test-only subscribers to record changes. */
  readonly workerModules?: readonly Type[];
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
    private readonly workerModules: readonly Type[],
  ) {}

  static async start(options: HarnessOptions = {}): Promise<OmnivaHarness> {
    const clock = new ControllableClock(HARNESS_START);
    const config = testConfig(options.environment);

    const apiApp = (
      await compileWithClock([ApiModule.forRoot(config), ...(options.apiModules ?? [])], clock)
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
      options.workerModules ?? [],
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

  async startWorker(): Promise<void> {
    if (this.worker) return;
    const worker = await compileWithClock(
      [WorkerModule.forRoot(this.config), ...this.workerModules],
      this.clock,
    );
    worker.useLogger(false);
    await worker.init();
    this.worker = worker;
  }

  async stopWorker(): Promise<void> {
    await this.worker?.close();
    this.worker = undefined;
  }

  async stop(): Promise<void> {
    await this.stopWorker();
    await this.apiApp.close();
  }
}

function compileWithClock(
  modules: readonly (DynamicModule | Type)[],
  clock: Clock,
): Promise<TestingModule> {
  return Test.createTestingModule({ imports: [...modules] })
    .overrideProvider(Clock)
    .useValue(clock)
    .compile();
}

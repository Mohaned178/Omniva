import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import type { DynamicModule, INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { createApiClient, type ApiClient } from '@omniva/api-client';
import { ApiModule } from '../../../src/api.module.js';
import { configureApi } from '../../../src/configure-api.js';
import type { AppConfig } from '../../../src/platform/config/app-config.js';
import { Clock } from '../../../src/platform/clock/clock.js';
import { WorkerModule } from '../../../src/worker.module.js';
import { ControllableClock } from './controllable-clock.js';
import { MailCatcher } from './mail-catcher.js';
import { testConfig } from './test-environment.js';

const HARNESS_START = new Date('2027-03-01T09:00:00.000Z');

export interface HarnessOptions {
  /** Environment overrides, for example pointing Redis at an address where nothing listens. */
  readonly environment?: Readonly<Record<string, string>>;
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
  ) {}

  static async start(options: HarnessOptions = {}): Promise<OmnivaHarness> {
    const clock = new ControllableClock(HARNESS_START);
    const config = testConfig(options.environment);

    const apiApp = (await compileWithClock(ApiModule.forRoot(config), clock)).createNestApplication(
      {
        logger: false,
      },
    );
    configureApi(apiApp, config);
    await apiApp.listen(0, '127.0.0.1');
    const { port } = (apiApp.getHttpServer() as Server).address() as AddressInfo;

    const harness = new OmnivaHarness(
      createApiClient(`http://127.0.0.1:${String(port)}`),
      clock,
      config,
      apiApp,
    );
    await harness.startWorker();
    await harness.mail.clear();
    return harness;
  }

  async startWorker(): Promise<void> {
    if (this.worker) return;
    const worker = await compileWithClock(WorkerModule.forRoot(this.config), this.clock);
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

function compileWithClock(rootModule: DynamicModule, clock: Clock): Promise<TestingModule> {
  return Test.createTestingModule({ imports: [rootModule] })
    .overrideProvider(Clock)
    .useValue(clock)
    .compile();
}

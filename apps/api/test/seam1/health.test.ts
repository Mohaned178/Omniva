import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { OmnivaHarness } from './support/omniva-harness.js';

/** An address where nothing listens, standing in for Redis being down. */
const UNREACHABLE_REDIS_URL = 'redis://127.0.0.1:1';

describe('health', () => {
  describe('while every component is running', () => {
    let omniva: OmnivaHarness;
    beforeAll(async () => {
      omniva = await OmnivaHarness.start();
    });
    afterAll(async () => {
      await omniva.stop();
    });

    it('reports the API, database, Redis and worker all up', async () => {
      const { data, response } = await omniva.api.GET('/v1/health');

      expect(response.status).toBe(200);
      expect(data).toEqual({
        status: 'ok',
        checkedAt: omniva.clock.now().toISOString(),
        components: { api: 'up', database: 'up', redis: 'up', worker: 'up' },
      });
    });

    it('stamps the report with the time on the Omniva clock', async () => {
      omniva.clock.setTo(new Date('2027-06-15T12:30:00.000Z'));

      const { data } = await omniva.api.GET('/v1/health');

      expect(data?.checkedAt).toBe('2027-06-15T12:30:00.000Z');
    });

    it('reports the worker down, and Omniva down, once the worker stops', async () => {
      await omniva.stopWorker();

      const { error, response } = await omniva.api.GET('/v1/health');
      await omniva.startWorker();

      expect(response.status).toBe(503);
      expect(error).toMatchObject({
        status: 'down',
        components: { api: 'up', database: 'up', redis: 'up', worker: 'down' },
      });
    });
  });

  describe('when Redis is unreachable', () => {
    let omniva: OmnivaHarness;
    beforeAll(async () => {
      omniva = await OmnivaHarness.start({ environment: { REDIS_URL: UNREACHABLE_REDIS_URL } });
    });
    afterAll(async () => {
      await omniva.stop();
    });

    it('keeps working, degraded, because Redis is disposable', async () => {
      const { data, response } = await omniva.api.GET('/v1/health');

      expect(response.status).toBe(200);
      expect(data).toMatchObject({
        status: 'degraded',
        components: { api: 'up', database: 'up', redis: 'down', worker: 'up' },
      });
    });
  });
});

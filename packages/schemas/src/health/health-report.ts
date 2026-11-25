import { z } from 'zod';

export const ComponentStatusSchema = z.enum(['up', 'down']);
export type ComponentStatus = z.infer<typeof ComponentStatusSchema>;

/**
 * `degraded` means Omniva still works but more slowly: only Redis is down, and Redis is
 * disposable (ADR 0020). `down` means a component Omniva cannot work without is unreachable.
 */
export const OverallStatusSchema = z.enum(['ok', 'degraded', 'down']);
export type OverallStatus = z.infer<typeof OverallStatusSchema>;

export const HealthReportSchema = z
  .object({
    status: OverallStatusSchema,
    checkedAt: z.iso.datetime(),
    components: z.object({
      api: ComponentStatusSchema,
      database: ComponentStatusSchema,
      redis: ComponentStatusSchema,
      worker: ComponentStatusSchema,
    }),
  })
  .meta({ id: 'HealthReport' });
export type HealthReport = z.infer<typeof HealthReportSchema>;

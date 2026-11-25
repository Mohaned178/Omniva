import type { HealthReport, OverallStatus } from '@omniva/schemas';

/**
 * Omniva is down when anything it cannot work without is down. Redis alone being down only
 * degrades it, because Redis is disposable and the app keeps working without it (ADR 0020).
 */
export function overallStatus(components: HealthReport['components']): OverallStatus {
  const { redis, ...essential } = components;
  if (Object.values(essential).includes('down')) return 'down';
  if (redis === 'down') return 'degraded';
  return 'ok';
}

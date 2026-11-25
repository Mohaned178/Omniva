import type { components } from '@omniva/api-client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type HealthReport = components['schemas']['HealthReport'];

const REFRESH_INTERVAL_MS = 5000;

/**
 * The API's health report. A 503 still carries a report (some component is down); only a
 * network failure, meaning the API itself is unreachable, ends in an error.
 */
export function useHealthReport() {
  return useQuery({
    queryKey: ['health'],
    queryFn: async (): Promise<HealthReport> => {
      const { data, error } = await api.GET('/v1/health');
      return data ?? error;
    },
    refetchInterval: REFRESH_INTERVAL_MS,
    retry: false,
  });
}

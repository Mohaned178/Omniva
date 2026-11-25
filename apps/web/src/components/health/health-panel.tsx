'use client';

import { useFormatter, useTranslations } from 'next-intl';
import { Badge, type BadgeVariant } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type HealthReport, useHealthReport } from './use-health-report';

type DisplayedStatus = HealthReport['components']['api'] | 'unknown' | 'checking';
type ComponentName = 'web' | keyof HealthReport['components'];
type OverallMessage = HealthReport['status'] | 'unreachable' | 'checking';

const COMPONENT_ORDER: readonly ComponentName[] = ['web', 'api', 'database', 'redis', 'worker'];

const BADGE_FOR_STATUS: Readonly<Record<DisplayedStatus, BadgeVariant>> = {
  up: 'success',
  down: 'destructive',
  unknown: 'warning',
  checking: 'outline',
};

export function HealthPanel() {
  const t = useTranslations('health');
  const format = useFormatter();
  const { data: report, isError, isPending } = useHealthReport();

  const statusOf = (name: ComponentName): DisplayedStatus => {
    // This page rendering at all is the proof that the web app is up.
    if (name === 'web') return 'up';
    if (report) return report.components[name];
    if (isPending) return 'checking';
    return name === 'api' ? 'down' : 'unknown';
  };
  const overall: OverallMessage = report?.status ?? (isError ? 'unreachable' : 'checking');

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <p role="status" aria-live="polite" className="font-medium">
          {t(`overall.${overall}`)}
        </p>
        <ul aria-label={t('componentsLabel')} className="divide-y rounded-md border">
          {COMPONENT_ORDER.map((name) => {
            const status = statusOf(name);
            return (
              <li key={name} className="flex items-center justify-between gap-4 px-4 py-3">
                <span>{t(`components.${name}`)}</span>
                <Badge variant={BADGE_FOR_STATUS[status]}>{t(`status.${status}`)}</Badge>
              </li>
            );
          })}
        </ul>
        {report && (
          <p className="text-muted-foreground text-sm">
            {t('checkedAt', {
              time: format.dateTime(new Date(report.checkedAt), { timeStyle: 'medium' }),
            })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

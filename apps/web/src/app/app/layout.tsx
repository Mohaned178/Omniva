import type { ReactNode } from 'react';
import { AppShell } from '@/components/app/app-shell';

/** Every page under /app requires a session; the shell checks it in the browser. */
export default function AppLayout({ children }: { readonly children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}

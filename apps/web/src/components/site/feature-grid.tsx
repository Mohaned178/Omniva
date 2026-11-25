import type { ReactNode } from 'react';

export function FeatureGrid({ children }: { readonly children: ReactNode }) {
  return <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{children}</ul>;
}

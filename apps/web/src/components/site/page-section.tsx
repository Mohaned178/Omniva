import type { ReactNode } from 'react';

export function PageIntro({
  heading,
  intro,
}: {
  readonly heading: string;
  readonly intro?: string;
}) {
  return (
    <div className="mb-10 max-w-2xl">
      <h1 className="text-3xl font-semibold sm:text-4xl">{heading}</h1>
      {intro ? <p className="text-muted-foreground mt-3 text-lg">{intro}</p> : null}
    </div>
  );
}

export function FeatureGrid({ children }: { readonly children: ReactNode }) {
  return <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{children}</ul>;
}

export function FeatureCard({ title, body }: { readonly title: string; readonly body: string }) {
  return (
    <li className="rounded-xl border p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-muted-foreground mt-2 text-sm">{body}</p>
    </li>
  );
}

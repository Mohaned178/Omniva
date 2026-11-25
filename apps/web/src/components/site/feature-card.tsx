export function FeatureCard({ title, body }: { readonly title: string; readonly body: string }) {
  return (
    <li className="rounded-xl border p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-muted-foreground mt-2 text-sm">{body}</p>
    </li>
  );
}

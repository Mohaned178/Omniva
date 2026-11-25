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

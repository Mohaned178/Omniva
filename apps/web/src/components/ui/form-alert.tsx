/** A form-level message, announced as soon as it appears. */
export function FormAlert({ children }: { readonly children: string }) {
  return (
    <p role="alert" className="border-destructive text-destructive rounded-md border p-3 text-sm">
      {children}
    </p>
  );
}

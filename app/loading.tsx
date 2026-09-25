export default function Loading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <div className="relative flex flex-col items-center gap-4">
        <div className="h-16 w-16 rounded-full border-4 border-muted border-t-accent animate-spin" />
        <p className="font-heading text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Loading
        </p>
      </div>
    </div>
  );
}
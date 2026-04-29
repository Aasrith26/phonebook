export default function LoadingPhonebook() {
  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <div className="h-3 w-32 animate-pulse rounded bg-slate-200" />
        <div className="h-8 w-44 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-72 animate-pulse rounded bg-slate-200" />
      </div>
      <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-4">
        <div className="h-10 w-full animate-pulse rounded bg-slate-200" />
      </div>
      <div className="space-y-3 md:hidden">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-4"
          >
            <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
            <div className="mt-2 h-4 w-24 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-16 animate-pulse rounded bg-slate-200" />
          </div>
        ))}
      </div>
      <div className="hidden h-48 rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-4 md:block">
        <div className="h-full animate-pulse rounded bg-slate-200" />
      </div>
    </section>
  );
}

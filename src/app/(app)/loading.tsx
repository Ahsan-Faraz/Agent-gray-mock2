// Shown while a page's data loads (instant with mock data; real once the backend is wired up).
export default function Loading() {
  return <div className="animate-pulse" aria-busy="true" aria-label="Loading">
    <div className="h-8 w-56 rounded-lg bg-line" />
    <div className="mt-3 h-4 w-80 max-w-full rounded bg-line" />
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[0, 1, 2, 3].map((item) => <div key={item} className="h-28 rounded-2xl border border-line bg-surface" />)}
    </div>
    <div className="mt-4 h-72 rounded-2xl border border-line bg-surface" />
  </div>;
}

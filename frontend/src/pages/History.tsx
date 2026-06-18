import { InterviewCard } from "../components/interview/InterviewCard";
import { Card } from "../components/ui/Card";
import { useInterviews } from "../hooks/useInterviews";

export function HistoryPage() {
  const { items, total, loading, error } = useInterviews();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Interview history</h1>
        <p className="mt-1 text-sm text-slate-600">Browse all uploaded interviews and revisit past sessions.</p>
      </div>

      <Card>
        <p className="text-sm text-slate-500">Total recordings</p>
        <p className="mt-1 text-2xl font-bold text-slate-900">{total}</p>
      </Card>

      {loading ? <p className="text-sm text-slate-500">Loading history...</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {!loading && items.length === 0 ? (
        <Card title="No history yet">
          <p className="text-sm text-slate-600">Your uploaded interviews will appear here.</p>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((interview) => (
            <InterviewCard key={interview.id} interview={interview} />
          ))}
        </div>
      )}
    </div>
  );
}

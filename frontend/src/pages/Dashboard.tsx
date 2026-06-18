import { Link } from "react-router-dom";
import { InterviewCard } from "../components/interview/InterviewCard";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useInterviews } from "../hooks/useInterviews";

export function DashboardPage() {
  const { items, total, loading, error } = useInterviews();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">
            Upload interview recordings and track your communication improvements.
          </p>
        </div>
        <Link to="/upload">
          <Button>Upload interview</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Total interviews</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{total}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Completed</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {items.filter((item) => item.status === "completed").length}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">In progress</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {items.filter((item) => item.status === "processing" || item.status === "pending").length}
          </p>
        </Card>
      </div>

      {loading ? <p className="text-sm text-slate-500">Loading interviews...</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {!loading && items.length === 0 ? (
        <Card title="No interviews yet">
          <p className="text-sm text-slate-600">
            Upload your first mock interview recording to generate transcript and analytics.
          </p>
          <Link to="/upload" className="mt-4 inline-block">
            <Button>Upload your first interview</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.slice(0, 6).map((interview) => (
            <InterviewCard key={interview.id} interview={interview} />
          ))}
        </div>
      )}
    </div>
  );
}

import { FillerRateTrend, PaceTrend, ScoreTrendChart } from "../components/progress/ScoreTrendChart";
import { Card } from "../components/ui/Card";
import { useProgress } from "../hooks/useProgress";

export function ProgressPage() {
  const { progress, loading, error } = useProgress();

  if (loading) return <p className="text-sm text-slate-500">Loading progress...</p>;
  if (error || !progress) return <p className="text-sm text-red-600">{error ?? "Progress unavailable"}</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Progress analytics</h1>
        <p className="mt-1 text-sm text-slate-600">Track improvement across completed interviews.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Average score</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{progress.average_score}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Average pace</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{progress.average_speaking_rate} WPM</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Average filler words</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{progress.average_filler_count}</p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Score trend">
          <ScoreTrendChart history={progress.history} />
        </Card>
        <Card title="Filler word trend">
          <FillerRateTrend history={progress.history} />
        </Card>
        <Card title="Speaking pace trend" className="lg:col-span-2">
          <PaceTrend history={progress.history} />
        </Card>
      </div>
    </div>
  );
}

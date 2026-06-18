import { Link, useParams } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useAnalytics } from "../hooks/useAnalytics";

export function FeedbackPage() {
  const { id } = useParams();
  const interviewId = Number(id);
  const { analytics, loading, error } = useAnalytics(interviewId);

  if (loading) return <p className="text-sm text-slate-500">Loading feedback...</p>;
  if (error || !analytics) return <p className="text-sm text-red-600">{error ?? "Feedback unavailable"}</p>;

  const paragraphs = analytics.feedback.split("\n\n").filter(Boolean);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI feedback</h1>
          <p className="mt-1 text-sm text-slate-600">
            Actionable coaching based on your speaking pace, filler words, and pauses.
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center">
          <p className="text-xs uppercase tracking-wide text-emerald-700">Score</p>
          <p className="text-3xl font-bold text-emerald-700">{analytics.overall_score}</p>
        </div>
      </div>

      <Card title="Summary metrics">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase text-slate-500">Speaking rate</p>
            <p className="text-lg font-semibold">{analytics.speaking_rate.toFixed(1)} WPM</p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-500">Filler words</p>
            <p className="text-lg font-semibold">{analytics.filler_count}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-500">Pauses</p>
            <p className="text-lg font-semibold">{analytics.pause_count}</p>
          </div>
        </div>
      </Card>

      <Card title="Coaching feedback">
        <div className="space-y-4">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="leading-7 text-slate-700">
              {paragraph}
            </p>
          ))}
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link to={`/interviews/${interviewId}/analytics`}>
          <Button variant="secondary">View analytics</Button>
        </Link>
        <Link to="/dashboard">
          <Button variant="ghost">Back to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}

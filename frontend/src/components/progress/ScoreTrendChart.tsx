import type { ProgressPoint } from "../../types/analytics";

interface ScoreTrendChartProps {
  history: ProgressPoint[];
}

export function ScoreTrendChart({ history }: ScoreTrendChartProps) {
  if (history.length === 0) {
    return <p className="text-sm text-slate-500">Complete an interview to see score trends.</p>;
  }

  const maxScore = 100;

  return (
    <div className="flex h-40 items-end gap-3">
      {history.map((point) => (
        <div key={point.interview_id} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-32 w-full items-end rounded-t-lg bg-slate-100">
            <div
              className="w-full rounded-t-lg bg-brand-600"
              style={{ height: `${(point.overall_score / maxScore) * 100}%` }}
            />
          </div>
          <span className="text-xs text-slate-500">{point.overall_score}</span>
        </div>
      ))}
    </div>
  );
}

export function FillerRateTrend({ history }: ScoreTrendChartProps) {
  if (history.length === 0) {
    return <p className="text-sm text-slate-500">No filler data yet.</p>;
  }

  const max = Math.max(...history.map((point) => point.filler_count), 1);

  return (
    <div className="space-y-2">
      {history.map((point) => (
        <div key={point.interview_id}>
          <div className="mb-1 flex justify-between text-xs text-slate-500">
            <span className="truncate">{point.title}</span>
            <span>{point.filler_count}</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-amber-500"
              style={{ width: `${(point.filler_count / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PaceTrend({ history }: ScoreTrendChartProps) {
  if (history.length === 0) {
    return <p className="text-sm text-slate-500">No pace data yet.</p>;
  }

  return (
    <ul className="space-y-2 text-sm">
      {history.map((point) => (
        <li key={point.interview_id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
          <span className="truncate text-slate-700">{point.title}</span>
          <span className="font-medium text-slate-900">{point.speaking_rate.toFixed(1)} WPM</span>
        </li>
      ))}
    </ul>
  );
}

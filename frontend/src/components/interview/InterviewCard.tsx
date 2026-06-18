import { Link } from "react-router-dom";
import type { InterviewSummary } from "../../types/interview";
import { formatDate, formatDuration } from "../../utils/formatters";
import { StatusBadge } from "./StatusBadge";

export function InterviewCard({ interview }: { interview: InterviewSummary }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{interview.title}</h3>
          <p className="mt-1 text-sm text-slate-500">{interview.original_filename}</p>
        </div>
        <StatusBadge status={interview.status} />
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
        <span>{formatDate(interview.created_at)}</span>
        <span>{formatDuration(interview.duration_seconds)}</span>
        {interview.status === "processing" ? <span>{interview.progress_pct}% processed</span> : null}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          to={`/interviews/${interview.id}`}
          className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          View details
        </Link>
        {interview.status === "completed" ? (
          <>
            <Link
              to={`/interviews/${interview.id}/analytics`}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Analytics
            </Link>
            <Link
              to={`/interviews/${interview.id}/feedback`}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              AI feedback
            </Link>
          </>
        ) : null}
      </div>
    </article>
  );
}

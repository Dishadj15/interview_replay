import { useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { ProcessingPoller } from "../components/interview/ProcessingPoller";
import { StatusBadge } from "../components/interview/StatusBadge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useInterview } from "../hooks/useInterview";
import { useInterviews } from "../hooks/useInterviews";
import { formatDate, formatDuration } from "../utils/formatters";

export function InterviewDetailPage() {
  const { id } = useParams();
  const interviewId = Number(id);
  const { interview, loading, error } = useInterview(interviewId);
  const { refresh } = useInterviews();

  const handleComplete = useCallback(() => {
    void refresh();
    window.location.reload();
  }, [refresh]);

  if (loading) return <p className="text-sm text-slate-500">Loading interview...</p>;
  if (error || !interview) return <p className="text-sm text-red-600">{error ?? "Interview not found"}</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{interview.title}</h1>
          <p className="mt-1 text-sm text-slate-600">{interview.original_filename}</p>
        </div>
        <StatusBadge status={interview.status} />
      </div>

      <ProcessingPoller interviewId={interview.id} status={interview.status} onComplete={handleComplete} />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Uploaded</p>
          <p className="mt-2 font-medium text-slate-900">{formatDate(interview.created_at)}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Duration</p>
          <p className="mt-2 font-medium text-slate-900">{formatDuration(interview.duration_seconds)}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">File type</p>
          <p className="mt-2 font-medium text-slate-900">{interview.file_type}</p>
        </Card>
      </div>

      {interview.error_message ? (
        <Card title="Processing error">
          <p className="text-sm text-red-700">{interview.error_message}</p>
        </Card>
      ) : null}

      {interview.transcript ? (
        <Card title="Transcript">
          <p className="whitespace-pre-wrap leading-7 text-slate-700">{interview.transcript}</p>
        </Card>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {interview.status === "completed" ? (
          <>
            <Link to={`/interviews/${interview.id}/analytics`}>
              <Button>View analytics</Button>
            </Link>
            <Link to={`/interviews/${interview.id}/feedback`}>
              <Button variant="secondary">AI feedback</Button>
            </Link>
          </>
        ) : null}
        <Link to="/history">
          <Button variant="ghost">Back to history</Button>
        </Link>
      </div>
    </div>
  );
}

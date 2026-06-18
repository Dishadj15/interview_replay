import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getTimeline, getTranscript } from "../api/analytics";
import { FillerWordChart } from "../components/analytics/FillerWordChart";
import { InterviewTimeline } from "../components/analytics/InterviewTimeline";
import { PaceIndicator } from "../components/analytics/PaceIndicator";
import { PauseList } from "../components/analytics/PauseList";
import { TranscriptViewer } from "../components/analytics/TranscriptViewer";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useAnalytics } from "../hooks/useAnalytics";
import type { TimelineEvent } from "../types/analytics";

export function AnalyticsPage() {
  const { id } = useParams();
  const interviewId = id ? Number(id) : null;
  const isAggregate = interviewId === null;
  const { analytics, loading, error } = useAnalytics(interviewId);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [transcriptText, setTranscriptText] = useState("");
  const [wordTimestamps, setWordTimestamps] = useState<{ word: string; start: number; end: number }[]>([]);

  useEffect(() => {
    if (isAggregate || !analytics || !interviewId) return;
    getTimeline(interviewId)
      .then((response) => setTimeline(response.events))
      .catch(() => setTimeline([]));
    getTranscript(interviewId)
      .then((response) => {
        setTranscriptText(response.full_text);
        setWordTimestamps(response.word_timestamps);
      })
      .catch(() => {
        setTranscriptText("");
        setWordTimestamps([]);
      });
  }, [analytics, interviewId, isAggregate]);

  if (isAggregate) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Interview analytics</h1>
        <Card>
          <p className="text-sm text-slate-600">
            Open a completed interview from your dashboard or history to view detailed analytics.
          </p>
          <Link to="/history" className="mt-4 inline-block">
            <Button variant="secondary">Browse interview history</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (loading) return <p className="text-sm text-slate-500">Loading analytics...</p>;
  if (error || !analytics) return <p className="text-sm text-red-600">{error ?? "Analytics unavailable"}</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Interview analytics</h1>
          <p className="mt-1 text-sm text-slate-600">Detailed communication metrics for interview #{interviewId}</p>
        </div>
        <div className="rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-center">
          <p className="text-xs uppercase tracking-wide text-brand-700">Overall score</p>
          <p className="text-3xl font-bold text-brand-700">{analytics.overall_score}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <PaceIndicator speakingRate={analytics.speaking_rate} />
        <Card>
          <p className="text-sm text-slate-500">Filler words</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{analytics.filler_count}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Pauses detected</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{analytics.pause_count}</p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Filler word breakdown">
          <FillerWordChart breakdown={analytics.filler_word_breakdown} />
        </Card>
        <Card title="Pause timeline">
          <PauseList pauses={analytics.pauses} />
        </Card>
      </div>

      <Card title="Interactive timeline">
        <InterviewTimeline events={timeline} />
      </Card>

      <Card title="Transcript">
        <TranscriptViewer
          text={transcriptText}
          wordTimestamps={wordTimestamps}
          fillerWords={analytics.filler_word_breakdown}
        />
      </Card>

      <Link to={`/interviews/${interviewId}/feedback`}>
        <Button>View AI feedback</Button>
      </Link>
    </div>
  );
}

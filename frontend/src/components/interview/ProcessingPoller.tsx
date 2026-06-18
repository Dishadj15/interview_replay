import { useEffect } from "react";
import { useProcessingStatus } from "../../hooks/useProcessingStatus";
import type { InterviewStatus } from "../../types/interview";

interface ProcessingPollerProps {
  interviewId: number;
  status: InterviewStatus;
  onComplete?: () => void;
}

export function ProcessingPoller({ interviewId, status, onComplete }: ProcessingPollerProps) {
  const enabled = status === "pending" || status === "processing";
  const liveStatus = useProcessingStatus(interviewId, enabled);

  useEffect(() => {
    if (liveStatus?.status === "completed" || liveStatus?.status === "failed") {
      onComplete?.();
    }
  }, [liveStatus?.status, onComplete]);

  const progress = liveStatus?.progress_pct ?? 0;
  const currentStatus = liveStatus?.status ?? status;

  if (!enabled && currentStatus !== "processing") {
    return null;
  }

  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-blue-900">Processing interview</span>
        <span className="text-blue-700">{progress}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-blue-100">
        <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
      </div>
      {liveStatus?.eta_seconds ? (
        <p className="mt-2 text-xs text-blue-700">Estimated time remaining: {liveStatus.eta_seconds}s</p>
      ) : null}
      {liveStatus?.error_message ? (
        <p className="mt-2 text-xs text-red-700">{liveStatus.error_message}</p>
      ) : null}
    </div>
  );
}
